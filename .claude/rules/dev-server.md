---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.vue"
  - "**/*.svelte"
  - "**/*.astro"
  - "**/*.html"
  - "**/*.css"
  - "**/*.scss"
  - "**/vite.config.*"
  - "**/next.config.*"
  - "**/astro.config.*"
---

# Dev Server Rules

When you finish implementing a feature or change in response to a user request:

1. **If a dev server is already running**: include the local URL (e.g., `http://localhost:5173`) in your final message so the user can check the result immediately.
2. **If no dev server is running**: start one with `/link` and include the URL in your final message.

The user should never have to ask "where can I see this?" after you finish work.
