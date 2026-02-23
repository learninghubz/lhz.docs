---
sidebar_position: 1
title: Quick Start
description: Get started with backend development
---

# Backend Quick Start

This guide will help you set up your development environment for working on the Learning HubZ backend APIs and services.

## Prerequisites

- **Node.js** version 18.0 or above
- **npm** or **yarn** package manager
- **Git** for version control
- **Azure account** (for cloud services)
- Code editor (VS Code recommended)

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/learninghubz/learninghubz2..0.git
cd learninghubz2..0
```

### 2. Install Dependencies

```bash
npm install
```

This installs backend dependencies including:
- Next.js API Routes
- Azure SDK packages
- NextAuth.js
- And more...

### 3. Configure Environment Variables

Backend development requires Azure service credentials. Create a `.env.local` file:

```bash
# Azure Cosmos DB
COSMOS_DB_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_DB_KEY=your_cosmos_primary_key
COSMOS_DB_DATABASE=learninghubz
COSMOS_DB_CONTAINER=content

# Azure Search (AI Search)
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your_search_admin_key
AZURE_SEARCH_INDEX=content-index

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
NEXTAUTH_URL=http://localhost:3000

# Azure SignalR (Real-time)
SIGNALR_CONNECTION_STRING=Endpoint=https://your-signalr.service.signalr.net;...

# Optional: Additional services
AZURE_STORAGE_CONNECTION_STRING=your_storage_connection
BLOB_STORAGE_CONTAINER=uploads
```

:::tip Getting Azure Credentials
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your resource (Cosmos DB, Search, etc.)
3. Find "Keys" or "Access Keys" in the left menu
4. Copy the endpoint URL and primary key
:::

### 4. Run the Development Server

```bash
npm run dev
```

The API routes are available at `http://localhost:3000/api/*`

## Backend Project Structure

```
learninghubz2..0/
├── app/
│   └── api/                    # API Routes (Backend)
│       ├── auth/               # Authentication endpoints
│       │   └── [...nextauth]/  # NextAuth.js handler
│       ├── resources/          # Resource CRUD operations
│       │   ├── route.js        # GET, POST /api/resources
│       │   └── [id]/           # GET, PUT, DELETE /api/resources/:id
│       ├── search/             # Azure Search integration
│       ├── users/              # User management
│       ├── hubs/               # Hub operations
│       └── analytics/          # Analytics endpoints
├── services/                   # Service Layer
│   ├── cosmosdb.js            # Cosmos DB operations
│   ├── azureSearch.js         # Search operations
│   ├── storage.js             # Blob storage
│   └── signalr.js             # Real-time messaging
├── lib/                       # Backend Utilities
│   ├── auth.js                # Auth helpers
│   ├── validation.js          # Input validation
│   └── errors.js              # Error handling
├── types/                     # TypeScript types
│   ├── api.ts                 # API types
│   └── models.ts              # Data models
└── middleware.js              # Edge middleware
```

## API Route Basics

Next.js API routes are in `/app/api/`. Each `route.js` file exports HTTP method handlers:

```javascript
// app/api/resources/route.js
import { NextResponse } from 'next/server';
import { getResources, createResource } from '@/services/cosmosdb';

// GET /api/resources
export async function GET(request) {
  try {
    const resources = await getResources();
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources
export async function POST(request) {
  try {
    const body = await request.json();
    const resource = await createResource(body);
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
```

## Working with Azure Cosmos DB

### Basic Operations

```javascript
// services/cosmosdb.js
import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
});

const database = client.database(process.env.COSMOS_DB_DATABASE);
const container = database.container(process.env.COSMOS_DB_CONTAINER);

// CREATE
export async function createResource(data) {
  const { resource } = await container.items.create({
    id: generateId(),
    ...data,
    createdAt: new Date().toISOString(),
  });
  return resource;
}

// READ
export async function getResource(id, partitionKey) {
  const { resource } = await container.item(id, partitionKey).read();
  return resource;
}

// UPDATE
export async function updateResource(id, partitionKey, updates) {
  const { resource } = await container
    .item(id, partitionKey)
    .replace(updates);
  return resource;
}

// DELETE
export async function deleteResource(id, partitionKey) {
  await container.item(id, partitionKey).delete();
}

// QUERY
export async function queryResources(querySpec) {
  const { resources } = await container.items
    .query(querySpec)
    .fetchAll();
  return resources;
}
```

### Query Examples

```javascript
// Simple query
const querySpec = {
  query: 'SELECT * FROM c WHERE c.type = @type',
  parameters: [{ name: '@type', value: 'article' }],
};

// With ordering and limits
const querySpec = {
  query: `
    SELECT TOP 10 *
    FROM c
    WHERE c.userId = @userId
    ORDER BY c.createdAt DESC
  `,
  parameters: [{ name: '@userId', value: userId }],
};

// Cross-partition query (use sparingly)
const querySpec = {
  query: 'SELECT * FROM c WHERE c.status = @status',
  parameters: [{ name: '@status', value: 'published' }],
};
```

