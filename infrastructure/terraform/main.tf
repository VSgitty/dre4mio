terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "monopol-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "monopol-studio"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "monopol-vpc"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "monopol-public-${count.index + 1}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 11}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "monopol-private-${count.index + 1}"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier     = "monopol-postgres"
  engine         = "postgres"
  engine_version = "16.1"
  instance_class = var.db_instance_class

  allocated_storage     = 100
  storage_type          = "gp3"
  storage_encrypted     = true
  deletion_protection   = true
  backup_retention_period = 30

  db_name  = "monopol"
  username = "monopoladmin"
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  skip_final_snapshot = false
  final_snapshot_identifier_prefix = "monopol-final-snapshot"

  tags = {
    Name = "monopol-postgres"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "main" {
  cluster_id      = "monopol-redis"
  engine          = "redis"
  node_type       = var.redis_node_type
  num_cache_nodes = 1
  port            = 6379

  engine_version = "7.0"
  
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.redis.id]
  automatic_failover_enabled = false

  tags = {
    Name = "monopol-redis"
  }
}

# S3 Bucket for assets
resource "aws_s3_bucket" "assets" {
  bucket = "monopol-studio-assets-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "monopol-assets"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "assets" {
  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "monopol-assets-s3"
  }

  enabled = true

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    target_origin_id       = "monopol-assets-s3"
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "monopol-cdn"
  }
}

# ECR Repository for Docker images
resource "aws_ecr_repository" "main" {
  for_each = toset(["monopol-api", "monopol-ai"])

  name                 = each.value
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = each.value
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "monopol-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "monopol-cluster"
  }
}

# Output values
output "db_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "s3_bucket" {
  value = aws_s3_bucket.assets.id
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.assets.domain_name
}
