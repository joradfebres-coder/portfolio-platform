# ADR 003: Web Components for Framework-Agnostic UI

**Status:** Accepted  
**Date:** 2026-02-02  
**Deciders:** Jorge Adolfo Febres Cabrera  
**Affects:** Component library, code reusability, framework compatibility

## Problem Statement

The portfolio uses multiple frameworks (Angular, Vue, Astro). We need:
1. Shared UI components across frameworks
2. No framework lock-in
3. Future-proof component library
4. Easy testing and documentation
5. Design consistency enforcement

## Considered Options

### Option 1: Web Components + Framework Wrappers (Chosen) ✅

**Core Layer:** Framework-agnostic Web Components
```typescript
// ui-components/src/button.ts
export class PfButton extends HTMLElement {
  connectedCallback() {
    // Custom element logic
  }
}
customElements.define('pf-button', PfButton);
```

**Framework Wrappers:**
```typescript
// Angular wrapper
import { PfButton } from '../button';
@Component({
  selector: 'pf-button-angular',
  template: '<button (click)="onClick.emit()"></button>',
})
export class ButtonComponent { }

// Vue wrapper
import { defineComponent } from 'vue';
export const PfButton = defineComponent({
  name: 'PfButton',
  template: '<button><slot /></button>',
});
```

**Pros:**
- Framework independence
- Single source of truth for logic
- Easy to add new frameworks
- Web standard (custom elements spec)
- Storybook support
- Works in Astro without extra overhead
- Future-proof

**Cons:**
- Slight learning curve (custom elements)
- CSS encapsulation needs shadow DOM
- Props passing requires attributes or events
- Testing setup slightly more complex

### Option 2: Separate Component Libraries Per Framework
**Example:** `@portfolio/ui-angular`, `@portfolio/ui-vue`, `@portfolio/ui-react`

**Cons:**
- Code duplication across libraries
- Hard to maintain consistency
- More testing burden
- Doesn't scale as we add frameworks
- Opposite of DRY principle

### Option 3: Monolithic Framework (All Angular or All Vue)
**Example:** Force all MFs to use Angular

**Cons:**
- Rigid architecture
- Larger bundle sizes
- Defeats purpose of microservices
- Team skill diversity not utilized

### Option 4: CSS-Only Component Library
**Example:** Just Tailwind classes + HTML structure

**Cons:**
- No shared behavior/logic
- Hard to manage complex interactions
- Inconsistent implementations
- No testing or documentation

## Decision

**CHOSEN: Option 1 - Web Components + Framework Wrappers**

Rationale:
1. **Reusable logic** - Single implementation across frameworks
2. **Framework flexibility** - Each MF can use its preferred framework
3. **Web standards** - Not dependent on any framework's future
4. **Easy testing** - Can test Web Components in isolation
5. **Storybook native** - Web Components work perfectly with Storybook
6. **Performance** - No extra framework overhead for small components
7. **Future-proof** - Works with new frameworks (Solid, Qwik, etc.)

## Implementation Strategy

### Project Structure
```
libs/ui-components/
├── src/
│  ├── components/
│  │  ├── button/
│  │  │  ├── button.ts              # Web Component
│  │  │  ├── button.styles.css      # Scoped styles
│  │  │  ├── button.test.ts         # Unit tests
│  │  │  └── README.md              # Storybook docs
│  │  │
│  │  └── card/
│  │     ├── card.ts
│  │     └── ...
│  │
│  ├── angular/                      # Angular wrappers
│  │  └── button.component.ts
│  │
│  ├── vue/                          # Vue wrappers
│  │  └── Button.vue
│  │
│  └── index.ts                      # Barrel exports
│
├── stories/                         # Storybook stories
│  ├── Button.stories.ts
│  └── Card.stories.ts
│
└── package.json
```

### Web Component Template

