# Shared Types Library

TypeScript interfaces and domain models shared across all apps.

## Structure
```
shared-types/
├── src/
│  ├── models/
│  │  ├── experience.types.ts
│  │  ├── project.types.ts
│  │  ├── skill.types.ts
│  │  └── timeline.types.ts
│  │
│  ├── api/
│  │  ├── responses.types.ts
│  │  └── requests.types.ts
│  │
│  ├── ui/
│  │  └── component-props.types.ts
│  │
│  └── index.ts  (barrel exports)
│
├── package.json
└── README.md
```

## Usage

```typescript
// Any app or lib
import type { Experience, Project, Skill } from '@portfolio/shared-types';

const exp: Experience = {
  title: 'Senior Frontend Developer',
  company: 'Baufest',
  startDate: '2024-07-01',
  // ...
};
```

## To Add New Types

1. Create file in `src/models/` or `src/api/`
2. Export from `src/index.ts`
3. Use in any app - **no recompilation needed**

**Tip:** Keep types focused on domain (Experience, Project) not implementation.
