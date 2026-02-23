---
sidebar_position: 1
title: Quick Start
description: Get started with frontend development
---

# Frontend Quick Start

This guide will help you set up your development environment and start working on the Learning HubZ frontend.

## Prerequisites

- **Node.js** version 18.0 or above
- **npm** or **yarn** package manager
- **Git** for version control
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

This installs all frontend dependencies including:
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TypeScript
- And more...

### 3. Configure Environment (Minimal)

For frontend-only development, create a `.env.local` file with minimal configuration:

```bash
# Authentication (use development mode)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret-key-change-in-production

# Optional: Mock backend services if needed
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

:::tip
For most frontend work, you don't need Azure service credentials. The app will use mock data or fail gracefully when services aren't configured.
:::

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page will auto-reload when you make changes.

## Frontend Project Structure

```
learninghubz2..0/
├── app/                      # Next.js App Router
│   ├── globals.scss          # Global styles
│   ├── (authentication)/     # Auth pages (login, register)
│   ├── (main)/              # Main app pages
│   │   ├── dashboard/       # Dashboard page
│   │   ├── library/         # Library views
│   │   ├── [hubId]/         # Hub dynamic routes
│   │   └── layout.js        # Main layout wrapper
│   └── api/                 # API routes (backend)
├── components/              # React components
│   ├── Layout/             # Layout components
│   ├── Navigation/         # Navigation & menus
│   ├── Dashboard/          # Dashboard widgets
│   ├── Library/            # Library components
│   ├── Resource/           # Resource viewers
│   └── ...                 # Many more
├── hooks/                  # Custom React hooks
│   ├── useAuth.js          # Authentication hook
│   ├── useResource.js      # Resource fetching
│   └── ...
├── context/                # React Context providers
│   ├── AuthContext.js      # Auth state
│   ├── ThemeContext.js     # Theme/styling
│   └── ...
├── lib/                    # Frontend utilities
│   ├── utils.js            # Helper functions
│   └── constants.js        # Constants
├── public/                 # Static assets
│   ├── images/
│   ├── icons/
│   └── ...
├── styles/                 # Additional styles
└── types/                  # TypeScript types
```

## Common Frontend Tasks

### Creating a New Component

1. Create a new folder in `/components`:

```bash
mkdir components/MyComponent
```

2. Create the component file:

```jsx
// components/MyComponent/MyComponent.js
import React from 'react';
import styles from './MyComponent.module.scss';

export default function MyComponent({ title, children }) {
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

3. Create a styles file:

```scss
// components/MyComponent/MyComponent.module.scss
.container {
  padding: 1rem;
  border-radius: 8px;
  background: var(--background-secondary);

  h2 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
}
```

4. Create an index file for easy imports:

```javascript
// components/MyComponent/index.js
export { default } from './MyComponent';
```

### Working with Pages

Pages are in the `/app` directory using Next.js App Router:

```jsx
// app/(main)/my-page/page.js
export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <p>Content goes here</p>
    </div>
  );
}
```

Access at: `http://localhost:3000/my-page`

### Styling Options

Learning HubZ uses multiple styling approaches:

#### 1. Tailwind CSS (Utility-First)

```jsx
<div className="flex items-center gap-4 p-4 rounded-lg bg-gray-100">
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click Me
  </button>
</div>
```

#### 2. SCSS Modules (Component-Scoped)

```jsx
import styles from './MyComponent.module.scss';

<div className={styles.container}>
  <span className={styles.text}>Styled</span>
</div>
```

#### 3. Global SCSS

Edit `app/globals.scss` for global styles:

```scss
:root {
  --background-primary: #ffffff;
  --text-primary: #1a1a1a;
}

[data-theme='dark'] {
  --background-primary: #1a1a1a;
  --text-primary: #ffffff;
}
```

### Using Hooks

```jsx
import { useAuth } from '@/hooks/useAuth';
import { useResource } from '@/hooks/useResource';

export default function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const { resource, loading } = useResource(resourceId);

  if (!isAuthenticated) return <div>Please log in</div>;
  if (loading) return <div>Loading...</div>;

  return <div>Hello, {user.name}!</div>;
}
```

### Client vs Server Components

Next.js 14 uses React Server Components by default:

**Server Component (default):**
```jsx
// No 'use client' directive
// Renders on server, great for SEO
export default async function ServerComponent() {
  const data = await fetchData(); // Can use async/await
  return <div>{data}</div>;
}
```

**Client Component:**
```jsx
'use client'; // Must be at the top

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

:::tip When to use what?
- **Server Components**: Default choice, better performance, SEO-friendly
- **Client Components**: When you need interactivity, state, effects, or browser APIs
:::

## Development Tools

### Hot Reload

Changes to files automatically reload the browser. If it doesn't work:

```bash
# Restart the dev server
# Press Ctrl+C, then:
npm run dev
```

### TypeScript Support

The project supports both `.js` and `.tsx` files. TypeScript provides better intellisense:

```tsx
interface UserProps {
  name: string;
  email: string;
}

export default function UserCard({ name, email }: UserProps) {
  return <div>{name} - {email}</div>;
}
```

### ESLint

Check code quality:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

### Browser DevTools

- **React DevTools**: [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/)
- **Network Tab**: Monitor API calls
- **Console**: Check for errors and logs

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styles Not Updating

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Environment Variables Not Working

- Ensure `.env.local` exists in the root directory
- Restart the dev server after changing env vars
- Use `NEXT_PUBLIC_` prefix for client-side variables

## Next Steps

- **[Development Guide](./development-guide)** - Detailed frontend patterns
- **[Lazy Loading](./lazy-loading)** - Optimize performance
- **[Architecture Overview](/docs/architecture/overview)** - Understand the system

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

Happy coding! 🚀
