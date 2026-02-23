---
sidebar_position: 1
title: Web App Development
description: Frontend development guide for the Next.js application
---

# Web App Development Guide

This guide covers frontend development for the LearningHubz Next.js application.

## Technology Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **React 18** - Server and Client Components
- **TypeScript** - Type-safe development

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS Modules** - Component-scoped styles
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Re-usable component library

### State Management
- **React Context** - Global state management
- **React Hooks** - Local state and side effects
- **Server State** - Leveraging Server Components

## Project Structure

```
app/
├── (authentication)/      # Auth routes (login, register)
│   ├── [locale]/
│   │   ├── login/
│   │   └── register/
├── (main)/               # Main application routes
│   ├── [locale]/        # Internationalized routes
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── my-learning/
│   │   └── settings/
├── api/                 # API routes
└── globals.scss         # Global styles

components/
├── ui/                  # Base UI components
│   ├── Button/
│   ├── Card/
│   └── Input/
├── Dashboard/           # Dashboard feature components
├── Library/            # Library feature components
├── Navigation/         # Navigation components
└── Layout/             # Layout components
```

## Development Workflow

### 1. Server Components (Default)

Server Components fetch data on the server and render HTML:

```typescript
// app/(main)/[locale]/courses/page.tsx
import { getCourses } from '@/services/courses';

export default async function CoursesPage() {
  const courses = await getCourses();
  
  return (
    <div>
      <h1>Courses</h1>
      <CourseList courses={courses} />
    </div>
  );
}
```

**Benefits:**
- Zero JavaScript sent to client for data fetching
- Direct database access
- Automatic code splitting
- Better SEO

### 2. Client Components

Use Client Components for interactivity:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function CourseEnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleEnroll = async () => {
    setLoading(true);
    await enrollInCourse(courseId);
    setLoading(false);
  };
  
  return (
    <Button onClick={handleEnroll} disabled={loading}>
      {loading ? 'Enrolling...' : 'Enroll Now'}
    </Button>
  );
}
```

**Use Client Components when you need:**
- Event listeners (`onClick`, `onChange`, etc.)
- State (`useState`, `useReducer`)
- Effects (`useEffect`)
- Browser APIs
- Custom hooks

### 3. App Router Patterns

#### Route Groups

Organize routes without affecting the URL:

```
app/
├── (authentication)/    # Route group
│   ├── login/
│   └── register/
```

Both accessible at `/login` and `/register` (not `/authentication/login`)

#### Dynamic Routes

```typescript
// app/(main)/[locale]/courses/[id]/page.tsx
export default async function CoursePage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const course = await getCourse(params.id);
  return <CourseDetail course={course} />;
}
```

#### Loading States

```typescript
// app/(main)/[locale]/courses/loading.tsx
export default function Loading() {
  return <CourseSkeleton />;
}
```

#### Error Handling

```typescript
'use client';

// app/(main)/[locale]/courses/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Component Development

### Creating a New Component

1. **Create the component file:**

```typescript
// components/CourseCard/CourseCard.tsx
import styles from './CourseCard.module.scss';

interface CourseCardProps {
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
}

export function CourseCard({
  title,
  description,
  thumbnail,
  instructor,
}: CourseCardProps) {
  return (
    <div className={styles.card}>
      <img src={thumbnail} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
      <span>{instructor}</span>
    </div>
  );
}
```

2. **Create the styles:**

```scss
// components/CourseCard/CourseCard.module.scss
.card {
  @apply rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow;
  
  img {
    @apply w-full h-48 object-cover rounded-md mb-4;
  }
  
  h3 {
    @apply text-xl font-semibold mb-2;
  }
}
```

3. **Export from index:**

```typescript
// components/CourseCard/index.ts
export { CourseCard } from './CourseCard';
```

## Styling Guidelines

### Tailwind CSS

Use Tailwind for utility classes:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-2xl font-bold">Title</h2>
  <Button variant="primary">Action</Button>
</div>
```

### SCSS Modules

Use SCSS modules for complex component styles:

```scss
.component {
  @apply base-utilities;
  
  // Complex styles that benefit from nesting
  .header {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    
    &.expanded {
      grid-template-columns: 1fr;
    }
  }
}
```

### Custom Themes

Theme variables are defined in `app/globals.scss`:

```scss
:root {
  --primary-color: #0070f3;
  --secondary-color: #00758f;
  --background: #ffffff;
  --foreground: #000000;
}

[data-theme='dark'] {
  --background: #000000;
  --foreground: #ffffff;
}
```

## Internationalization

### Using Translations

```typescript
import { useTranslations } from 'next-intl';

export function WelcomeMessage() {
  const t = useTranslations('HomePage');
  
  return <h1>{t('welcome')}</h1>;
}
```

### Translation Files

```json
// i18n/en/HomePage.json
{
  "welcome": "Welcome to LearningHubz",
  "description": "Start your learning journey"
}
```

## Performance Optimization

### 1. Lazy Loading

See the detailed [Lazy Loading Guide](./lazy-loading) for component and route optimization.

### 2. Image Optimization

Always use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/course-thumbnail.jpg"
  alt="Course"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### 3. Code Splitting

Use dynamic imports for heavy components:

```typescript
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <VideoPlayerSkeleton />,
  ssr: false,
});
```

### 4. Memoization

Use React memoization for expensive computations:

```typescript
import { useMemo } from 'react';

function CourseList({ courses, filter }) {
  const filteredCourses = useMemo(() => {
    return courses.filter(course => course.category === filter);
  }, [courses, filter]);
  
  return <div>{/* render filtered courses */}</div>;
}
```

## Testing

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { CourseCard } from './CourseCard';

describe('CourseCard', () => {
  it('displays course information', () => {
    render(
      <CourseCard
        title="TypeScript Basics"
        description="Learn TypeScript"
        thumbnail="/thumb.jpg"
        instructor="John Doe"
      />
    );
    
    expect(screen.getByText('TypeScript Basics')).toBeInTheDocument();
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument();
  });
});
```

Run tests:
```bash
npm test
```

## Common Patterns

### Data Fetching Pattern

```typescript
// services/courses.ts
export async function getCourses() {
  const response = await fetch('/api/courses', {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  return response.json();
}

// app/(main)/[locale]/courses/page.tsx
import { getCourses } from '@/services/courses';

export default async function CoursesPage() {
  const courses = await getCourses();
  return <CourseList courses={courses} />;
}
```

### Form Handling

```typescript
'use client';

import { useForm } from 'react-hook-form';

export function CourseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    await createCourse(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title', { required: true })} />
      {errors.title && <span>Title is required</span>}
      <button type="submit">Create Course</button>
    </form>
  );
}
```

## Debugging

### React DevTools

Install React DevTools browser extension for debugging component hierarchies and props.

### Next.js Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Next Steps

- [Lazy Loading Strategy](./lazy-loading) - Optimize component loading
- [Backend Development](../backend/development-guide) - API and services
- [Deployment Guide](/docs/deployment) - Deploy to production
