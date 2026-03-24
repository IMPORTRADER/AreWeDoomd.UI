# CLAUDE.md

This project uses React + JavaScript + Vite.

## Core Principles

- Prefer simple, readable, maintainable code over clever abstractions
- Keep components focused on a single responsibility
- Separate server state, UI state, and form state clearly
- Do not mix API logic with rendering logic
- Reuse existing patterns before creating new ones
- Follow folder structure and boundaries strictly
- Maintain UI and UX consistency across the application
- Application logo is accessible from: \arewedoomd-ui\public\logo

## Architecture Overview

- Pages → orchestrate features
- Features → contain feature-specific components, hooks, services
- Shared → reusable, generic components and utilities
- Services → raw API calls
- Hooks → stateful logic and API interaction
- Components → rendering and user interaction

## Non-Negotiable Rules

- Do not call APIs directly inside components
- Do not duplicate state or create multiple sources of truth
- Do not move code to shared too early
- Do not introduce new patterns without checking existing ones
- Always handle loading, error, empty, and success states
- Keep styling consistent with defined CSS rules

## State Rules

- Local UI state → useState/useReducer
- Server state → handled via services + hooks
- Form state → local to form unless necessary
- Shared state → only when truly needed

## API Rules

- All API calls must live in services
- Hooks manage request lifecycle
- Components only consume hooks
- Centralize auth and headers
- Normalize responses when needed

## Component Rules

- Keep components small and focused
- Extract reusable logic into hooks
- Prefer composition over prop drilling
- Avoid large, deeply nested JSX
- Separate page, feature, and shared components clearly

## Styling Rules

- Keep styles component-scoped
- Use consistent spacing scale
- Prefer flex/grid for layout
- Avoid inline styles unless dynamic
- Do not use !important
- Define hover, focus, and disabled states
- Use CSS variables for all colors — never hardcode hex values that exist as tokens
- AI-related UI must use `--color-ai-from`, `--color-ai-to`, `--color-ai-accent`
- Human-related UI must use `--color-human-from`, `--color-human-to`, `--color-human-accent`

## Forms Rules

- Validate clearly and consistently
- Handle full submit lifecycle
- Map backend validation errors properly
- Provide clear user feedback

## Folder & Import Rules

- features → can import shared
- shared → must not import features
- avoid feature-to-feature direct dependencies
- pages should not contain complex business logic

## Reference Documents

- Project structure: ./project-structure.md
- Component architecture: ./component-architecture.md
- State management: ./state-management.md
- Data fetching & API: ./data-fetching-and-api.md
- Forms & validation: ./forms-and-validation.md
- Code style & naming: ./code-style-and-naming.md
- CSS guidelines: ./css-guidelines.md
- Backend API definitions: ./api-endpoints.md