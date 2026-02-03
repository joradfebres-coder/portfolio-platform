# ADR 002: Microfrontend Versioning Strategy

**Status:** Accepted  
**Date:** 2026-02-02  
**Deciders:** Jorge Adolfo Febres Cabrera  
**Affects:** Deployment, MF updates, versioning

## Problem Statement

When deploying multiple independent microfrontends, we need a strategy to:
1. Deploy MF updates without breaking the host
2. Support rolling back specific MFs
3. A/B test MF versions
4. Document breaking changes
5. Keep version history for debugging

## Considered Options

### Option 1: Semantic Versioning with Path-based Routing (Chosen) ✅
**Versioning:** `major.minor.patch`

**Deployment Structure:**
```
https://mf-profile.example.com/
├── v1.0.0/
│  ├── remoteEntry.js
│  ├── main.[hash].js
│  └── styles.[hash].css
├── v1.1.0/
│  ├── remoteEntry.js
│  └── ...
└── latest/ → symlink to v1.2.0
```

**Host Configuration:**
```typescript
// Environment-based version selection
const mfVersions = {
  profile: import.meta.env.MF_PROFILE_VERSION || 'latest',
  projects: import.meta.env.MF_PROJECTS_VERSION || 'latest',
  skills: import.meta.env.MF_SKILLS_VERSION || 'latest',
};

const remotes = {
  profile: `https://mf-profile.example.com/v${mfVersions.profile}/remoteEntry.js`,
  projects: `https://mf-projects.example.com/v${mfVersions.projects}/remoteEntry.js`,
  skills: `https://mf-skills.example.com/v${mfVersions.skills}/remoteEntry.js`,
};
```

**Pros:**
- Simple and clear versioning
- Easy rollbacks (change env var)
- Supports A/B testing per MF
- Browser cache friendly (different paths)
- Version history visible in deployment logs
- Production fixes don't require host rebuild

**Cons:**
- Requires version management discipline
- Need to store releases on CDN

### Option 2: Query Parameter Versioning
**Example:** `?mf-profile-v=1.2.0`

**Cons:**
- Cache issues
- Fragile versioning
- Difficult to rollback
- Not RESTful

### Option 3: DNS/Subdomain Based
**Example:** `v1-profile.example.com/remoteEntry.js`

**Cons:**
- Complex DNS management
- Expensive with multiple versions
- Difficult to track versions

### Option 4: Git Tag + GitHub Releases
**Example:** Host releases directly from GitHub

**Cons:**
- GitHub not designed for serving large assets
- Bandwidth limitations
- No CDN benefits
- Slow downloads

## Decision

**CHOSEN: Option 1 - Semantic Versioning with Path-based Routing**

Rationale:
- Clean separation of versions
- Production-grade approach used by major companies
- Supports independent MF upgrades
- Easy debugging and rollbacks
- Browser caching works well
- Version visibility in deployment pipelines

## Implementation Details

### Package.json Version
```json
{
  "name": "@portfolio/mf-profile",
  "version": "1.2.0",
  "main": "dist/remoteEntry.js"
}
```

### Build Pipeline
```bash
# Build MF
ng build --configuration production

