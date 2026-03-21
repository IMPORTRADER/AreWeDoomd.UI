## Feature structure

Each feature should follow:

feature/
  components/
  hooks/
  services/
  utils/

## Rules

- Feature logic stays inside its feature
- Shared is only for reusable, generic code
- Do not move code to shared too early

## Import rules

- features → shared: allowed
- shared → features: NOT allowed
- feature → feature: avoid direct dependency

## Pages

- Pages only compose features
- Pages should not contain complex logic