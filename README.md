# Orchard Row — Fruit Ledger

A PHP + AJAX + jQuery fruit list app built to the EssEmm Technologies test
brief: search/connect, add, and replace fruits in a table, with no MySQL
required.

## Run it

Any PHP 7.4+/8.x with the built-in server works, no extensions needed:

```
cd fruit-app
php -S localhost:8000
```

Then open `http://localhost:8000/` in a browser.

(Also works on a normal Apache/Nginx + PHP-FPM stack — just point the
document root at this folder.)

## How it's put together

- **`index.html` / `css/style.css` / `js/app.js`** — the front end. jQuery
  (loaded from the public CDN, `code.jquery.com`) drives every interaction
  over AJAX; nothing is hard-coded — the dropdown and the table are both
  rendered from the same `list` response, so they can't drift apart.
- A few touches beyond the base brief: adding a fruit scatters a small
  burst of matching fruit emoji across the screen (falls back to a
  generic fruit emoji for names it doesn't recognize), the just-added row
  slides into the table instead of popping in, Connect gives the matched
  row a highlight pulse and scrolls it into view, and the panels ease in
  on load. All of it is CSS-driven and backs off automatically under
  `prefers-reduced-motion`.
- **`php/FruitController.php`** — the only file that knows this is an HTTP
  endpoint. It reads `$_REQUEST`, validates input, calls into `FruitStore`,
  and always replies with the same envelope: `{ success, message, data }`.
  One action (`list`, `add`, `replace`, `connect`) per request, dispatched
  by an `action` parameter.
- **`php/FruitStore.php`** — the data logic. It owns the fruit list, the
  case-insensitive duplicate rule, and position lookups, and persists to a
  flat JSON file (`data/fruits.json`, created automatically on first run)
  instead of a database. `FruitController` never touches the file or the
  array directly — it only calls `FruitStore`'s methods.
- Server-side validation is independent of the front end: empty names and
  case-insensitive duplicates are rejected inside `FruitStore`/
  `FruitController` regardless of what the browser already checked.

## Design

Instead of a generic card-and-shadow layout, the UI takes its palette and
type from a produce-stand chalkboard: deep bottle-green panels, a hand-
signage serif (Fraunces) for the headline, mustard/leaf/tomato accents for
the three actions, and a striped ledger table for the fruit list.
