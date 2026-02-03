# 🏗️ Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────┐
│          ASTRO SHELL (Vercel)                   │
│  ┌────────────────────────────────────────────┐ │
│  │  Landing | About | Blog | Documentation   │ │
│  │  (Static HTML + islands on demand)         │ │
│  └────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │ Dynamic Imports
        ┌──────────┴──────────┬────────────────────┐
        │                     │                    │
   ┌────▼─────┐        ┌─────▼──────┐        ┌───▼──────┐
   │ Profile  │        │  Projects  │        │  Skills  │
   │    MF    │        │     MF     │        │    MF    │
   │ (Angular)│        │ (Angular)  │        │ (Vue 3)  │
   │ Port 5001│        │ Port 5002  │        │ Port 5003│
   └──────────┘        └────────────┘        └──────────┘
        │                     │                    │
        └─────────────────────┼────────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │  Design Tokens      │
                   │  UI Components      │
                   │  Shared Types       │
                   │  Utils              │
                   └─────────────────────┘
```

## Layers Explained

### 1. **Host Layer (Astro Shell)**
**Purpose:** Fast, SEO-friendly container  
**Responsibility:**
- Static content serving
- Meta tags & OpenGraph
- Navigation & routing
- Async island loading

**Why Astro?**
- Sends zero JavaScript for static content
- Partial hydration (islands)
- Built-in Image & Font optimization
- Native Module Federation support

### 2. **Microfrontend Layer**
**Purpose:** Feature-rich, interactive components  
**Deployed Independently**

#### MF-Profile (Angular)
- Experience timeline
- Interactive career journey
- Filterable by industry
- State management via NGRX

#### MF-Projects (Angular)
- Project showcase with case studies
- Technology filtering
- Responsive gallery
- Project metrics

#### MF-Skills (Vue 3)
- Skills matrix visualization
- Version history (skill progression over time)
- Proficiency levels
- Responsive charts

### 3. **Shared Libraries Layer**
**Purpose:** DRY principle across all packages

#### design-tokens
```
colors/
  - primary, secondary, surface, error, etc.
typography/
  - font-family, font-sizes, line-heights
spacing/
  - 4px, 8px, 12px, 16px, etc.
shadows/
  - elevation levels
```

#### ui-components
```
Web Components:
  - Button, Card, Badge, Input, Modal, etc.

Framework Wrappers:
  - Angular directives
  - Vue composition functions
```

#### shared-types
```typescript
// Portfolio domain types
interface Experience { }
interface Project { }
interface Skill { }
interface SkillVersion { }
```

#### utils
```typescript
// Common helpers
formatDate()
groupBy()
calculateExperienceYears()
etc.
```

## 🔄 Data Flow

### Example: Loading MF-Profile

```
1. User navigates to /profile
   ↓
2. Astro renders shell + <profile-mf /> island
   ↓
3. Browser loads MF remoteEntry.js (5KB)
   ↓
4. Module Federation initializes
   ↓
5. Angular component loads and hydrates
   ↓
6. NGRX store initialized with experience data
   ↓
7. Interactive timeline renders + animations
```

### Example: Updating Design System

```
1. Edit design-tokens/tokens.json
   ↓
2. Run pnpm build in design-tokens/
   ↓
3. All apps consume updated CSS variables
   ↓
4. No code changes needed in consumers
   ↓
5. Visual consistency maintained
```

## 📦 Module Federation Strategy

### File Structure per MF

```
mf-profile/
├── module-federation.config.ts
├── webpack.config.js
├── package.json
├── tsconfig.json
├── src/
│  ├── app/
│  │  └── experience/
│  │     ├── experience.component.ts
│  │     ├── experience.component.html
│  │     └── experience.store.ts (NGRX)
│  ├── main.ts
│  └── bootstrap.ts
└── dist/
   ├── remoteEntry.js          ← Shared dependency manifest
   ├── main-[hash].js
   └── assets/
```

### Module Federation Config

```typescript
// module-federation.config.ts
export const moduleFederationConfig = {
  name: 'profile',
  filename: 'remoteEntry.js',
  exposes: {
    './Profile': './src/app/profile/profile.component.ts',
  },
  shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    '@ngrx/store': { singleton: true },
    rxjs: { singleton: true },
  },
};
```

### Host Configuration (Astro)

```typescript
// astro.config.mjs
remotes: {
  profile: 'http://localhost:5001/remoteEntry.js',
  projects: 'http://localhost:5002/remoteEntry.js',
  skills: 'http://localhost:5003/remoteEntry.js',
},
```

## 🏷️ Versioning Strategy

### Semantic Versioning for MFs

```
mf-profile/dist/
├── v1.0.0/
│  ├── remoteEntry.js
│  └── main-[hash].js
├── v1.1.0/
│  ├── remoteEntry.js
│  └── main-[hash].js
└── v1.2.0/ ← latest
   ├── remoteEntry.js
   └── main-[hash].js
```

### Dynamic Loading

```typescript
// Astro component
const profileVersion = import.meta.env.MF_PROFILE_VERSION || '1.2.0';
const remoteEntry = 
  `https://mf-profile.example.com/v${profileVersion}/remoteEntry.js`;
```

## 🔐 Design System Integration

### Token Flow

```
design-tokens/tokens.json
    ↓ (pnpm build)
design-tokens/dist/tokens.css
    ↓ (imported by)
All apps' entry points
    ↓
CSS Custom Properties available globally
    ↓
:root {
  --color-primary: #0057ff;
  --spacing-sm: 4px;
  /* ... */
}
```

### Component Hierarchy

```
Web Components (framework-agnostic)
    ↓
Angular/Vue Wrappers (easy DX)
    ↓
App-specific implementations
```

## 🧪 Testing Strategy

### Unit Testing
- Jest for libs
- Jasmine for Angular MFs
- Vitest for Vue MF

### Integration Testing
- MF boundaries tested
- Shared types validated

### E2E Testing
- Astro shell + all MFs loaded
- User flows tested

## 🚀 Deployment Architecture

### CI/CD Pipeline

```
1. Push to main/develop
   ↓
2. GitHub Actions triggered
   ↓
3. Parallel jobs:
   ├─ Lint & type-check
   ├─ Test all packages
   └─ Build all apps
   ↓
4. Deploy based on changes:
   ├─ astro-shell → Vercel
   ├─ mf-* → Cloudflare Pages
   └─ storybook → Chromatic
   ↓
5. Smoke tests on deployed URLs
   ↓
6. Notification to Slack/Discord
```

## 🔑 Key Decisions

### ✅ Astro as Host
- Minimal JavaScript for static content
- Perfect for landing page + blog
- Native MF support
- SEO-friendly

### ✅ Web Components Bridge
- Framework independence
- Easier MF communication
- Future-proof

### ✅ pnpm workspaces
- Faster than npm/yarn
- Monorepo support out of the box
- Better disk space usage

### ✅ TypeScript Paths
- Clean imports: `@portfolio/design-tokens`
- No relative hell: `../../libs/design-tokens`

### ✅ NGRX for Angular MFs
- Predictable state management
- DevTools integration
- Time-travel debugging

---

See [ADR/](ADR/) for deeper rationales on each decision.
