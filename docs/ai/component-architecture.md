# Component Architecture

## Component Types

### Page components
Responsible for:
- route-level orchestration
- composing feature sections
- connecting page flow to hooks/services

Page components should not:
- become large reusable UI blocks
- contain heavy duplicated markup
- mix too many responsibilities

### Feature components
Responsible for:
- feature-specific UI and behavior
- feature-local composition
- collaborating with feature hooks/services

### Shared components
Responsible for:
- reusable generic UI
- app-wide presentation patterns
- stable, repeated building blocks

Shared components must not:
- depend on feature-specific business logic
- import from feature folders

## Core Principles

- One component should have one clear responsibility
- Prefer small, focused, readable components
- Prefer composition over prop explosion
- Keep rendering logic understandable
- Extract repeated logic into hooks
- Extract repeated UI structure into shared or feature components when repetition is real

## When to Split a Component

Split when:
- the component has multiple responsibilities
- JSX becomes deeply nested
- state management becomes noisy
- parts of the UI can be reused
- render branches become hard to follow
- file size becomes difficult to maintain

A large component is a signal to review structure, not an automatic problem. Prioritize readability and responsibility boundaries.

## Hooks vs Components

Use a custom hook when:
- logic is reusable
- stateful behavior is repeated
- side effects are repeated
- UI should stay focused on rendering

Do not move logic into hooks if:
- it is used only once and becomes harder to read
- it hides simple behavior unnecessarily

## Props Rules

- Keep props clear and minimal
- Prefer meaningful prop names
- Group related props only when it improves clarity
- Avoid passing too many unrelated props
- Prefer composition when prop lists grow too much

## Render Rules

Do not:
- perform heavy data transformation directly in JSX
- place long inline condition chains in render
- mix API details into presentational rendering
- place complex business logic inside markup

Prefer:
- preparing data before return
- extracting render sections into subcomponents
- using helper variables for readability

## Responsibility Boundaries

Components should mainly handle:
- rendering
- local interaction
- simple UI state

Hooks/services/utils should handle:
- async logic
- reusable stateful logic
- transformation logic
- API orchestration

## Avoid

- giant page components
- deeply nested JSX trees
- shared components that know feature business rules
- prop drilling across many layers without review
- extracting abstractions too early
- components that fetch, transform, validate, and render everything themselves

## Checklist

Before finishing:
- What type of component is this: page, feature, or shared?
- Does it have one clear responsibility?
- Should any repeated logic move to a hook?
- Should any repeated UI move to a reusable component?
- Is render logic still easy to read?
- Is this component importing things from the correct layer?