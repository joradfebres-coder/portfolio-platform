# 🚀 Portfolio Platform

Enterprise-grade portfolio platform built with **Astro** + **Microfrontends**.

**Live Demo:** (Coming soon)

---

## 📋 Quick Start

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 8

### Installation

```bash
# Clone and navigate
cd portfolio-platform

# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all apps
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format
```

---

## 📁 Workspace Structure

```
portfolio-platform/
├─ apps/                         # Application packages
│  ├─ astro-shell/              # Host application (landing, about, blog)
│  ├─ mf-profile/               # Angular MF (experience timeline)
│  ├─ mf-projects/              # Angular MF (project showcase)
│  ├─ mf-skills/                # Vue.js MF (skills matrix)
│  └─ storybook/                # Design system & component library
│
├─ libs/                         # Shared libraries
│  ├─ design-tokens/            # CSS custom properties & design system
│  ├─ ui-components/            # Web Components + Angular/Vue wrappers
│  ├─ shared-types/             # TypeScript types & interfaces
│  └─ utils/                     # Utility functions & helpers
│
├─ docs/                         # Documentation
│  ├─ ADR/                       # Architecture Decision Records
│  ├─ ARCHITECTURE.md            # System architecture
│  ├─ DEPLOYMENT.md              # Deployment strategy
│  ├─ VERSIONING.md              # Microfrontend versioning
│  └─ DESIGN_SYSTEM.md           # Design system guidelines
│
├─ .github/
│  └─ workflows/                 # CI/CD pipelines
│
└─ Configuration files (root)
   ├─ package.json
   ├─ pnpm-workspace.yaml
   ├─ tsconfig.json
   ├─ eslint.config.js
   └─ prettier.config.js
```

---

## 🎯 Applications

### **astro-shell** (Main Host)
Ultra-fast hosting platform for landing page, about section, and blogs.

```bash
cd apps/astro-shell
pnpm dev
# Open http://localhost:3000
```

### **mf-profile** (Angular Microfrontend)
Interactive experience timeline showcasing 8+ years of professional journey.

```bash
cd apps/mf-profile
pnpm dev
# Exposes Module Federation on port 5001
```

### **mf-projects** (Angular Microfrontend)
Showcase of enterprise projects with filtering and detailed case studies.

```bash
cd apps/mf-projects
pnpm dev
# Exposes Module Federation on port 5002
```

### **mf-skills** (Vue.js Microfrontend)
Interactive skills matrix with version history and proficiency levels.

```bash
cd apps/mf-skills
pnpm dev
# Exposes Module Federation on port 5003
```

### **storybook** (Design System)
Web Components and UI library documentation.

```bash
cd apps/storybook
pnpm dev
# Open http://localhost:6006
```

---

## 📚 Shared Libraries

### `@portfolio/design-tokens`
CSS custom properties, color palettes, typography scales.

```typescript
// Usage in any app
import '@portfolio/design-tokens';
// CSS variables available globally
// --color-primary, --color-surface, --spacing-*, etc.
```

### `@portfolio/ui-components`
Web Components + Angular/Vue framework wrappers.

```typescript
// Angular usage
import { PfButton } from '@portfolio/ui-components/angular';

// Vue usage
import { PfButton } from '@portfolio/ui-components/vue';

// Web Components (framework-agnostic)
import '@portfolio/ui-components/web';
```

### `@portfolio/shared-types`
TypeScript interfaces and types shared across apps.

```typescript
import type { Project, Skill, Experience } from '@portfolio/shared-types';
```

### `@portfolio/utils`
Utility functions and helpers.

```typescript
import { formatDate, groupBy } from '@portfolio/utils';
```

---

## 🏗️ Architecture

### Astro as Orchestrator
- **Landing page** and static content via Astro
- **Microfrontends** loaded as Astro islands when needed
- **Zero framework overhead** for content-heavy pages

### Module Federation Strategy
- Each MF independently built and versioned
- Semantic versioning: `/mf-profile@1.2.0/remoteEntry.js`
- Shared dependencies via Module Federation config
- Dynamic imports for runtime loading

### Design System Integration
- Single source of truth for tokens
- Storybook for component documentation
- Web Components for framework independence
- Design tokens used across all apps

---

## 📊 Development Workflow

### Running All Services
```bash
# Terminal 1: Astro Shell + MF hosts
pnpm dev

# All services start in parallel:
# - astro-shell        http://localhost:3000
# - mf-profile         http://localhost:5001
# - mf-projects        http://localhost:5002
# - mf-skills          http://localhost:5003
# - storybook          http://localhost:6006
```

### Code Quality

```bash
# Lint all packages
pnpm lint

# Format all files
pnpm format

# Type check
pnpm type-check

# Run tests
pnpm test

# Coverage report
pnpm test:coverage
```

---

## 📦 Building for Production

```bash
# Build all apps
pnpm build

# Output directories:
# - apps/astro-shell/dist/
# - apps/mf-profile/dist/
# - apps/mf-projects/dist/
# - apps/mf-skills/dist/
# - apps/storybook/dist/
```

---

## 🚀 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

**Recommended Stack:**
- **Astro Shell** → Vercel
- **Microfrontends** → Cloudflare Pages (or Vercel)
- **Storybook** → Chromatic (free tier)

---

## 🏛️ Architecture Decisions

See [docs/ADR/](docs/ADR/) for detailed Architecture Decision Records:

- `001-astro-as-shell.md` - Why Astro as main host
- `002-mf-versioning.md` - Microfrontend versioning strategy
- `003-web-components.md` - Web Components for interoperability

---

## 📚 Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment strategy
- [VERSIONING.md](docs/VERSIONING.md) - MF versioning
- [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) - Design guidelines

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Host** | Astro, TypeScript |
| **MF 1-2** | Angular 20+, NGRX, RxJS |
| **MF 3** | Vue 3, Composition API |
| **Design System** | Web Components, Storybook |
| **Styling** | Tailwind CSS, Design Tokens |
| **Shared** | TypeScript |
| **Testing** | Jest, Jasmine, Vitest |
| **Linting** | ESLint, Prettier |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel, Cloudflare Pages |

---

## 🧠 Key Features

✅ **Zero Cost Hosting** - Vercel + Cloudflare Pages  
✅ **Enterprise Architecture** - Microfrontends with versioning  
✅ **Monorepo Setup** - pnpm workspaces + TypeScript paths  
✅ **Design System** - Storybook + Web Components  
✅ **Type Safety** - Strict TypeScript configuration  
✅ **Code Quality** - ESLint + Prettier + pre-commit hooks  
✅ **CI/CD Ready** - GitHub Actions workflows  
✅ **Documentation** - ADRs + architecture guides  
✅ **Scalable** - Easy to add new MFs or experiences  
✅ **Framework Agnostic** - Web Components bridge  

---

## 📝 License

MIT © Jorge Adolfo Febres Cabrera

---

## 📧 Contact

- Email: jorge_febres@outlook.com
- LinkedIn: [Your LinkedIn URL]
- GitHub: [Your GitHub URL]
