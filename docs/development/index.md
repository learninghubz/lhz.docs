---
sidebar_position: 1
title: Development Guide
description: Development guidelines and best practices
---

# Development Guidelines

Welcome to the LearningHubz development guide. This section provides guidelines and best practices for contributing to the project.

## Getting Started

Before you start developing, ensure you've completed the [Quick Start](/docs/getting-started/quickstart) guide.

## Code Style

### TypeScript

We use TypeScript throughout the project for type safety:

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // Implementation
};

// ❌ Avoid
const getUser = async (id) => {
  // No type safety
};
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

## Project Structure

```
learninghubz2..0/
├── app/                    # Next.js App Router
│   ├── (authentication)/   # Auth routes group
│   ├── (main)/            # Main app routes group
│   │   └── [locale]/      # Internationalized routes
│   ├── api/               # API routes
│   └── globals.scss       # Global styles
├── components/            # React components
│   ├── ui/               # UI primitives
│   └── [Feature]/        # Feature components
├── lib/                  # Utility libraries
│   ├── cosmos/          # Cosmos DB utilities
│   └── utils/           # General utilities
├── hooks/               # Custom React hooks
├── services/            # API services
├── types/               # TypeScript types
└── public/              # Static assets
```

## Component Guidelines

### Server Components (Default)

```typescript
// app/page.tsx
async function HomePage() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>{data.title}</h1>
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## API Routes

### Route Handlers

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const users = await fetchUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await createUser(body);
  return NextResponse.json({ user }, { status: 201 });
}
```

## Testing

### Unit Tests

```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

Run tests:
```bash
npm test
```

## Performance Best Practices

### 1. Lazy Loading

Implement lazy loading for better performance. See our detailed [Lazy Loading Guide](./lazy-loading).

### 2. Image Optimization

```typescript
import Image from 'next/image';

export function Avatar() {
  return (
    <Image
      src="/avatar.jpg"
      alt="User avatar"
      width={40}
      height={40}
      priority={false}
    />
  );
}
```

### 3. Data Fetching

```typescript
// Use React Cache for deduplication
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
});
```

## Git Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add user profile page
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify data fetching logic
```

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit pull request
6. Address review feedback
7. Merge after approval

## Environment Variables

Never commit sensitive data. Use `.env.local`:

```bash
# .env.local (not committed)
COSMOS_DB_ENDPOINT=your_cosmos_endpoint
COSMOS_DB_KEY=your_cosmos_key

# .env.example (committed as template)
COSMOS_DB_ENDPOINT=
COSMOS_DB_KEY=
```

## Code Review Guidelines

### As a Reviewer

- Be constructive and helpful
- Check for type safety
- Verify tests pass
- Review performance implications
- Ensure documentation is updated

### As an Author

- Keep PRs focused and small
- Write clear descriptions
- Include tests
- Update documentation
- Respond to feedback promptly

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- GitLens

### Linting and Formatting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Debugging

### Next.js Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Console Logging

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

## Documentation

Keep documentation up to date:
- Update README for major changes
- Document complex functions
- Add JSDoc comments
- Update this documentation site

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Azure Cosmos DB Docs](https://learn.microsoft.com/azure/cosmos-db)

## Next Steps

- [Lazy Loading Strategy](./lazy-loading) - Optimize performance
- [Architecture Overview](/docs/architecture/overview) - Understand the system
- [API Reference](/docs/api-reference) - Explore the API