# Create versioned output
mkdir -p dist/v1.2.0/
cp -r dist/* dist/v1.2.0/

# Create 'latest' symlink
ln -s v1.2.0 dist/latest
```

### Deployment Script
```bash
#!/bin/bash
# deploy-mf.sh

MF_NAME=$1
VERSION=$(jq -r '.version' "apps/mf-${MF_NAME}/package.json")

# Build
cd "apps/mf-${MF_NAME}"
npm run build

# Upload to CDN (Cloudflare Pages, etc.)
npm run deploy:cdn -- dist/

# Update environment variable
echo "Deploy ${MF_NAME}@${VERSION} complete"
echo "Set: MF_${MF_NAME^^}_VERSION=${VERSION}"
```

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy-mf.yml
name: Deploy MF

on:
  push:
    paths:
      - 'apps/mf-profile/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Get MF version
        id: version
        run: |
          VERSION=$(jq -r '.version' apps/mf-profile/package.json)
          echo "version=$VERSION" >> $GITHUB_OUTPUT
      
      - name: Build MF
        run: |
          cd apps/mf-profile
          npm run build
      
      - name: Deploy to Cloudflare Pages
        run: |
          # Deploy dist/ to CDN with version path
          npx wrangler pages deploy dist/
      
      - name: Update Astro Shell
        run: |
          echo "MF_PROFILE_VERSION=${{ steps.version.outputs.version }}" >> .env.production
          # Rebuild and deploy shell
```

### Environment Variables

**Development:**
```env
MF_PROFILE_VERSION=latest
MF_PROJECTS_VERSION=latest
MF_SKILLS_VERSION=latest
```

**Production:**
```env
MF_PROFILE_VERSION=1.2.0
MF_PROJECTS_VERSION=1.1.0
MF_SKILLS_VERSION=2.0.0
```

### Rollback Procedure

1. **Identify issue**
   ```bash
   # Check current versions in production
   curl https://portfolio.com/.env.production
   ```

2. **Rollback to previous version**
   ```bash
   # Update environment variable
   MF_PROFILE_VERSION=1.1.0
   
   # Rebuild host (Astro)
   vercel deploy --prod
   ```

3. **No host rebuild needed for MF rollback** (only env var change)

## Version Branching Strategy

### Branches
```
main (production)
├── release/* (feature branches that become releases)
├── hotfix/* (critical fixes)
└── develop (staging)
```

### Version Bumping
```bash
# For MF changes
cd apps/mf-profile

# Patch (bugfix): 1.2.0 → 1.2.1
npm version patch

# Minor (feature): 1.2.0 → 1.3.0
npm version minor

# Major (breaking): 1.2.0 → 2.0.0
npm version major

# This updates:
# - package.json
# - Creates git tag
# - Runs build
```

## Breaking Changes Handling

### If MF has breaking changes
1. **Must bump major version** (e.g., 1.x.x → 2.x.x)
2. **Update CHANGELOG.md** with migration guide
3. **Astro Shell** must be updated to support new API
4. **Optional:** Support both v1 and v2 simultaneously during transition

Example:
```markdown
# Changelog - mf-profile

## [2.0.0] - 2026-02-15

### Breaking Changes
- Removed `experience.filter()` method
- Changed `ExperienceStore` to use new interface

### Migration Guide
See: docs/mf-profile-v1-to-v2.md

### New Features
- Added real-time timeline sync
```

## A/B Testing Scenarios

### Scenario: Test new skills visualization
```typescript
// Astro component
const useNewSkillsUI = Math.random() > 0.5;
const skillsVersion = useNewSkillsUI ? '2.0.0' : '1.9.0';

const remotes = {
  skills: `https://mf-skills.example.com/v${skillsVersion}/remoteEntry.js`,
};
```

### Logging A/B test results
```typescript
analytics.track('mf_loaded', {
  mf: 'skills',
  version: skillsVersion,
  variant: useNewSkillsUI ? 'new' : 'control',
});
```

## Consequences

### Benefits
✅ Independent version management per MF  
✅ Quick rollbacks without host changes  
✅ Clear version history  
✅ Supports A/B testing  
✅ Production-grade approach  
✅ Browser caching optimized  

### Challenges
⚠️ Need discipline in version bumping  
⚠️ CDN management for old versions  
⚠️ Storage cost for multiple versions  

## Related Decisions

- [ADR 001: Astro as Shell](001-astro-as-shell.md)
- [ADR 003: Web Components for Interoperability](003-web-components.md)

## References

- [Semantic Versioning](https://semver.org/)
- [Module Federation Shared Dependencies](https://webpack.js.org/concepts/module-federation/)
- [Blue-Green Deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html)

---

**Next Step:** Implement version management in package.json and build scripts.
