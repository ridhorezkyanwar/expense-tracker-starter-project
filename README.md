# Expense Tracker — Vanilla JavaScript

<p><a href="https://expense-tracker-demo-ashen.vercel.app/"><img src="https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel" alt="Live demo" /></a></p>

A small, browser-only expense tracker built with HTML, CSS, and JavaScript. It demonstrates basic transaction management and DOM updates without a backend.

## Features

- Add income and expense transactions with a description, amount, and date.
- Display total income, total expenses, and calculated balance.
- Search transactions by description.
- Edit a transaction, change its income/expense type, or delete it.
- Save transactions in the current browser's `localStorage`.
- Render transaction descriptions as text rather than HTML to avoid stored-XSS from manipulated local data.

## Run locally

Open `index.html` directly in a modern browser, or serve the directory over HTTP:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

No build step or package manager is required. A deployed static demo is available at https://expense-tracker-demo-ashen.vercel.app/.

## Data and security limitations

- This is a learning demo, not a financial service.
- Transactions are stored only in the browser profile that created them. They are not sent to a server, synced across devices, or backed up.
- Browser storage is not encrypted by this app and can be edited by the user or other scripts running on the same origin. Do not enter sensitive financial information.
- Clearing site data or changing browser profiles can remove access to stored transactions.
- The app has no user account, authentication, server-side authorization, or automated financial reconciliation.

## Implementation notes

- `index.html` contains the forms and summary layout.
- `style.css` contains presentation.
- `main.js` implements validation, rendering, search, editing, deletion, and browser storage.
- The `data-testid` attributes are retained for UI test automation.
