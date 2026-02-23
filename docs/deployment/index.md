---
sidebar_position: 1
title: Deployment
description: Deploy LearningHubz to production
---

# Deployment Guide

This guide covers deploying LearningHubz to production environments, with a focus on Azure deployment.

## Deployment Methods

### 1. Vercel (Recommended for Next.js)

Vercel provides seamless Next.js deployment with automatic builds and previews.

#### Quick Deploy

```bash
npm install -g vercel
vercel login
vercel
```

#### Environment Variables

Configure in Vercel Dashboard:
- `COSMOS_DB_ENDPOINT`
- `COSMOS_DB_KEY`
- `AZURE_SEARCH_ENDPOINT`
- `AZURE_SEARCH_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### 2. Azure Static Web Apps

Deploy to Azure Static Web Apps with integrated API support.

```bash
# Install Azure CLI
brew install azure-cli

# Login to Azure
az login

# Create Static Web App
az staticwebapp create \
  --name learninghubz \
  --resource-group myResourceGroup \
  --location "East US"
```

### 3. Azure App Service

For more control, deploy to Azure App Service:

```bash
# Create App Service plan
az appservice plan create \
  --name myPlan \
  --resource-group myResourceGroup \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name learninghubz \
  --resource-group myResourceGroup \
  --plan myPlan \
  --runtime "NODE:18-lts"

# Deploy
az webapp deployment source config-zip \
  --name learninghubz \
  --resource-group myResourceGroup \
  --src ./build.zip
```

## Infrastructure Setup

### Azure Resources Required

1. **Azure Cosmos DB**
   - Database account with SQL API
   - Hierarchical partition keys enabled
   - Multi-region replication (optional)

2. **Azure Search**
   - Search service instance
   - Indexes configured
   - Vector search enabled (optional)

3. **Azure SignalR Service**
   - SignalR service instance
   - Connection string configured

4. **Azure Storage**
   - Blob storage for assets
   - CDN integration (optional)

### Infrastructure as Code

#### Bicep Template

```bicep
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: 'learninghubz-cosmos'
  location: location
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
  }
}

resource searchService 'Microsoft.Search/searchServices@2023-11-01' = {
  name: 'learninghubz-search'
  location: location
  sku: {
    name: 'standard'
  }
}
```

## CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
        env:
          COSMOS_DB_ENDPOINT: ${{ secrets.COSMOS_DB_ENDPOINT }}
          COSMOS_DB_KEY: ${{ secrets.COSMOS_DB_KEY }}
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Environment Configuration

### Production Checklist

- [ ] Environment variables configured
- [ ] Database connection strings secured
- [ ] API keys rotated
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Monitoring and logging configured
- [ ] CDN configured for static assets
- [ ] SSL/TLS certificates active
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented

## Monitoring

### Application Insights

Configure Azure Application Insights for:
- Performance monitoring
- Error tracking
- Custom telemetry
- Alerts and notifications

```javascript
// applicationinsights.js
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .start();
```

## Performance Optimization

1. **CDN Integration** - Serve static assets from CDN
2. **Image Optimization** - Use Next.js Image component
3. **Code Splitting** - Automatic with Next.js
4. **Caching Strategy** - Implement Redis for session data
5. **Database Optimization** - Use Cosmos DB best practices

## Security

- Enable HTTPS only
- Configure CSP headers
- Implement rate limiting
- Use managed identities
- Regular security audits
- Keep dependencies updated

## Rollback Strategy

In case of deployment issues:

```bash
# Vercel rollback
vercel rollback

# Azure App Service
az webapp deployment slot swap \
  --name learninghubz \
  --resource-group myResourceGroup \
  --slot staging \
  --target-slot production
```

## Next Steps

- [Architecture Overview](/docs/architecture/overview) - Understand the system design
- [API Reference](/docs/api-reference) - Integrate with the API
- [Development Guidelines](/docs/development) - Contribute to the project
