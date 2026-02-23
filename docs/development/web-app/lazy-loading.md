---
sidebar_position: 3
title: Progressive Lazy Loading Strategy
description: Engineering rules for implementing sophisticated data fetching patterns
keywords: [lazy loading, performance, fetching, pagination, infinite scroll]
---

# Progressive Lazy Loading Strategy

**Rule Document for Implementing Sophisticated Fetching Patterns**

Version: 1.0  
Last Updated: February 22, 2026  
Owner: Engineering Team  
Review Cycle: Quarterly

---

## Table of Contents

1. [When to Apply This Pattern](#when-to-apply-this-pattern)
2. [Core Principles](#core-principles)
3. [Implementation Checklist](#implementation-checklist)
4. [Configuration Guidelines](#configuration-guidelines)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
6. [Performance Metrics](#performance-metrics)
7. [Code Examples](#code-examples)

---

## When to Apply This Pattern

Use this progressive lazy loading strategy when:

- **Displaying large collections** of content items (catalogs, feeds, galleries, playlists)
- **Performance is critical** and initial page load needs to be fast
- **Content is image-heavy** or requires API calls to fetch detailed data
- **Users may not view all items** (typical scroll behavior in content feeds)
- **Mobile responsiveness** matters (bandwidth constraints)
- **SEO is not critical** for below-the-fold content

### Real-World Use Cases

- Content catalogs and learning resource libraries
- Video/media galleries and playlists
- E-commerce product grids
- Social media feeds
- Dashboard widgets with dynamic content
- Search results pages with rich previews

---

## Core Principles

### 1. Viewport-Based Lazy Loading

**Rule:** Only fetch content when it's about to enter the viewport.

```javascript
const { ref, inView, entry } = useInView({
  triggerOnce: true,
  rootMargin: "50% 50% 50% 50%", // Preload before entering viewport
})
```

**Implementation Requirements:**
- Set `triggerOnce: true` to avoid re-fetching on scroll
- Use generous `rootMargin` (50%+) to preload content before it's visible
- Adjust margins based on scroll speed and content complexity
- Attach `ref` to the wrapper element, not the content itself

**Why it matters:**
- Reduces initial page load time
- Minimizes unnecessary API calls
- Improves perceived performance
- Saves bandwidth on mobile devices

---

### 2. Bi-Directional Scroll Detection

**Rule:** Track items that have scrolled above the viewport to maintain DOM stability.

```javascript
const [aboveView, setAboveView] = useState(false)

useEffect(() => {
  if (entry) {
    const rect = entry.boundingClientRect
    if (rect.top < 0 && rect.right <= window.innerWidth) {
      !aboveView && setAboveView(true)
    }
  }
}, [entry])

// Render condition
{(inView || aboveView) && <ContentComponent />}
```

**Implementation Requirements:**
- Check if `entry.boundingClientRect.top < 0` (above viewport)
- Verify item is within horizontal bounds (`right <= window.innerWidth`)
- Keep already-loaded items rendered (don't unmount)
- Use state to track "above viewport" status independently

**Why it matters:**
- Ensures smooth upward scrolling experience
- Prevents jarring content unmounting
- Maintains scroll position accuracy
- Avoids re-fetching already loaded data

---

### 3. Conditional Loading Strategy

**Rule:** Prioritize critical above-the-fold content for immediate loading.

```javascript
// Define content types that should load immediately
const IMMEDIATE_LOAD_TYPES = ["Special_Banner", "Cover", "Special_PL_Section"]

// Conditional rendering
const itemIsLoaded = 
  item?.metaType && IMMEDIATE_LOAD_TYPES.includes(item.metaType) || 
  !item.metaType

return itemIsLoaded ? 
  <LoadedGridItem item={item} /> : 
  <LazyLoadedGridItem item={item} />
```

**Content Type Priority Matrix:**

| Priority | Content Type | Loading Strategy | Rationale |
|----------|-------------|------------------|-----------|
| Critical | Banners, Covers, Heroes | Immediate | Above-the-fold, user attention |
| High | Navigation, CTAs | Immediate | Core UX elements |
| Normal | Content cards, Articles | Lazy | Below-the-fold |
| Low | Thumbnails, Previews | Lazy | Secondary content |
| Skip | Dividers, Sections | No render | UI decoration only |

**Implementation Requirements:**
- **Above-the-fold content**: Load immediately
- **Below-the-fold content**: Use lazy loading
- **Special UI elements**: Skip or load immediately based on type
- **Unknown types**: Default to immediate loading (fail-safe approach)

---

### 4. Memoization for Performance

**Rule:** Prevent unnecessary re-renders with React.memo.

```javascript
// Wrap ALL leaf components
const LazyLoadedGridItem = memo(_LazyLoadedGridItem)
const LoadedGridItem = memo(_LoadedGridItem)
const SingleGridItem = memo(_SingleGridItem)
const ExpandedGridItem = memo(_ExpandedGridItem)
const GridItem = memo(_GridItem)
const Grid = memo(_Grid)
```

**Implementation Requirements:**
- Wrap **all** presentational components in `React.memo`
- Use deep comparison for complex props if needed
- Apply to both parent and child components
- Monitor with React DevTools Profiler

**Why it matters:**
- Prevents re-renders when parent updates but props unchanged
- Critical for large lists with 50+ items
- Reduces CPU usage during scroll
- Improves frame rate and responsiveness

---

### 5. Data Fetching Hierarchy

**Rule:** Fetch data progressively from container to children.

```javascript
// Level 1: Fetch container metadata
function ExpandedGridItem({ item }) {
  const { resource } = useResourceFetcher(item.id, item.metaType, token)
  
  // Level 2: Render nested content lazily
  return resource?.content.map(content => (
    <SingleGridItem item={content} /> // Each child lazy loads independently
  ))
}
```

**Fetching Strategy:**

```
Container (immediate) → Children (lazy) → Grandchildren (lazy)
     ↓                       ↓                    ↓
  Metadata              Content Items        Nested Resources
```

**Implementation Requirements:**
- **Parent-first**: Fetch container metadata before children
- **Progressive**: Children load independently as they enter viewport
- **Graceful degradation**: Show fallback if container fetch fails
- **Avoid cascading**: Don't wait for parent completion before starting child renders

---

### 6. Cache Workaround Pattern

**Rule:** Handle caching library quirks with defensive data fetching.

```javascript
function RenderFetchResource({ item }) {
  const { token } = useAppContext()
  let { resource } = useResourceFetcher(item.id, item.metaType, token)
  
  // Fallback to item if resource not yet cached
  if (!resource) resource = item
  
  if (!resource) return null
  
  return <ContentCard data={resource} />
}
```

**Implementation Requirements:**
- Fetch fresh data even if initial item data exists
- Fallback to item data if fetch is pending
- Handle null/undefined gracefully
- Don't block rendering while waiting for cache

**Why it matters:**
- SWR and React Query may have stale cache issues
- Ensures UI always shows something (progressive enhancement)
- Prevents flash of empty content
- Maintains optimistic UI patterns

---

## Implementation Checklist

### Component Structure

- [ ] **Wrapper component** separates fetch logic from presentation
- [ ] **Lazy component** using `useInView` hook from `react-intersection-observer`
- [ ] **Loaded component** for immediate rendering of critical content
- [ ] **Single item component** handling conditional logic (lazy vs. loaded)
- [ ] **Expanded/nested component** for hierarchical content structures
- [ ] **Render fetch component** handles cache workarounds

### Performance Optimizations

- [ ] All components wrapped in `React.memo`
- [ ] `triggerOnce: true` on intersection observer
- [ ] Generous `rootMargin` for smooth UX (50%+ recommended)
- [ ] Bi-directional scroll detection implemented
- [ ] Conditional loading based on content type/priority
- [ ] Proper key management for list items (`key={item.id}` preferred)

### Error Handling

- [ ] Fallback when resource fetch fails
- [ ] Handle missing or malformed data gracefully
- [ ] Validate required props with meaningful errors
- [ ] SWR/cache workarounds if using data fetching libraries
- [ ] Loading states for pending fetches
- [ ] Error boundaries for component failures

### Testing Scenarios

- [ ] **Fast scrolling** (up and down) - verify no jank
- [ ] **Slow scrolling** with viewport observation - verify preloading
- [ ] **Browser back/forward navigation** - verify cache behavior
- [ ] **Direct links to bottom of page** - verify progressive load
- [ ] **Mobile network throttling** (3G/4G simulation)
- [ ] **Empty or missing content arrays** - verify no crashes
- [ ] **Horizontal scroll scenarios** (if applicable)
- [ ] **Resize/orientation changes** - verify re-calculation

### Accessibility Considerations

- [ ] Announce dynamic content loading to screen readers
- [ ] Maintain focus management during lazy load
- [ ] Ensure keyboard navigation works with lazy-loaded items
- [ ] Skip links function correctly with progressive content
- [ ] Loading indicators have proper ARIA labels

---

## Configuration Guidelines

### Viewport Margins by Use Case

| Scroll Speed | Recommended Margin | Use Case | Example |
|-------------|-------------------|----------|---------|
| Slow | `25% 25% 25% 25%` | Text-heavy content | Blog posts, articles |
| Normal | `50% 50% 50% 50%` | Mixed content (default) | Content catalogs, feeds |
| Fast | `100% 100% 100% 100%` | Image galleries | Photo albums, media grids |
| Mobile | `75% 75% 75% 75%` | Touch-based scrolling | Mobile apps, responsive sites |

### Content Type Priority Configuration

```javascript
// Define in a centralized config file
const CONTENT_PRIORITY = {
  IMMEDIATE_LOAD: [
    'Special_Banner',
    'Cover', 
    'Hero',
    'Navigation',
    'CTA'
  ],
  
  LAZY_LOAD: [
    'ContentCard',
    'Article',
    'Video',
    'Playlist',
    'Thumbnail'
  ],
  
  SKIP_RENDER: [
    'Special_Section',
    'Special_PL_Section',
    'Divider',
    'Spacer'
  ]
}
```

### Performance Tuning Parameters

```javascript
const LAZY_LOADING_CONFIG = {
  // Intersection Observer options
  observer: {
    triggerOnce: true,
    rootMargin: "50% 50% 50% 50%",
    threshold: 0.01, // Trigger when 1% visible
  },
  
  // Batch size for initial load
  initialBatchSize: 4,
  
  // Maximum concurrent fetches
  maxConcurrentFetches: 10,
  
  // Fetch retry configuration
  retry: {
    attempts: 3,
    backoff: 'exponential',
    delay: 1000,
  }
}
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Fetch All Items on Mount

```javascript
// BAD: Defeats the purpose of lazy loading
const [items, setItems] = useState([])

useEffect(() => {
  fetchAllItems().then(setItems) // Loads everything upfront
}, [])
```

### ✅ Do: Fetch Items Progressively

```javascript
// GOOD: Only fetch what's visible
function LazyItem({ itemId }) {
  const { ref, inView } = useInView({ triggerOnce: true })
  const { data } = useFetch(inView ? itemId : null)
  return <div ref={ref}>{data && <Item data={data} />}</div>
}
```

---

### ❌ Don't: Unmount Items Above Viewport

```javascript
// BAD: Causes layout shifts and re-fetches
{inView && <Item />} // Unmounts when scrolling past
```

### ✅ Do: Keep Items Mounted Once Loaded

```javascript
// GOOD: Maintains DOM stability
{(inView || aboveView) && <Item />}
```

---

### ❌ Don't: Use Aggressive Margins (0px)

```javascript
// BAD: Visible lag, poor UX
const { ref, inView } = useInView({
  rootMargin: "0px 0px 0px 0px" // Loads only when visible
})
```

### ✅ Do: Preload Generously

```javascript
// GOOD: Smooth, seamless experience
const { ref, inView } = useInView({
  rootMargin: "50% 50% 50% 50%" // Preloads before visible
})
```

---

### ❌ Don't: Skip Memoization on Large Lists

```javascript
// BAD: Every scroll causes full re-render
export function GridItem({ item }) {
  return <ContentCard data={item} />
}
```

### ✅ Do: Memoize Everything

```javascript
// GOOD: Only re-renders when props change
export const GridItem = memo(function GridItem({ item }) {
  return <ContentCard data={item} />
})
```

---

### ❌ Don't: Mix Lazy and Eager Without Rules

```javascript
// BAD: Inconsistent, unpredictable behavior
{Math.random() > 0.5 ? <LazyItem /> : <EagerItem />}
```

### ✅ Do: Define Clear Priority Rules

```javascript
// GOOD: Predictable, rule-based loading
{IMMEDIATE_TYPES.includes(item.type) ? <EagerItem /> : <LazyItem />}
```

---

### ❌ Don't: Ignore Bi-Directional Scroll

```javascript
// BAD: Only handles downward scroll
{inView && <Item />}
```

### ✅ Do: Handle Both Directions

```javascript
// GOOD: Smooth scrolling both ways
{(inView || aboveView) && <Item />}
```

---

## Performance Metrics

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

### Application-Specific Metrics

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| Time to First Contentful Paint (FCP) | < 1.8s | < 3.0s |
| Number of simultaneous fetches | < 10 | < 20 |
| Memory usage (100 items) | < 50MB | < 100MB |
| Scroll frame rate | 60 FPS | 30 FPS |
| Time to Interactive (TTI) | < 3.5s | < 5.0s |

### Monitoring Implementation

```javascript
// Example: Performance monitoring hook
function usePerformanceMonitoring(componentName) {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log to analytics service
        analytics.track('component_render', {
          component: componentName,
          duration: entry.duration,
          startTime: entry.startTime,
        })
      })
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    return () => observer.disconnect()
  }, [componentName])
}
```

### Red Flags to Monitor

- **Memory leaks**: Memory usage increases indefinitely with scroll
- **Layout thrashing**: CLS > 0.1 during lazy load
- **Network congestion**: > 20 concurrent requests
- **Slow renders**: Component render time > 16ms (60 FPS threshold)
- **Failed fetches**: Error rate > 1%

---

## Code Examples

### Example 1: Basic Lazy Grid Implementation

```javascript
// filepath: /components/LazyGrid/index.js
"use client"

import { memo, useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"

const IMMEDIATE_LOAD_TYPES = ["Banner", "Cover", "Hero"]

const LazyItem = memo(function LazyItem({ item, onLoad }) {
  const { ref, inView, entry } = useInView({
    triggerOnce: true,
    rootMargin: "50% 50% 50% 50%",
  })
  
  const [aboveView, setAboveView] = useState(false)
  
  useEffect(() => {
    if (entry?.boundingClientRect.top < 0) {
      setAboveView(true)
    }
  }, [entry])
  
  return (
    <div ref={ref}>
      {(inView || aboveView) && (
        <ItemCard item={item} onLoad={onLoad} />
      )}
    </div>
  )
})

export const LazyGrid = memo(function LazyGrid({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {items.map(item => 
        IMMEDIATE_LOAD_TYPES.includes(item.type) ? (
          <ItemCard key={item.id} item={item} />
        ) : (
          <LazyItem key={item.id} item={item} />
        )
      )}
    </div>
  )
})
```

---

### Example 2: Hierarchical Content with Nested Lazy Loading

```javascript
// filepath: /components/ExpandedGrid/index.js
"use client"

import { memo } from "react"
import { useResourceFetcher } from "@/hooks/data-hooks"

const ExpandedGridItem = memo(function ExpandedGridItem({ item, random = false }) {
  const { resource, isLoading, error } = useResourceFetcher(item.id, item.metaType)
  
  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorFallback error={error} />
  if (!resource?.content) return null
  
  let content = [...resource.content]
  if (random) content = shuffle(content)
  
  return (
    <>
      {content.map(child => (
        <LazyGridItem 
          key={child.id} 
          item={child}
          parentId={resource.id}
        />
      ))}
    </>
  )
})
```

---

### Example 3: Cache Workaround Pattern

```javascript
// filepath: /components/GridItem/ResourceFetcher.js
"use client"

import { memo } from "react"
import { useResourceFetcher } from "@/hooks/data-hooks"

const ResourceFetcher = memo(function ResourceFetcher({ 
  item, 
  children 
}) {
  // Attempt to fetch fresh data
  let { resource } = useResourceFetcher(item.id, item.metaType)
  
  // Fallback to initial item data if cache is stale/empty
  if (!resource) resource = item
  
  // Guard against null
  if (!resource) return null
  
  // Render children with resolved resource
  return children(resource)
})

// Usage
<ResourceFetcher item={item}>
  {(resource) => <ContentCard data={resource} />}
</ResourceFetcher>
```

---

### Example 4: Performance Monitoring Integration

```javascript
// filepath: /components/LazyGrid/withPerformanceMonitoring.js
import { useEffect } from "react"

export function withPerformanceMonitoring(Component, componentName) {
  return function MonitoredComponent(props) {
    useEffect(() => {
      const startTime = performance.now()
      
      return () => {
        const duration = performance.now() - startTime
        
        // Log if render took too long
        if (duration > 16) {
          console.warn(`${componentName} render time: ${duration}ms`)
        }
        
        // Send to analytics
        window.gtag?.('event', 'component_render', {
          component: componentName,
          duration: Math.round(duration),
        })
      }
    }, [])
    
    return <Component {...props} />
  }
}

// Usage
export const LazyGrid = withPerformanceMonitoring(
  memo(_LazyGrid),
  'LazyGrid'
)
```

---

### Example 5: Adaptive Root Margin Based on Network

```javascript
// filepath: /hooks/useAdaptiveInView.js
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"

export function useAdaptiveInView() {
  const [rootMargin, setRootMargin] = useState("50% 50% 50% 50%")
  
  useEffect(() => {
    // Detect network speed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      const effectiveType = connection.effectiveType
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          setRootMargin("25% 25% 25% 25%") // Conservative preload
          break
        case '3g':
          setRootMargin("50% 50% 50% 50%") // Default
          break
        case '4g':
          setRootMargin("100% 100% 100% 100%") // Aggressive preload
          break
      }
    }
  }, [])
  
  return useInView({
    triggerOnce: true,
    rootMargin,
  })
}
```

---

## Related Documentation

- [React Intersection Observer](https://github.com/thebuilder/react-intersection-observer)
- [Web Vitals](https://web.dev/vitals/)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [SWR Documentation](https://swr.vercel.app/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 22, 2026 | Initial rule document based on Grid.js implementation | Engineering Team |

---

## Feedback & Contributions

For questions, suggestions, or improvements to this document:

1. Create an issue in the repository
2. Tag with `documentation` and `performance`
3. Reference this document in your issue description

---

**Document Status:** ✅ Active  
**Next Review:** May 2026
