# ADR 001: Astro as Main Host / Shell Application

**Status:** Accepted  
**Date:** 2026-02-02  
**Deciders:** Jorge Adolfo Febres Cabrera  
**Affects:** Architecture, deployment, performance

## Problem Statement

Need a main host application for portfolio that:
1. Serves as landing page (zero JS overhead)
2. Orchestrates microfrontends as islands
3. Maintains excellent SEO and performance
4. Supports content-heavy sections (blog, docs)
5. Remains maintainable and scalable

## Considered Options

### Option 1: Astro (Chosen) ✅
**Pros:**
- Zero JavaScript for static content
- Astro Islands for selective hydration
- Built-in Module Federation support
- Excellent SEO (automatic sitemap, meta tags)
- Fast builds and deployments
- Perfect for content-first approach
- Integrates seamlessly with MFs

**Cons:**
- Learning curve if coming from SPA frameworks
- Limited real-time capabilities (but not needed)

### Option 2: Next.js (SSG mode)
**Pros:**
- Wide ecosystem
- React component reusability
- Image optimization

**Cons:**
- Still ships JavaScript even in SSG
- Heavier bundle than Astro
- Overkill for content-focused host
- MF integration less natural

### Option 3: Nuxt (SSG mode)
**Pros:**
- Vue ecosystem
- File-based routing

**Cons:**
- Still ships JavaScript
- Heavier than Astro
- Conflicts with Vue MF (version management)

### Option 4: Plain HTML + Module Federation
**Pros:**
- Minimal setup
- Maximum control

**Cons:**
- No ecosystem support
- Manual route management
- No dev experience (HMR, etc.)

## Decision

**CHOSEN: Option 1 - Astro**

Astro is the ideal host because:

1. **Zero JS for content** - Landing pages and static content render pure HTML
2. **Islands Architecture** - MFs loaded on-demand as interactive islands
3. **Performance First** - LCP, FID, CLS optimized by default
4. **Content Friendly** - Blog, docs, case studies as .md or .astro
5. **Enterprise Grade** - Used by large companies (Netflix, Discord, etc.)
6. **MF Compatible** - Integrates with Module Federation naturally
7. **Deployment** - Vercel free tier with zero-config

## Implementation Details

### Structure
```
astro-shell/
├── src/
│  ├── pages/              # File-based routing
│  │  ├── index.astro      # Landing page
│  │  ├── about.astro
│  │  └── blog/
│  │     └── [slug].astro
│  │
│  ├── components/
│  │  ├── Navigation.astro
│  │  └── MFIsland.astro   # Generic MF loader
│  │
│  ├── layouts/
│  │  └── MainLayout.astro
│  │
│  └── styles/
│     └── global.css
│
├── astro.config.mjs       # Module Federation config
├── package.json
└── tsconfig.json
```

### Module Federation Integration
```typescript
// astro.config.mjs
export default defineConfig({
  integrations: [
    moduleExternals({
      externals: [
        '@portfolio/design-tokens',
        '@portfolio/ui-components',
        '@portfolio/shared-types',
      ],
    }),
  ],
  vite: {
    ssr: {
      external: ['@portfolio/design-tokens'],
    },
  },
});
```

### MF Island Loading
```astro
---
// src/components/MFIsland.astro
interface Props {
  name: string;
  remoteEntry: string;
  scope: string;
}

const { name, remoteEntry, scope } = Astro.props;
---

<div id={`mf-${name}`} data-mf={name}>
  <script define:vars={{ remoteEntry, scope }}>
    // Dynamic Module Federation loading
  </script>
</div>
```

## Consequences

### Benefits
✅ Landing page loads in <1s (even on slow networks)  
✅ MFs can be updated independently  
✅ SEO automatically optimized  
✅ Excellent developer experience  
✅ Free hosting on Vercel  
✅ Easy to add blog/docs  
✅ Integrates with design system seamlessly  

### Challenges
⚠️ Team needs to learn Astro basics  
⚠️ Different paradigm from SPA frameworks  
⚠️ Real-time data requires API polling or WebSockets  

## Related Decisions

- [ADR 002: MF Versioning Strategy](002-mf-versioning.md)
- [ADR 003: Web Components for Interoperability](003-web-components.md)

## References

- [Astro Official Docs](https://docs.astro.build)
- [Islands Architecture](https://www.patterns.dev/posts/islands-architecture/)
- [Astro + Module Federation](https://docs.astro.build/en/guides/mpa/)

---

**Next Step:** Implement Astro shell with basic pages and MF island loader.