```typescript
// button.ts
import styles from './button.styles.css?inline';

export class PfButton extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachListeners();
  }

  private render() {
    const variant = this.getAttribute('variant') || 'primary';
    const disabled = this.hasAttribute('disabled');

    this.shadow.innerHTML = `
      <style>${styles}</style>
      <button 
        class="button button--${variant}"
        ${disabled ? 'disabled' : ''}
      >
        <slot></slot>
      </button>
    `;
  }

  private attachListeners() {
    const button = this.shadow.querySelector('button');
    button?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('pf-click'));
    });
  }

  // Attribute change handling
  static get observedAttributes() {
    return ['variant', 'disabled'];
  }

  attributeChangedCallback() {
    this.render();
  }
}

customElements.define('pf-button', PfButton);
```

### Angular Wrapper

```typescript
// angular/button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pf-button',
  template: `
    <button 
      [attr.variant]="variant"
      [attr.disabled]="disabled"
      (pf-click)="handleClick()"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
})
export class PfButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() disabled = false;
  @Output() click = new EventEmitter<void>();

  handleClick() {
    this.click.emit();
  }
}
```

### Vue Wrapper

```vue
<!-- vue/Button.vue -->
<template>
  <button 
    :class="`button button--${variant}`"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
});

const emit = defineEmits(['click']);
</script>

<style scoped>
.button {
  /* Component styles */
}
</style>
```

### Storybook Integration

```typescript
// stories/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/button';

const meta: Meta = {
  title: 'Components/Button',
  component: 'pf-button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => `<pf-button variant="${args.variant}">Click me</pf-button>`,
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
  },
  render: (args) => `
    <pf-button 
      variant="${args.variant}"
      ${args.disabled ? 'disabled' : ''}
    >
      Disabled Button
    </pf-button>
  `,
};
```

### Consumption in Astro

```astro
---
// src/components/MyComponent.astro
import '@portfolio/ui-components/button';
---

<pf-button variant="primary" client:load>
  Click me
</pf-button>
```

### Consumption in Angular

```typescript
// profile.component.ts
import { PfButtonComponent } from '@portfolio/ui-components/angular';

@Component({
  selector: 'profile-root',
  template: `<pf-button (click)="handleClick()">Click</pf-button>`,
  imports: [PfButtonComponent],
})
export class ProfileComponent { }
```

### Consumption in Vue

```vue
<!-- MFSkills.vue -->
<script setup lang="ts">
import { PfButton } from '@portfolio/ui-components/vue';
</script>

<template>
  <pf-button variant="secondary" @click="handleClick">
    Click me
  </pf-button>
</template>
```

## Design System Consistency

### Token Integration

```css
/* ui-components/src/button.styles.css */
:host {
  --button-padding: var(--spacing-md, 12px);
  --button-color: var(--color-primary);
  --button-font: var(--typography-button);
}

.button {
  padding: var(--button-padding);
  color: var(--button-color);
  font-family: var(--button-font);
  /* Uses tokens from design-tokens package */
}
```

## Consequences

### Benefits
✅ Framework flexibility across MFs  
✅ Single source of truth for component logic  
✅ Web standards compliance  
✅ Easy to test in isolation  
✅ Great Storybook integration  
✅ No framework lock-in  
✅ Better performance (less JS)  

### Challenges
⚠️ Requires Web Components knowledge  
⚠️ Shadow DOM CSS encapsulation edge cases  
⚠️ Attribute-based props less DX-friendly  
⚠️ Testing setup slightly more complex  

## Mitigation Strategies

**For framework wrappers:** Provide excellent TypeScript types and documentation  
**For shadow DOM:** Use CSS custom properties for styling flexibility  
**For testing:** Create test utilities for Web Components

## Related Decisions

- [ADR 001: Astro as Shell](001-astro-as-shell.md)
- [ADR 002: MF Versioning Strategy](002-mf-versioning.md)

## References

- [MDN: Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Web Components Standards](https://www.webcomponents.org/)
- [Storybook Web Components](https://storybook.js.org/docs/web-components/get-started)
- [Custom Elements Spec](https://html.spec.whatwg.org/multipage/custom-elements.html)

---

**Next Step:** Implement first set of Web Components (Button, Card, Badge).
