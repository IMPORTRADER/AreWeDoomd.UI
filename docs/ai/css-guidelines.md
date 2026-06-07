# CSS Guidelines

## Core Principles

- Keep styles predictable and maintainable
- Keep styles as local as possible
- Prefer consistency over one-off visual decisions
- Reuse existing design patterns before creating new ones

## Styling Scope

- Prefer component-scoped styles
- Avoid global CSS unless it is truly app-wide
- Global styles should be limited to resets, typography foundations, theme variables, and shared layout primitives if needed

## Layout Rules

- Prefer flexbox and grid for layout
- Use margin for spacing intentionally, not as a layout hack
- Parent components control layout between children
- Child components control their internal spacing
- Avoid absolute positioning unless layout truly requires it

## Spacing Scale

Use a consistent spacing scale such as:
- 4
- 8
- 12
- 16
- 24
- 32

Rules:
- avoid random spacing values
- prefer existing spacing steps
- keep spacing visually consistent across similar components

## Responsive Rules

- Prefer mobile-first thinking
- Use consistent breakpoints across the app
- Prefer fluid widths over rigid fixed widths
- Do not hardcode layout values that break easily on smaller screens

## Colors and Tokens

- Do not repeatedly hardcode color values across components
- Reuse existing design tokens, variables, or shared values
- Keep success, warning, error, and primary colors consistent
- Introduce new colors only when there is a clear design need

## Typography

- Keep text styles consistent
- Reuse existing font sizes and weights
- Avoid one-off text styling unless justified by a specific UI need

## State Styling

Interactive elements should define:
- hover state
- active state
- focus state
- disabled state

Error-prone or destructive UI should also have visually clear warning/destructive treatment.

## Inline Styles

- Avoid inline styles for static styling
- Use inline styles only for truly dynamic values when needed
- Do not replace normal component styling with large inline style objects

## Reuse Rules

- When styling patterns repeat, prefer reusable components over copied CSS
- Reuse shared utility patterns only when they stay understandable
- Do not create abstraction layers for a pattern used only once

## Selector Rules

- Keep selectors simple
- Avoid deep nesting
- Avoid overly specific selectors
- Avoid styling based on fragile DOM structure

## Z-Index Rules

- Use a small consistent z-index scale
- Reserve layers for specific purposes such as dropdown, sticky header, modal, tooltip
- Do not assign arbitrary z-index values without a clear layering rule

## Avoid

- !important
- deep nested selectors
- random spacing values
- repeated hardcoded colors
- large inline style objects
- styling that depends on fragile markup structure
- mixing layout responsibilities between parent and child without clarity

## Checklist

Before finishing:
- Are styles scoped correctly?
- Is spacing consistent with the scale?
- Is layout using flex/grid instead of hacks?
- Are hover/focus/disabled states defined?
- Are colors consistent with existing usage?
- Is any style duplicated enough to justify reuse?
- Is responsive behavior reasonable?