:::caution Partition Keys
Always include the partition key when possible to avoid expensive cross-partition queries. Learn more in [Data Modeling](/docs/architecture/data-modeling).
:::

## Working with Azure AI Search

### Indexing Documents

```javascript
// services/azureSearch.js
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX,
  new AzureKeyCredential(process.env.AZURE_SEARCH_KEY)
);

export async function indexResource(resource) {
  const document = {
    id: resource.id,
    title: resource.title,
    content: resource.content,
    type: resource.type,
    tags: resource.tags,
    userId: resource.userId,
    createdAt: resource.createdAt,
  };

  await searchClient.uploadDocuments([document]);
}
```

### Searching

```javascript
export async function searchResources(searchText, filters = {}) {
  const searchResults = await searchClient.search(searchText, {
    filter: filters.type ? `type eq '${filters.type}'` : undefined,
    orderBy: ['createdAt desc'],
    top: 20,
    skip: filters.skip || 0,
    includeTotalCount: true,
    searchFields: ['title', 'content', 'tags'],
    select: ['id', 'title', 'type', 'createdAt'],
  });

  const results = [];
  for await (const result of searchResults.results) {
    results.push(result.document);
  }

  return {
    results,
    count: searchResults.count,
  };
}
```

## Authentication with NextAuth.js

### Configuration

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyUser } from '@/services/auth';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await verifyUser(
          credentials.email,
          credentials.password
        );
        if (user) {
          return user;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
```

### Protected API Routes

```javascript
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // User is authenticated
  const userId = session.user.id;
  // Continue with logic...
}
```

## Error Handling

### Standard Error Response

```javascript
// lib/errors.js
export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleApiError(error) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Usage in Routes

```javascript
import { handleApiError, ApiError } from '@/lib/errors';

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.title) {
      throw new ApiError('Title is required', 400);
    }

    const resource = await createResource(body);
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Testing APIs

### Using curl

```bash
# GET request
curl http://localhost:3000/api/resources

# POST request
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Resource","type":"article"}'

# With authentication
curl http://localhost:3000/api/resources \
  -H "Cookie: next-auth.session-token=your-token"
```

### Using VS Code REST Client

Install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and create a `.http` file:

```http
### Get all resources
GET http://localhost:3000/api/resources

### Create resource
POST http://localhost:3000/api/resources
Content-Type: application/json

{
  "title": "Test Resource",
  "type": "article",
  "content": "This is test content"
}

### Get specific resource
GET http://localhost:3000/api/resources/resource-123
```

## Development Tools

### Monitoring Cosmos DB

Use the [Azure Cosmos DB VS Code extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-cosmosdb) to:
- Browse databases and containers
- View and edit documents
- Run queries directly

### API Logging

Add logging for debugging:

```javascript
export async function GET(request) {
  console.log('GET /api/resources', {
    url: request.url,
    headers: Object.fromEntries(request.headers),
  });

  try {
    const resources = await getResources();
    console.log(`Fetched ${resources.length} resources`);
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}
```

### Database Debugging

```javascript
// Enable Cosmos DB diagnostics
const { resource, diagnostics } = await container.item(id, pk).read();
console.log('Request charge:', diagnostics.requestCharge);
console.log('Request duration:', diagnostics.requestDuration);
```

## Common Issues

### Cosmos DB Connection Failed

- Verify `COSMOS_DB_ENDPOINT` and `COSMOS_DB_KEY` are correct
- Check firewall rules in Azure Portal
- Ensure your IP is allowed in Cosmos DB settings

### Search Results Empty

- Verify documents have been indexed
- Check index schema matches your documents
- Allow time for indexing to complete (can take a few seconds)

### Authentication Not Working

- Ensure `NEXTAUTH_SECRET` is set (min 32 characters)
- Check `NEXTAUTH_URL` matches your dev server
- Clear browser cookies and try again

### CORS Issues

For local API testing from other origins:

```javascript
// middleware.js or in route handler
export async function GET(request) {
  const response = NextResponse.json(data);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

## Next Steps

- **[Development Guide](./development-guide)** - Detailed patterns
- **[Data Modeling](/docs/architecture/data-modeling)** - Cosmos DB best practices
- **[API Design](/docs/architecture/api-design)** - API conventions
- **[API Reference](/docs/api-reference)** - Full API documentation

## Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Azure Cosmos DB JavaScript SDK](https://learn.microsoft.com/azure/cosmos-db/nosql/sdk-nodejs)
- [Azure AI Search JavaScript SDK](https://learn.microsoft.com/javascript/api/overview/azure/search-documents-readme)
- [NextAuth.js Documentation](https://next-auth.js.org/)

Happy coding! ⚙️
