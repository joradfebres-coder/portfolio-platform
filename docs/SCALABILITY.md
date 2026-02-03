# 📈 Scalability Guide

This portfolio architecture is **designed to scale** with additional experiences, projects, and features over time.

## How to Add New Applications

### Scenario 1: Adding a New Microfrontend

Example: Adding a "testimonials" MF

#### Step 1: Create the MF
```bash
# Create directory
mkdir apps/mf-testimonials

# Copy template from existing MF
cp -r apps/mf-profile/* apps/mf-testimonials/

# Update package.json
cd apps/mf-testimonials
# Change name to @portfolio/mf-testimonials
# Change version to 1.0.0
```

#### Step 2: Configure Module Federation
```typescript
// apps/mf-testimonials/module-federation.config.ts
export const moduleFederationConfig = {
  name: 'testimonials',
  filename: 'remoteEntry.js',
  exposes: {
    './Testimonials': './src/app/testimonials.component.ts',
  },
  shared: {
    '@angular/core': { singleton: true },
    // ... shared deps
  },
};
```

#### Step 3: Update Astro Shell
```astro
---
// apps/astro-shell/src/pages/testimonials.astro
import MFIsland from '../components/MFIsland.astro';
---

<MFIsland 
  name="testimonials" 
  remoteEntry="http://localhost:5004/remoteEntry.js"
  scope="testimonials"
/>
```

#### Step 4: Update CI/CD
```yaml
# .github/workflows/deploy-mf.yml
- name: Deploy mf-testimonials
  run: |
    cd apps/mf-testimonials
    pnpm build
    npx wrangler pages deploy dist/
```

#### Step 5: Test
```bash
cd apps/mf-testimonials
pnpm dev

# Visit http://localhost:3000/testimonials to see MF loaded
```

---

### Scenario 2: Adding a New Shared Library

Example: Adding an "analytics" library

#### Step 1: Create Library
```bash
mkdir libs/analytics
mkdir libs/analytics/src
```

#### Step 2: Add package.json
```json
{
  "name": "@portfolio/analytics",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  }
}
```

#### Step 3: Update Root tsconfig
```json
// tsconfig.json paths
{
  "paths": {
    "@portfolio/analytics": ["libs/analytics/src"]
  }
}
```

#### Step 4: Use Across Apps
```typescript
// Any app
import { trackEvent } from '@portfolio/analytics';

trackEvent('mf_loaded', { name: 'profile' });
```

---

### Scenario 3: Adding a Landing Page Variant

Example: Adding an "/es" (Spanish) version

#### Option A: Multilingual Astro
```astro
---
// apps/astro-shell/src/pages/es/index.astro
// Spanish landing page
---

<Layout lang="es">
  <!-- Spanish content -->
</Layout>
```

#### Option B: Separate Astro Shell
```bash
# Create alternative shell
mkdir apps/astro-shell-es

# Copy from astro-shell
cp -r apps/astro-shell/* apps/astro-shell-es/

# Deploy to separate Vercel project
# vercel deploy --prod --project=portfolio-es
```

---

### Scenario 4: Adding Non-MF Content

Example: Adding a "/blog" section with Markdown files

#### Step 1: Create Blog Pages
```bash
mkdir apps/astro-shell/src/pages/blog
```

#### Step 2: Create MDX Component
```astro
---
// apps/astro-shell/src/pages/blog/[slug].astro
const posts = await getCollection('blog');
export async function getStaticPaths() {
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<Layout title={post.data.title}>
  <Content />
</Layout>
```

#### Step 3: Add Markdown Files
```
apps/astro-shell/src/content/blog/
├── understanding-microfrontends.md
├── angular-design-patterns.md
└── performance-tips.md
```

#### Step 4: Deploy
```bash
# Automatic with Astro shell deployment
pnpm build
vercel deploy --prod
```

---

## Patterns for Maintenance

### Adding a New Technology/Framework

Example: Adding React MF

```bash
# Create new MF
mkdir apps/mf-react-example

# Setup React + Module Federation
# Use template or copy from existing

# The architecture **already supports it**:
# - Shared types via @portfolio/shared-types
# - Design tokens via @portfolio/design-tokens
# - UI Components have React wrappers
# - Zero conflicts with Angular/Vue MFs
```

### Adding Complexity: State Management

```typescript
// If Angular MF needs state: use NGRX
// If Vue MF needs state: use Pinia
// If React MF needs state: use Redux / Zustand

// All share the same models from @portfolio/shared-types
import type { Experience } from '@portfolio/shared-types';

// Each framework manages it independently
// Shell (Astro) doesn't care about state
```

### Adding Data: API Integration

