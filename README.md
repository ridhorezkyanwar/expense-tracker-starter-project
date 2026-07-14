# Expense Tracker App — Starter Project

This short, portfolio-focused description explains what the project is, how it works, and what to highlight when showing it in your portfolio. It describes the application in clear, step-by-step prose so reviewers can quickly understand the idea, core features, and the implementation approach.

---

Project at a glance

This is a minimal, client-side Expense Tracker built with plain HTML, CSS, and JavaScript. The app demonstrates how to model simple financial transactions, display a running balance, and separate incomes and expenses in a compact user interface. It is intended as a portfolio piece to show practical front-end skills: DOM manipulation, state management in vanilla JavaScript, and clear UI design.

What the app does — explained step by step (high level)

1. When the page loads, the static HTML provides the layout: a header, a small summary area that shows total balance, total income, and total expenses, and two lists for income and expense transactions. The CSS styles the layout for a clean, readable presentation.

2. The JavaScript (main.js) initializes a transactions data structure in memory. Each transaction contains a title/description, an amount, and a type (income or expense). The app keeps this data in a simple array while the user interacts with the page.

3. Adding a transaction: the user fills a form (title + amount + type) and submits. JavaScript validates the input, appends the new transaction to the in-memory array, and re-renders the UI. The new entry appears in the appropriate list (income or expense), and the summary totals update immediately.

4. Calculating totals: after every change, the app recomputes three derived values from the transactions array — total income, total expenses, and net balance — and updates the summary area in the DOM. Calculations are simple reductions over the array and demonstrate correct numeric handling and formatting.

5. Rendering and accessibility: transactions are rendered as list items with semantic markup and stable identifiers. The UI prioritizes readability: clear labels, formatted currency, and color cues for incomes vs. expenses. Data attributes and element IDs are used to make the UI deterministic for automated checks or simple unit tests.

6. Persistence (optional extension): this starter project stores state in memory by default. As an extension, it can persist transactions to localStorage so the list survives page reloads — a small and demonstrable enhancement that shows awareness of practical UX needs.

Technical notes for reviewers

- Files and roles:
  - index.html: semantic structure and initial markup.
  - style.css: visual styles and responsive layout decisions.
  - main.js: application logic, data handling, validation, rendering, and (optionally) persistence.
  - README.md: this portfolio description.

- Implementation approach: the project favors simple, explicit code without frameworks. This keeps the focus on core JavaScript skills: event handling, DOM updates, and array transformations. The code is organized to separate concerns (data management vs. DOM rendering) so each part is small and testable.

- What to highlight in a portfolio write-up: 1) the problem statement (track income and expenses simply), 2) the main features (add transaction, view totals, separate lists), 3) technical choices (vanilla JS, separation of concerns, optional localStorage), and 4) possible improvements (validation, editing/deleting transactions, animations, tests).

Design and customization

This starter project intentionally leaves styling open for personalization. For a portfolio, consider customizing colors, typography, and spacing to reflect your design sense. Keep the HTML element IDs and data attributes stable if you plan to add automated tests or keep the app compatible with an evaluation script.

Short example description for a portfolio item

"Expense Tracker — a lightweight client-side app built with HTML, CSS, and vanilla JavaScript. It demonstrates state management without frameworks, precise DOM manipulation, and a clean, responsive UI for tracking incomes and expenses. Optional localStorage persistence preserves data across reloads."

If you want, the README can be expanded with screenshots, a brief code snippet that shows the main rendering function, or a short changelog describing enhancements you made. Tell me which additions you prefer and the README will be updated accordingly.