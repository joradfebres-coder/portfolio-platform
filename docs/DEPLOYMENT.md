# 🚀 Deployment Strategy

## Quick Reference

| Component | Platform | Cost | Build Time | Deploy Trigger |
|-----------|----------|------|-----------|-----------------|
| **Astro Shell** | Vercel | Free | ~30s | Push to main |
| **MF-Profile** | Cloudflare Pages | Free | ~20s | Push to main |
| **MF-Projects** | Cloudflare Pages | Free | ~20s | Push to main |
| **MF-Skills** | Cloudflare Pages | Free | ~20s | Push to main |
| **Storybook** | Chromatic | Free tier | ~40s | Push to main |

**Total Cost: $0/month** ✅

---

## Astro Shell → Vercel

### Why Vercel?
- Zero-config deployment for Astro
- Automatic HTTPS
- Global CDN
- Preview URLs for every PR
- Free tier includes ≥30 concurrent functions

### Setup

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git push origin main
   
   # Visit https://vercel.com
   # Click "Import Project"
   # Select your GitHub repo
   ```

2. **Configure Build**
   ```plaintext
   Framework Preset: Astro
   Root Directory: apps/astro-shell
   Build Command: pnpm build
   Output Directory: dist
   ```

3. **Environment Variables**
   ```env
   # .env.production
   MF_PROFILE_VERSION=latest
   MF_PROJECTS_VERSION=latest
   MF_SKILLS_VERSION=latest
   
   # URLs of deployed MFs
   MF_PROFILE_URL=https://mf-profile.example.com
   MF_PROJECTS_URL=https://mf-projects.example.com
   MF_SKILLS_URL=https://mf-skills.example.com
   ```

4. **Deploy**
   ```bash
   # Automatic on push to main
   # Or manual via Vercel dashboard
   vercel --prod
   ```

### Vercel Deployment File
```yaml
# apps/astro-shell/vercel.json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "outputDirectory": "dist"
}
```

---

## Microfrontends → Cloudflare Pages

### Why Cloudflare Pages?
- Free for unlimited sites
- Global edge network (200+ data centers)
- Automatic HTTPS
- Build logs and preview URLs
- GitHub integration
- Good for static assets and SPA routing

### Setup for Each MF

#### Step 1: Build Configuration
```toml
# apps/mf-profile/wrangler.toml
name = "mf-profile"
type = "javascript"

[env.production]
name = "mf-profile-prod"
routes = [
  { pattern = "example.com/*", zone_name = "example.com" }
]

[build]
command = "pnpm build"
cwd = "."
watch_paths = ["src/**/*.ts"]
watch_paths = ["public/**/*"]

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "..."
```

#### Step 2: GitHub Actions
Cloudflare Pages connects directly to GitHub (auto-deploy on push).

1. Visit Cloudflare Dashboard
2. Go to Pages
3. Click "Create a project"
4. Select GitHub repo
5. Configure build:
   - Build command: `cd apps/mf-profile && pnpm build`
   - Build output directory: `dist`
   - Root directory: `/`

#### Step 3: Custom Domain
```bash
# In Cloudflare dashboard
# Pages > mf-profile > Custom domain
# Add: mf-profile.example.com
```

#### Step 4: Versioning
After deployment, create version directory:
```bash
#!/bin/bash
# scripts/deploy-mf-versioned.sh

MF_NAME=$1
VERSION=$(jq -r '.version' "apps/mf-${MF_NAME}/package.json")

# Build
cd "apps/mf-${MF_NAME}"
pnpm build

