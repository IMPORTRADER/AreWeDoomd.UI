# State Management

## State Types

### Local UI state
Use for:
- modal open/close
- dropdown state
- active tab
- local filters
- temporary UI interactions

Preferred tools:
- useState
- useReducer for more complex transitions

### Form state
Use for:
- input values
- touched state
- validation errors
- submit state

Keep form state local to the form unless there is a clear reason not to.

### Server state
Use for:
- data fetched from backend
- request lifecycle
- refetchable remote data

Server state must not be treated like normal local state.

### Shared app state
Use for:
- authenticated user
- theme
- language
- global app-level preferences
- truly shared cross-page state

Do not create shared state unless multiple distant parts of the app need the same client-side value.

## Decision Guide

Use `useState` when:
- state is local
- state is simple
- updates are straightforward

Use `useReducer` when:
- state has multiple related fields
- state transitions are easier to model as actions
- there are multiple update paths

Use Context when:
- state must be shared across multiple branches
- prop drilling becomes noisy
- update frequency is not excessive

Use API hooks/services when:
- data comes from the backend
- loading/error/success lifecycle is required
- refresh or invalidation is needed

## Rules

- Keep state as local as possible
- Do not duplicate state across components
- Avoid multiple sources of truth
- Do not store derived values as state unless necessary
- Prefer computed values over redundant state
- Keep state shape minimal and predictable
- Reset temporary UI state when leaving a flow if appropriate

## Derived State

Prefer:
- computing filtered lists from source data
- computing booleans from existing values
- computing UI labels from state

Avoid:
- storing values that can be derived from props or existing state
- syncing duplicated values manually

## Shared State Boundaries

- Shared app state should stay small
- Do not place page-specific UI state in global context
- Do not move feature state to global state too early
- Prefer feature-local ownership before app-wide ownership

## Avoid

- putting everything in Context
- storing server responses in multiple local states
- syncing props into state without a strong reason
- storing derived data as separate state
- mixing server state and UI state in unclear ways

## Checklist

Before finishing:
- Is this state local, shared, form, or server state?
- Is there a single source of truth?
- Can any stored value be derived instead?
- Is global/shared state really necessary?
- Is the update logic simple enough for useState, or should it useReducer?