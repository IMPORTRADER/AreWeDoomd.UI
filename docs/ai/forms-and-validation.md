# Forms & Validation

## Form Responsibilities

Forms should handle:
- value collection
- validation feedback
- submit lifecycle
- field error display
- submission state

Forms should not:
- hide failure states
- duplicate validation rules across many places unnecessarily
- mix unrelated business flows into the same submit handler

## Validation Levels

### Field-level validation
Use for:
- required fields
- format checks
- simple constraints tied to one field

### Form-level validation
Use for:
- cross-field rules
- combined business rules
- final submit validation

Use the simplest validation level that correctly expresses the rule.

## Validation Timing

Validation may happen on:
- blur
- submit
- change when appropriate

Rules:
- do not overwhelm users with noisy validation too early
- ensure submit always performs final validation
- prefer predictable validation behavior across forms

## Error Messages

- Keep messages clear and specific
- Prefer user-friendly language
- Show errors near the related field when possible
- Use form-level messaging for broad submit failures

## Submit Lifecycle

Every form should clearly handle:

- initial
- dirty
- validating
- submitting
- success
- error

During submit:
- prevent duplicate submissions when appropriate
- show submitting state clearly
- disable submit if needed
- re-enable actions correctly after failure

## Backend Error Mapping

- Map backend validation errors to matching fields when possible
- Show general form error when an error is not field-specific
- Do not lose useful validation detail coming from backend responses

## Default Values and Reset

- Default values should be explicit
- Reset behavior should be intentional
- Do not leave stale values after successful flows if reset is expected
- Editing forms and creation forms should have clear initialization rules

## Reuse Rules

- Reuse shared field patterns when repetition is real
- Keep form abstractions practical
- Do not over-generalize every form into one abstraction

## Avoid

- duplicating validation logic across forms
- silent validation failures
- unclear submit state
- submit buttons that remain active during duplicate requests when they should not
- field errors shown far from the field
- mixing field-level and form-level responsibility without clarity

## Checklist

Before finishing:
- Are field-level and form-level validation separated correctly?
- Are error messages clear and placed properly?
- Is submit lifecycle handled fully?
- Are backend validation errors mapped correctly?
- Are default values and reset behavior intentional?
- Can the user clearly understand what failed and what to do next?