# Create version directory
mkdir -p dist/v${VERSION}
cp -r dist/*.js dist/v${VERSION}/
cp -r dist/assets/* dist/v${VERSION}/

# Deploy to Cloudflare (via Pages)
npx wrangler pages deploy dist/
```

---

## Storybook → Chromatic

### Why Chromatic?
- Free tier: 7 snapshots/month (enough for portfolio)
- Automatic visual regression testing
- Deployed from Storybook builds
- Perfect for design documentation

### Setup

1. **Create Chromatic Account**
   ```bash
   npm install -g chromatic
   chromatic --project-token YOUR_TOKEN
   ```

2. **GitHub Action**
   ```yaml
   # .github/workflows/storybook.yml
   name: Chromatic
   
   on: [push, pull_request]
   
   jobs:
     chromatic:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: pnpm install
         - run: pnpm build:storybook
         - uses: chromaui/action@v1
           with:
             projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
   ```

3. **View at**
   ```
   https://[project-id].chromatic.com
   ```

---

## Full CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Build & Deploy All

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io

jobs:
  # 1. Lint & Type Check
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check

  # 2. Test
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test

  # 3. Build All
  build:
    needs: [quality, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: builds
          path: |
            apps/*/dist
            apps/storybook/storybook-static

  # 4. Deploy (only on main branch)
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Astro to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          cd apps/astro-shell
          npx vercel --prod --token=$VERCEL_TOKEN
      
      - name: Deploy MF-Profile to Cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          cd apps/mf-profile
          npx wrangler pages deploy dist/
      
      - name: Deploy MF-Projects to Cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          cd apps/mf-projects
          npx wrangler pages deploy dist/
      
      - name: Deploy MF-Skills to Cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          cd apps/mf-skills
          npx wrangler pages deploy dist/
      
      - name: Deploy Storybook to Chromatic
        env:
          CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
        run: |
          cd apps/storybook
          npm run build
          npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN

  # 5. Notify
  notify:
    if: always()
    needs: [deploy]
    runs-on: ubuntu-latest
    steps:
      - name: Slack Notification
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Portfolio deployment status: ${{ needs.deploy.result }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Portfolio Deployment*\n${{ needs.deploy.result == 'success' && '✅ All services deployed' || '❌ Deployment failed' }}"
                  }
                }
              ]
            }
```

---

## Environment Variables Setup

### Vercel Secrets
```bash
# Login to Vercel CLI
vercel login

# Set production env vars
vercel env add MF_PROFILE_VERSION production latest
vercel env add MF_PROJECTS_VERSION production latest
vercel env add MF_SKILLS_VERSION production latest
```

### GitHub Secrets
```bash
# Go to Settings > Secrets > New repository secret

# Vercel
VERCEL_TOKEN = <get from vercel.com/account/tokens>

# Cloudflare
CLOUDFLARE_API_TOKEN = <get from cloudflare dashboard>
CLOUDFLARE_ACCOUNT_ID = <your account id>

# Chromatic
CHROMATIC_PROJECT_TOKEN = <get from chromatic.com>
```

---

## Rollback Procedures

### Rollback Astro Shell
```bash
# 1. Check deployment history
vercel list

# 2. Rollback to previous deployment
vercel rollback [deployment-id]

# Or rebuild with different code
git revert <commit-hash>
git push origin main
```

### Rollback Individual MF
```bash
# 1. Change version in apps/mf-profile/package.json
# 2. Update Astro .env.production
MF_PROFILE_VERSION=1.1.0  # (was 1.2.0)

# 3. Redeploy shell
vercel deploy --prod

# 4. MF v1.1.0 was already deployed, reusing cached version
```

---

## Custom Domain Setup

### DNS Configuration
```
DNS Provider: (Cloudflare, Route53, etc.)

vercel-shell.example.com    → CNAME → [your-project].vercel.app
mf-profile.example.com      → CNAME → [profile].pages.dev
mf-projects.example.com     → CNAME → [projects].pages.dev
mf-skills.example.com       → CNAME → [skills].pages.dev
storybook.example.com       → CNAME → [chromatic-id].chromatic.com
```

### Vercel Custom Domain
```bash
vercel alias set astro-shell.vercel.app example.com
```

---

## Monitoring & Logging

### Vercel Dashboard
- https://vercel.com/dashboard

### Cloudflare Pages Dashboard
- https://dash.cloudflare.com/pages

### GitHub Actions
- https://github.com/[user]/portfolio-platform/actions

### Chromatic Storybook
- https://[project].chromatic.com

---

## Cost Analysis

| Service | Pricing | Portfolio Use |
|---------|---------|--|
| **Vercel** | Free tier | Astro shell |
| **Cloudflare Pages** | Free tier | All MFs |
| **Chromatic** | Free 7 snapshots/month | Design system |
| **GitHub** | Free | Repository & CI/CD |
| **Domain** | ~$10/year | example.com |
| **CDN** | Included | Global distribution |

**Total: ~$10/year** (domain only)

---

## Next Steps

1. Create Vercel account and connect repo
2. Create Cloudflare account and configure Pages
3. Generate API tokens and add to GitHub Secrets
4. Test full pipeline on develop branch
5. Deploy to production (main branch)
