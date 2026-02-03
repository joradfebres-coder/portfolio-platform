# UI Components Library

Framework-agnostic Web Components + framework-specific wrappers.

## Structure
```
ui-components/
├── src/
│  ├── components/
│  │  ├── button/
│  │  │  ├── button.ts
│  │  │  ├── button.styles.css
│  │  │  └── button.test.ts
│  │  │
│  │  ├── card/
│  │  ├── badge/
│  │  └── ... (add more components)
│  │
│  ├── angular/
│  │  ├── button.component.ts
│  │  ├── card.component.ts
│  │  └── index.ts
│  │
│  ├── vue/
│  │  ├── Button.vue
│  │  ├── Card.vue
│  │  └── index.ts
│  │
│  └── index.ts  (barrel exports)
│
├── stories/
│  ├── Button.stories.ts
│  └── Card.stories.ts
│
├── package.json
└── README.md
```

## Creating a New Component

### 1. Web Component (Core)
```
libs/ui-components/src/components/your-component/
├── your-component.ts       # Main implementation
├── your-component.styles.css
└── your-component.test.ts
```

### 2. Angular Wrapper
```
libs/ui-components/src/angular/
├── your-component.component.ts
```

### 3. Vue Wrapper
```
libs/ui-components/src/vue/
├── YourComponent.vue
```

### 4. Storybook Story
```
apps/storybook/stories/
├── YourComponent.stories.ts
```

## To Scale

- Add new components in `components/`
- Create wrappers in `angular/` and `vue/`
- Document in Storybook
- Test in isolation

**No framework code duplication** - all logic in Web Components.