```typescript
// Create new lib for API
mkdir libs/api-client

// Implement once
export async function fetchExperiences() {
  return fetch('/api/experiences');
}

// Use everywhere
import { fetchExperiences } from '@portfolio/api-client';
```

---

## Scaling Checklist

### ✅ Before Adding New Feature
- [ ] Is it a separate concern? (Profile, Projects, Skills, etc.)
- [ ] Does it need interaction? (→ Microfrontend)
- [ ] Is it just content? (→ Astro page)
- [ ] Does it share UI? (→ Design tokens + components)

### ✅ When Creating New MF
- [ ] Follows Module Federation config pattern
- [ ] Uses types from `@portfolio/shared-types`
- [ ] Uses tokens from `@portfolio/design-tokens`
- [ ] Has tests
- [ ] Has Storybook stories (if UI-heavy)
- [ ] Has entry point in `astro-shell`
- [ ] Added to CI/CD pipeline

### ✅ When Adding to Astro Shell
- [ ] Page in `/src/pages/`
- [ ] Layout consistent with global design
- [ ] Uses design tokens
- [ ] SEO meta tags
- [ ] Mobile responsive
- [ ] Lighthouse score > 90

### ✅ Before Deploying
- [ ] All tests pass: `pnpm test`
- [ ] No lint errors: `pnpm lint`
- [ ] Types check: `pnpm type-check`
- [ ] Builds successfully: `pnpm build`
- [ ] GitHub Actions pipeline passes

---

## Performance Considerations

### Bundle Size Monitoring
```bash
# Check bundle size per app
pnpm build

# Review:
ls -lh apps/*/dist/
ls -lh apps/*/dist/*.js

# Keep MF entry points < 50KB gzipped
# Keep Astro shell < 20KB gzipped
```

### Lazy Loading MFs
```astro
---
// Load MF only when needed
const shouldLoadMF = Astro.url.pathname.includes('/projects');
---

{shouldLoadMF && (
  <MFIsland name="projects" client:idle />
)}
```

### Shared Dependencies
```typescript
// Module Federation config
shared: {
  // Load once globally
  '@angular/core': { singleton: true },
  'rxjs': { singleton: true },
  '@portfolio/shared-types': { singleton: true },
}
```

---

## Future-Proofing

### Technology Upgrades
```
Current: Angular 16, Vue 3, Astro 3
Future:  Angular 17+, Vue 4?, Astro 5?

Thanks to Web Components bridge and shared types,
**no major refactoring needed**
```

### Adding Monitoring
```typescript
// Add to libs/analytics
export function trackMFLoad(name: string) {
  // Send to your analytics provider
}

// Use in all MFs
trackMFLoad('profile');
```

### Adding Backend
```typescript
// Create libs/api-client
export const API_BASE = import.meta.env.VITE_API_URL;

// All MFs can consume REST/GraphQL APIs
```

---

## Monorepo Commands

### Useful Commands as Project Grows

```bash
# See what changed
git status

# Run command in specific package
pnpm --filter @portfolio/mf-profile build

# Run in all packages
pnpm -r build

# Parallel execution
pnpm -r --parallel run build

# With scope
pnpm --scope "*-mf*" run build

# New package setup
mkdir apps/new-mf
cd apps/new-mf
pnpm init

# Link to workspaces
# Automatically detected via apps/* and libs/*
```

---

## Documentation as You Scale

### Keep ADRs Updated
```bash
docs/ADR/
├── 001-astro-as-shell.md          ✓ (Done)
├── 002-mf-versioning.md           ✓ (Done)
├── 003-web-components.md          ✓ (Done)
├── 004-[new-decision].md          ← Add when making major choice
└── 005-[architectural-pattern].md
```

### Keep Component Gallery Updated
```bash
# Every new component in UI lib should have:
# 1. Storybook story
# 2. Tests
# 3. Accessibility review
# 4. Documentation
```

---

## Summary

**This architecture scales because:**

1. ✅ **Clear separation of concerns** - Astro (content) vs MF (interaction) vs Libs (reuse)
2. ✅ **Framework independence** - Web Components bridge all frameworks
3. ✅ **Independent deployment** - Each MF deployed separately, no coordination needed
4. ✅ **Shared types & tokens** - No duplication across apps
5. ✅ **Documented decisions** - ADRs explain the "why"
6. ✅ **Automated testing & linting** - Quality gates on every commit
7. ✅ **Monorepo structure** - Easy to navigate and manage growth

**You can confidently add:**
- 10+ more MFs
- 5+ more shared libraries  
- New frameworks (React, Svelte, Solid)
- Backend integration
- Advanced state management
- Multiple deployments

**Without breaking existing architecture.** 🚀
