# Data Fetching & API

## Architecture

Use this separation:

- services: raw API requests
- hooks: request lifecycle + UI-facing behavior
- components/pages: rendering and user interaction only

## Service Layer Rules

Services are responsible for:
- calling endpoints
- passing params/body
- setting headers through shared API setup
- returning response data in a predictable shape

Services should not:
- manage UI state
- contain JSX concerns
- show notifications directly
- contain component-specific logic

## Hook Layer Rules

Hooks are responsible for:
- connecting API calls to UI
- managing loading, error, and success states
- preparing data for component consumption when needed
- encapsulating repeated async behavior

Hooks should not:
- become generic abstractions too early
- hide important business behavior
- contain large rendering decisions

## Component Rules

Components and pages must not:
- call fetch/axios directly inside render-related code
- duplicate request logic already defined in services/hooks
- ignore loading, error, or empty states

Components and pages should:
- consume hooks
- render explicit request states
- trigger actions through clear handlers

## Request Lifecycle

Every data-driven screen should explicitly handle:

- loading
- success
- empty
- error

Do not skip empty state handling.

## Response Handling

- Normalize response shape if backend responses are inconsistent
- Map API data before it spreads across many components when needed
- Keep mapping logic near the service or feature boundary
- Do not leak raw backend inconsistencies deep into UI components

## API Boundaries

- Keep endpoint URLs and request logic in service files
- Do not hardcode endpoint strings across multiple files
- Reuse shared API configuration for base URL, headers, and auth
- Prefer one clear request path over duplicate request helpers

## Error Handling

- Always handle request failures explicitly
- Show user-friendly error feedback
- Preserve enough error detail for debugging if infrastructure exists
- Distinguish validation errors from general request failures

## Auth and Headers

- Handle auth headers through a shared API layer
- Do not manually attach auth headers in many components
- Keep token usage centralized
- Do not spread auth logic across unrelated features

## Stale Requests and Cleanup

- Prevent outdated requests from incorrectly updating UI
- Handle rapid re-fetch situations carefully
- Clean up async effects when needed
- Avoid race conditions in interactive screens

## Avoid

- calling API directly inside deeply nested components
- mixing rendering and request logic
- duplicating endpoint definitions
- ignoring empty states
- silently swallowing API errors
- exposing raw backend inconsistencies everywhere

## Checklist

Before finishing:
- Is the raw request inside a service?
- Is UI lifecycle handled in a hook or equivalent pattern?
- Are loading, error, success, and empty states covered?
- Is response mapping done in the right place?
- Is auth/header handling centralized?
- Can stale or overlapping requests cause incorrect UI state?