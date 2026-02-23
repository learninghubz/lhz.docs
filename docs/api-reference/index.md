---
sidebar_position: 1
title: API Reference
description: LearningHubz REST API documentation
---

# API Reference

Welcome to the LearningHubz API Reference. This section provides comprehensive documentation for integrating with the LearningHubz platform via REST APIs.

## Available APIs

### Export API
- [Export API Documentation](./export-api) - Learn how to export content and data from LearningHubz

## Authentication

All API requests require authentication using Bearer tokens. Include your API token in the Authorization header:

```http
Authorization: Bearer YOUR_API_TOKEN
```

## Base URLs

- **Production**: `https://api.learninghubz.com`
- **Development**: `http://localhost:3000/api`

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Rate Limiting

API requests are rate limited to:
- **Free tier**: 100 requests/hour
- **Pro tier**: 1,000 requests/hour
- **Enterprise**: Custom limits

## API Sections

More API documentation coming soon:

- Authentication & Authorization
- Content Management
- User Management
- Analytics & Reporting
- Webhooks

## Support

For API support, please contact:
- Email: api-support@learninghubz.com
- GitHub Issues: [Report an issue](https://github.com/learninghubz/learninghubz2..0/issues)
