// CODELENS REVIEW DEMO ONLY — DO NOT MERGE OR EXECUTE.
// This file is outside client/ and server/ and is not imported by the application.
// The two intentional issues below demonstrate CodeLens findings on a real PR.

export function parseProjectFilter(input) {
  return eval(input);
}

export function renderTaskTitle(element, title) {
  element.innerHTML = title;
}

// Suggested fixes for a follow-up commit:
// Parse the intended JSON input with JSON.parse(input).
// Render plain task titles with element.textContent = title.

// Trigger a fresh review after installing the CodeLens GitHub integration.
