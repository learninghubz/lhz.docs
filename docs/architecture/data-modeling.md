---
sidebar_position: 2
title: Data Modeling
description: Azure Cosmos DB data modeling strategies
---

# Data Modeling with Cosmos DB

This guide explains the data modeling strategies used in LearningHubz with Azure Cosmos DB.

## Hierarchical Partition Keys

LearningHubz uses hierarchical partition keys (HPK) to optimize data distribution and query performance.

### Benefits
- **Overcome 20 GB limit** - Traditional single partition key limit
- **Flexible queries** - Query across related partitions efficiently
- **Better scale** - More granular data distribution

### Example Structure
```json
{
  "id": "user-123-course-456",
  "partitionKey": ["/tenantId/user-123", "/courseId/course-456"],
  "userId": "user-123",
  "courseId": "course-456",
  "progress": 75,
  "lastAccessed": "2026-02-23T10:00:00Z"
}
```

## Container Design

### Users Container
Stores user profiles and authentication data:
```json
{
  "id": "user-123",
  "partitionKey": "/userId/user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["learner", "instructor"],
  "created": "2025-01-01T00:00:00Z"
}
```

### Content Container
Stores courses, lessons, and learning materials:
```json
{
  "id": "course-456",
  "partitionKey": ["/tenantId/org-1", "/courseId/course-456"],
  "title": "Introduction to TypeScript",
  "description": "Learn TypeScript basics",
  "lessons": [...],
  "instructorId": "user-789"
}
```

### Analytics Container
Stores user activity and progress tracking:
```json
{
  "id": "analytics-123",
  "partitionKey": ["/userId/user-123", "/eventType/progress"],
  "userId": "user-123",
  "courseId": "course-456",
  "eventType": "progress",
  "timestamp": "2026-02-23T10:00:00Z",
  "data": { "progress": 75 }
}
```

## Query Optimization

### Cross-Partition Queries
Minimize cross-partition queries by:
- Designing partition keys based on access patterns
- Using hierarchical partition keys for related data
- Implementing pagination for large result sets

### Indexing Strategy
```javascript
{
  "indexingMode": "consistent",
  "automatic": true,
  "includedPaths": [
    { "path": "/*" }
  ],
  "excludedPaths": [
    { "path": "/\"_etag\"/?" }
  ]
}
```

## Best Practices

1. **Embed related data** that is always accessed together
2. **Normalize data** that is frequently updated independently
3. **Use TTL** for temporary or time-sensitive data
4. **Monitor RU consumption** and adjust indexing policies
5. **Design for scale** from the beginning

## Next Steps

- [System Overview](./overview) - Understand the full architecture
- [Export API](/docs/api-reference/export-api) - Learn about data export options
