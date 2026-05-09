# MONOPOL STUDIO - Production Deployment Guide

## Prerequisites

- Kubernetes cluster (EKS, GKE, or AKS)
- kubectl configured
- Docker images pushed to registry
- SSL certificates ready
- Domain configured

## Step 1: Prepare Infrastructure

### Create K8s Cluster

```bash
# AWS EKS
aws eks create-cluster \
  --name monopol-cluster \
  --version 1.28 \
  --roleArn arn:aws:iam::ACCOUNT:role/eks-service-role \
  --resourcesVpcConfig subnetIds=subnet-1,subnet-2

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name monopol-cluster
```

### Deploy RDS & ElastiCache

```bash
# Use Terraform
cd infrastructure/terraform
terraform init
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars
```

## Step 2: Configure Secrets

```bash
# Create namespace
kubectl create namespace monopol

# Create secrets
kubectl create secret generic monopol-secrets \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=redis-url=$REDIS_URL \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=openai-key=$OPENAI_API_KEY \
  --from-literal=replicate-token=$REPLICATE_TOKEN \
  -n monopol
```

## Step 3: Deploy Application

```bash
# Apply K8s manifests
kubectl apply -f infrastructure/k8s/production.yaml

# Verify deployment
kubectl get deployments -n monopol
kubectl get pods -n monopol
```

## Step 4: Configure Ingress

```bash
# Install Nginx Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress ingress-nginx/ingress-nginx -n monopol

# Create Ingress resource
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: monopol-ingress
  namespace: monopol
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.monopolstudio.com
    secretName: monopol-tls
  rules:
  - host: api.monopolstudio.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: monopol-api
            port:
              number: 80
EOF
```

## Step 5: Monitor & Log

### Setup Monitoring

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monopol

# Install Grafana
helm install grafana grafana/grafana -n monopol

# Port forward
kubectl port-forward -n monopol svc/grafana 3000:80
```

### Setup Logging

```bash
# Install ELK Stack or use CloudWatch
# For AWS, configure CloudWatch Container Insights

# View logs
kubectl logs -f deployment/monopol-api -n monopol
```

## Step 6: Database Migrations

```bash
# Create migration pod
kubectl run migration \
  --image=monopol-api:latest \
  --env="DATABASE_URL=$DATABASE_URL" \
  --command -- npm run db:push \
  -n monopol

# Wait for completion
kubectl logs -f pod/migration -n monopol
```

## Step 7: DNS & Certificate

```bash
# Update DNS to point to LoadBalancer
kubectl get svc monopol-api -n monopol -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# SSL certificate via Let's Encrypt
# Already configured in Ingress resource above
```

## Scaling

### Horizontal Pod Autoscaler

```bash
# Already configured in production.yaml
# Scales based on CPU and memory usage
kubectl get hpa -n monopol
```

### Manual Scaling

```bash
kubectl scale deployment monopol-api --replicas=5 -n monopol
```

## Maintenance

### Rolling Updates

```bash
kubectl set image deployment/monopol-api \
  monopol-api=monopol-api:1.2.0 \
  -n monopol

kubectl rollout status deployment/monopol-api -n monopol
```

### Backup Database

```bash
# Using AWS RDS automated backups (7-day retention configured)
# Or manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier monopol-postgres \
  --db-snapshot-identifier monopol-backup-$(date +%Y%m%d)
```

## Troubleshooting

### Check Pod Status
```bash
kubectl describe pod POD_NAME -n monopol
kubectl logs POD_NAME -n monopol
```

### Debug Connectivity
```bash
kubectl exec -it POD_NAME -n monopol -- bash
ping monopol-postgres.c.PROJECT.internal
```

### View Events
```bash
kubectl get events -n monopol --sort-by='.lastTimestamp'
```

## Rollback

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/monopol-api -n monopol

# Check history
kubectl rollout history deployment/monopol-api -n monopol
```

## Cost Optimization

- Use spot instances for non-critical workloads
- Enable cluster autoscaler
- Set resource requests/limits
- Use ARM-based instances (t4g)
- Schedule batch jobs during off-peak

## Monitoring Dashboard

Access Grafana at: `https://grafana.monopolstudio.com`

Key metrics to monitor:
- API response latency (p50, p95, p99)
- Error rate
- CPU and memory usage
- Database query times
- Cache hit ratio
- Render queue depth

---

**MONOPOL STUDIO - Production Deployment**
