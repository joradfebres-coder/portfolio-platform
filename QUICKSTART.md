# ⚡ Quick Start Guide

Get the portfolio platform running in **5 minutes**.

## Prerequisites

- **Node.js** ≥ 18 ([download](https://nodejs.org/))
- **pnpm** ≥ 8 (install: `npm install -g pnpm`)
- **Git** ([download](https://git-scm.com/))

## Step 1: Clone & Install

```bash
# Navigate to project
cd portfolio-platform

# Install all dependencies (monorepo)
pnpm install

# This installs dependencies for ALL apps and libs at once
# Takes ~2 minutes (first time)
```

## Step 2: Start Development

### Option A: Run Everything in Parallel ⭐
```bash
pnpm dev
```

This starts **all services** simultaneously:
- **Astro Shell** → http://localhost:3000 (Landing page)
- **MF-Profile** → http://localhost:5001 (Module Federation)
- **MF-Projects** → http://localhost:5002 (Module Federation)
- **MF-Skills** → http://localhost:5003 (Module Federation)
- **Storybook** → http://localhost:6006 (Design System)

### Option B: Run Specific Service
```bash
# Astro shell only
cd apps/astro-shell
pnpm dev

# Or any MF
cd apps/mf-profile
pnpm dev
```

## Step 3: Make Your First Edit

### Edit Astro Landing Page
```astro
---
// apps/astro-shell/src/pages/index.astro
---

<h1>Hello, {name}!</h1>  <!-- Change this -->
```

Save and see changes instantly at http://localhost:3000

### Edit Angular MF
```typescript
// apps/mf-profile/src/app/experience.component.ts

title = 'My Experience Timeline';  // Change this
```

Changes reload instantly in the MF

### Edit Vue MF
```vue
<!-- apps/mf-skills/src/App.vue -->

<h1>{{ title }}</h1>  <!-- Edit this -->
```

Auto-reloads in dev server

## Step 4: Build for Production

```bash
# Build all apps
pnpm build

# Output in:
# - apps/astro-shell/dist/
# - apps/mf-profile/dist/
# - apps/mf-projects/dist/
# - apps/mf-skills/dist/
# - apps/storybook/storybook-static/
```

## Step 5: Code Quality

```bash
# Lint all packages
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check

# Run tests
pnpm test
```

---

## Common Tasks

### 🎨 Update Design Tokens
```bash
# Edit tokens
nano libs/design-tokens/tokens.json

# Build tokens
cd libs/design-tokens
pnpm build

# All apps auto-update (CSS custom properties)
```

### 🧩 Add UI Component
```bash
# Create Web Component
nano libs/ui-components/src/components/my-button/my-button.ts

# Create wrappers
nano libs/ui-components/src/angular/my-button.component.ts
nano libs/ui-components/src/vue/MyButton.vue

# Document in Storybook
nano apps/storybook/stories/MyButton.stories.ts

# Build and see in Storybook
pnpm dev
# Open http://localhost:6006
```

### 📦 Add Shared Type
```bash
# Create type
nano libs/shared-types/src/models/my-model.types.ts

# Export from index
nano libs/shared-types/src/index.ts

# Use anywhere
import type { MyModel } from '@portfolio/shared-types';
```

### 🚀 Deploy to Production

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed steps.

Quick summary:
```bash
# 1. Create Vercel account
# 2. Create Cloudflare account
# 3. Connect GitHub repo
# 4. Set environment variables
# 5. Push to main branch
# Everything deploys automatically via GitHub Actions
```

---

## Project Structure Quick Ref

```
portfolio-platform/
├─ apps/                           # Deployed applications
│  ├─ astro-shell/                # Main host (landing, about, blog)
│  ├─ mf-profile/                 # Angular MF (experience)
│  ├─ mf-projects/                # Angular MF (projects showcase)
│  ├─ mf-skills/                  # Vue MF (skills matrix)
│  └─ storybook/                  # Design system docs
│
├─ libs/                           # Shared code (NO deployment)
│  ├─ design-tokens/              # CSS custom properties
│  ├─ ui-components/              # Web Components + wrappers
│  ├─ shared-types/               # TypeScript types
│  └─ utils/                       # Helper functions
│
├─ docs/                           # Documentation
│  ├─ ADR/                         # Architecture decisions
│  ├─ ARCHITECTURE.md              # System design
│  ├─ DEPLOYMENT.md                # Deployment guide
│  └─ SCALABILITY.md               # How to scale
│
└─ Config files (root)
   ├─ package.json                 # Workspace root
   ├─ pnpm-workspace.yaml          # Monorepo config
   ├─ tsconfig.json                # TypeScript config
   ├─ eslint.config.js             # Linting rules
   └─ prettier.config.js           # Code formatting
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port (macOS/Linux)
lsof -ti :3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependency Issues
```bash
# Clean and reinstall
pnpm clean:all
pnpm install
```

### TypeScript Errors
```bash
# Check all types
pnpm type-check

# In VSCode: install "TypeScript Vue Plugin"
```

### Build Fails
```bash
# Check which app failed
pnpm build

# Build specific app
cd apps/astro-shell
pnpm build
```

---

## Next Steps

1. **Understand Architecture** → Read [ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. **Learn the Decisions** → Read [ADR/](docs/ADR/)
3. **Customize Content** → Edit app pages and components
4. **Deploy to Production** → Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md)
5. **Scale the Platform** → Check [SCALABILITY.md](docs/SCALABILITY.md)

---

## Need Help?

- 📖 **Architecture questions** → See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 🚀 **Deployment questions** → See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- 📈 **Scaling questions** → See [docs/SCALABILITY.md](docs/SCALABILITY.md)
- 🏗️ **Design decisions** → See [docs/ADR/](docs/ADR/)

---

**Ready? Run `pnpm dev` and open http://localhost:3000** 🎉
