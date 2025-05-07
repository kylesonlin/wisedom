# UI Primitives Documentation

This document outlines the core UI components and design system used in our application.

## Design System

Our design system is built on a foundation of consistent colors, spacing, typography, and animations. The theme configuration can be found in `styles/theme.ts`.

### Colors

We use a semantic color system with the following main categories:
- Primary: Main brand colors
- Secondary: Supporting colors
- Success: Positive states and confirmations
- Error: Error states and warnings
- Warning: Cautionary states

### Typography

Font families:
- Sans-serif: Inter (primary)
- Monospace: JetBrains Mono (for code)

### Spacing

We use a consistent spacing scale:
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 2.5rem (40px)
- 3xl: 3rem (48px)

## Core Components

### Button (`components/ui/Button.tsx`)
A versatile button component with multiple variants and states.

```tsx
<Button
  variant="primary" // 'primary' | 'secondary' | 'outline'
  size="md" // 'sm' | 'md' | 'lg'
  isLoading={false}
  disabled={false}
  onClick={() => {}}
>
  Click me
</Button>
```

### Input (`components/ui/Input.tsx`)
Text input component with various states and validation support.

```tsx
<Input
  type="text"
  placeholder="Enter text..."
  error="Error message"
  disabled={false}
  onChange={(e) => {}}
/>
```

### Card (`components/ui/Card.tsx`)
Container component for grouping related content.

```tsx
<Card
  variant="elevated" // 'flat' | 'elevated'
  padding="md" // 'sm' | 'md' | 'lg'
>
  Card content
</Card>
```

### Modal (`components/ui/Modal.tsx`)
Modal dialog component for overlays and popups.

```tsx
<Modal
  isOpen={true}
  onClose={() => {}}
  title="Modal Title"
>
  Modal content
</Modal>
```

## Usage Guidelines

1. **Consistency**
   - Always use the provided UI primitives instead of creating new components
   - Follow the spacing and typography scales
   - Use semantic colors from the theme

2. **Accessibility**
   - Include proper ARIA labels
   - Ensure keyboard navigation works
   - Maintain sufficient color contrast

3. **Responsive Design**
   - Use the provided breakpoints
   - Test on multiple screen sizes
   - Follow mobile-first approach

4. **Performance**
   - Lazy load components when possible
   - Optimize images and assets
   - Use proper loading states

## Extending the System

To add new components or modify existing ones:

1. Create the component in `components/ui/`
2. Use the theme variables from `styles/theme.ts`
3. Add proper TypeScript types
4. Include accessibility features
5. Document the component in this file
6. Add unit tests

## Best Practices

1. **Component Composition**
   - Build complex components from simple primitives
   - Keep components focused and single-purpose
   - Use composition over inheritance

2. **State Management**
   - Use React hooks for local state
   - Consider context for shared state
   - Keep state as close as possible to where it's used

3. **Styling**
   - Use Tailwind utility classes
   - Follow the theme configuration
   - Maintain consistent spacing and alignment

4. **Testing**
   - Write unit tests for components
   - Test accessibility features
   - Include visual regression tests 