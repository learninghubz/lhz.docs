---
sidebar_position: 2
title: Backend Development
description: Backend development guide for APIs and services
---

# Backend Development Guide

This guide covers backend development for the LearningHubz platform, including API routes, services, and data access patterns.

## Technology Stack

### Core Technologies
- **Next.js API Routes** - Serverless API endpoints
- **TypeScript** - Type-safe backend code
- **Azure Cosmos DB** - NoSQL database with SQL API
- **Azure Search** - Full-text and vector search
- **SignalR** - Real-time communication

### Authentication & Security
- **NextAuth.js** - Authentication framework
- **JWT** - Token-based authentication
- **Azure AD** - Enterprise authentication (optional)

## Project Structure

```
app/api/
├── auth/
│   ├── [...nextauth]/
│   │   └── route.ts        # NextAuth configuration
│   └── register/
│       └── route.ts
├── courses/
│   ├── route.ts            # GET /api/courses, POST /api/courses
│   └── [id]/
│       ├── route.ts        # GET/PUT/DELETE /api/courses/:id
│       └── enroll/
│           └── route.ts
├── users/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── search/
    └── route.ts

services/
├── cosmos/
│   ├── client.ts           # Cosmos DB client
│   ├── courses.ts          # Course operations
│   ├── users.ts            # User operations
│   └── analytics.ts        # Analytics operations
├── search/
│   ├── client.ts           # Azure Search client
│   └── indexer.ts          # Search indexing
└── signalr/
    └── client.ts           # SignalR client

lib/
├── cosmos/
│   ├── config.ts           # Cosmos DB configuration
│   └── utils.ts            # Helper functions
└── auth/
    └── config.ts           # Auth configuration
```

## API Route Development

### Creating an API Route

```typescript
// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getCourses, createCourse } from '@/services/cosmos/courses';

// GET /api/courses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    const courses = await getCourses({ category, limit });

    return NextResponse.json({ 
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.roles?.includes('instructor')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const course = await createCourse({
      ...body,
      instructorId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: course,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Dynamic Route Parameters

```typescript
// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = await getCourseById(params.id);
  
  if (!course) {
    return NextResponse.json(
      { error: 'Course not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: course });
}
```

## Azure Cosmos DB Integration

### Setting Up the Client

```typescript
// services/cosmos/client.ts
import { CosmosClient, Database, Container } from '@azure/cosmos';

const endpoint = process.env.COSMOS_DB_ENDPOINT!;
const key = process.env.COSMOS_DB_KEY!;

export const cosmosClient = new CosmosClient({ endpoint, key });
export const database = cosmosClient.database('learninghubz');

// Container references
export const containers = {
  courses: database.container('courses'),
  users: database.container('users'),
  enrollments: database.container('enrollments'),
  analytics: database.container('analytics'),
} as const;
```

### CRUD Operations

```typescript
// services/cosmos/courses.ts
import { containers } from './client';

interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  categoryId: string;
  createdAt: string;
}

// Create
export async function createCourse(course: Omit<Course, 'id' | 'createdAt'>) {
  const newCourse = {
    id: crypto.randomUUID(),
    ...course,
    createdAt: new Date().toISOString(),
  };

  const { resource } = await containers.courses.items.create(newCourse);
  return resource;
}

// Read
export async function getCourseById(id: string) {
  try {
    const { resource } = await containers.courses.item(id, id).read();
    return resource;
  } catch (error: any) {
    if (error.code === 404) return null;
    throw error;
  }
}

// Query with hierarchical partition keys
export async function getCoursesByInstructor(instructorId: string) {
  const querySpec = {
    query: 'SELECT * FROM c WHERE c.instructorId = @instructorId',
    parameters: [
      { name: '@instructorId', value: instructorId },
    ],
  };

  const { resources } = await containers.courses.items
    .query(querySpec)
    .fetchAll();

  return resources;
}

// Update
export async function updateCourse(id: string, updates: Partial<Course>) {
  const existing = await getCourseById(id);
  if (!existing) throw new Error('Course not found');

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await containers.courses
    .item(id, id)
    .replace(updated);

  return resource;
}

// Delete
export async function deleteCourse(id: string) {
  await containers.courses.item(id, id).delete();
}
```

### Optimized Queries

```typescript
// Using hierarchical partition keys
export async function getUserCourseProgress(userId: string, courseId: string) {
  const querySpec = {
    query: `
      SELECT * FROM c 
      WHERE c.userId = @userId 
      AND c.courseId = @courseId
    `,
    parameters: [
      { name: '@userId', value: userId },
      { name: '@courseId', value: courseId },
    ],
  };

  const { resources } = await containers.enrollments.items
    .query(querySpec, {
      partitionKey: [userId, courseId], // HPK optimization
    })
    .fetchAll();

  return resources[0];
}
```

### Bulk Operations

```typescript
export async function bulkCreateEnrollments(enrollments: any[]) {
  const operations = enrollments.map(enrollment => ({
    operationType: 'Create' as const,
    resourceBody: {
      id: crypto.randomUUID(),
      ...enrollment,
      createdAt: new Date().toISOString(),
    },
  }));

  const { result } = await containers.enrollments.items.bulk(operations);
  return result;
}
```

## Azure Search Integration

### Search Client Setup

```typescript
// services/search/client.ts
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';

const endpoint = process.env.AZURE_SEARCH_ENDPOINT!;
const apiKey = process.env.AZURE_SEARCH_KEY!;

export const searchClient = new SearchClient(
  endpoint,
  'courses-index',
  new AzureKeyCredential(apiKey)
);
```

### Search Operations

```typescript
// services/search/courses.ts
import { searchClient } from './client';

export async function searchCourses(query: string, filters?: {
  category?: string;
  level?: string;
}) {
  const searchResults = await searchClient.search(query, {
    filter: buildFilter(filters),
    select: ['id', 'title', 'description', 'instructor', 'category'],
    top: 20,
    skip: 0,
    includeTotalCount: true,
    highlightFields: ['title', 'description'],
  });

  const results = [];
  for await (const result of searchResults.results) {
    results.push(result);
  }

  return {
    results,
    count: searchResults.count,
  };
}

function buildFilter(filters: any) {
  const conditions = [];
  
  if (filters?.category) {
    conditions.push(`category eq '${filters.category}'`);
  }
  
  if (filters?.level) {
    conditions.push(`level eq '${filters.level}'`);
  }
  
  return conditions.length > 0 ? conditions.join(' and ') : undefined;
}
```

### Vector Search

```typescript
export async function vectorSearch(embedding: number[]) {
  const searchResults = await searchClient.search('*', {
    vectorQueries: [{
      kind: 'vector',
      vector: embedding,
      kNearestNeighborsCount: 10,
      fields: ['contentVector'],
    }],
  });

  const results = [];
  for await (const result of searchResults.results) {
    results.push(result);
  }

  return results;
}
```

## Authentication & Authorization

### NextAuth Configuration

```typescript
// lib/auth/config.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { verifyPassword } from '@/lib/auth/password';
import { getUserByEmail } from '@/services/cosmos/users';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);
        if (!user) return null;

        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
        };
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
};
```

### Protected API Routes

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/api/courses/:path*', '/api/users/:path*'],
};
```

