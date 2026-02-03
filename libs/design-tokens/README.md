# Design Tokens Library

Shared design system tokens (colors, typography, spacing, shadows).

## Structure
```
design-tokens/
├── src/
│  ├── index.css          # Exports all tokens as CSS custom properties
│  ├── colors.css         # Color palette
│  ├── typography.css     # Font sizes, weights, families
│  ├── spacing.css        # Space scale
│  ├── shadows.css        # Elevation levels
│  └── breakpoints.css    # Responsive breakpoints
│
├── tokens.json           # Single source of truth (Figma sync ready)
├── package.json
└── README.md
```

## Usage

### In Astro
```astro
---
import '@portfolio/design-tokens';
---

<div style="color: var(--color-primary); padding: var(--spacing-md)">
  Content
</div>
```

### In Angular
```typescript
import '@portfolio/design-tokens';

// CSS variables available globally
```

### In Vue
```vue
<script setup>
import '@portfolio/design-tokens';
</script>

<template>
  <div :style="{ color: 'var(--color-primary)' }">
    Content
  </div>
</template>
```

## To Add New Tokens

1. Edit `tokens.json`
2. Run `pnpm build`
3. Updated `*.css` files auto-generated
4. All apps auto-update via CSS variables

**Ready for future integration with:**
- Figma Tokens plugin
- Style Dictionary
- Token Studio
