data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "monopol-rds-sg"
  vpc_id      = aws_vpc.main.id
  description = "Security group for RDS"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group for Redis
resource "aws_security_group" "redis" {
  name        = "monopol-redis-sg"
  vpc_id      = aws_vpc.main.id
  description = "Security group for Redis"

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "monopol-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "monopol-db-subnet"
  }
}

# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "monopol-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}