### Role-Based Access Control

```typescript
// lib/auth/rbac.ts
export function hasRole(session: any, role: string) {
  return session?.user?.roles?.includes(role);
}

export function requireRole(session: any, role: string) {
  if (!hasRole(session, role)) {
    throw new Error('Insufficient permissions');
  }
}

// Usage in API route
import { requireRole } from '@/lib/auth/rbac';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  requireRole(session, 'instructor');
  
  // ... proceed with operation
}
```

## Error Handling

### Standard Error Response

```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
```

## Testing

### API Route Tests

```typescript
// __tests__/api/courses.test.ts
import { GET, POST } from '@/app/api/courses/route';
import { NextRequest } from 'next/server';

jest.mock('@/services/cosmos/courses');

describe('/api/courses', () => {
  it('returns courses list', async () => {
    const request = new NextRequest('http://localhost:3000/api/courses');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

## Performance Optimization

### Caching

```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return cached as T;

  const data = await fetcher();
  await redis.setex(key, ttl, data);
  return data;
}
```

### Request Deduplication

```typescript
import { cache } from 'react';

export const getCourses = cache(async () => {
  // This function will be called only once per request
  return await fetchCoursesFromDB();
});
```

## Monitoring & Logging

### Application Insights

```typescript
// lib/monitoring/appinsights.ts
import * as appInsights from 'applicationinsights';

appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .start();

export const telemetryClient = appInsights.defaultClient;

// Track custom events
export function trackEvent(name: string, properties?: any) {
  telemetryClient.trackEvent({ name, properties });
}
```

## Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Azure Cosmos DB Node.js SDK](https://docs.microsoft.com/azure/cosmos-db/sql/sql-api-nodejs-get-started)
- [Azure Search Node.js SDK](https://docs.microsoft.com/azure/search/search-get-started-nodejs)
- [NextAuth.js Documentation](https://next-auth.js.org)

## Next Steps

- [Web App Development](../web-app/development-guide) - Frontend development
- [Architecture Overview](/docs/architecture/overview) - System design
- [Deployment Guide](/docs/deployment) - Deploy to production
