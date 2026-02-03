# Utils Library

Utility functions and helpers shared across all apps.

## Structure
```
utils/
├── src/
│  ├── array/
│  │  ├── groupBy.ts
│  │  ├── unique.ts
│  │  └── index.ts
│  │
│  ├── date/
│  │  ├── formatDate.ts
│  │  ├── calculateYears.ts
│  │  └── index.ts
│  │
│  ├── string/
│  │  ├── slugify.ts
│  │  └── index.ts
│  │
│  └── index.ts  (barrel exports)
│
├── src/__tests__/
│  └── (mirror src structure with .test.ts files)
│
├── package.json
└── README.md
```

## Usage

```typescript
import { formatDate, groupBy, calculateYears } from '@portfolio/utils';

const yearsExperience = calculateYears(startDate);
const formattedDate = formatDate(date, 'MMM yyyy');
const byCompany = groupBy(experiences, (exp) => exp.company);
```

## To Add New Utils

1. Create file in appropriate subfolder
2. Add tests alongside
3. Export from `src/index.ts`
4. Use everywhere - **100% reusable**

**Convention:** One function per file, well-tested, well-documented.
