// Shared client-side required-field validation, derived from each form's
// existing `label="x*"` asterisk convention. Replaces the old no-op
// `state !== initialState` check (always true - a reference comparison
// against a freshly-destructured object it can never equal) that let every
// Add/Update form submit with blank required fields.

function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function getMissingFields(state, requiredFields) {
  return (requiredFields || []).filter((field) => isEmpty(state?.[field]));
}

export function hasMissingFields(state, requiredFields) {
  return getMissingFields(state, requiredFields).length > 0;
}
