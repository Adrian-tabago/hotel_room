# Hotel Reservation System

## Organized structure

- `backend.js` — Express/MongoDB server
- `models/schema.js` — Mongoose schemas/models
- `data/roomdata.js` — room data file
- `public/` — browser-facing files
  - HTML pages are directly inside `public/`
  - CSS is inside `public/css/`
  - JavaScript is inside `public/js/`

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

`node_modules/` and `.git/` are intentionally not included in the cleaned project archive.
