# Billing Generator

A tiny static web app for generating **fictional billing addresses** for testing, QA, demos, and UI mockups.

The whole thing is styled like a classic Macintosh desktop with a CRT terminal twist: pixel icons, a top menu bar, draggable windows, scanlines, boot splash, copy buttons, and a phosphor-green dark mode.

> Important: all generated data is fake. Don't use this for fraud, payment abuse, identity misuse, or anything sketchy. It's only for testing and educational work.

---

## What You Get

- Fictional address generation for multiple countries.
- Classic Mac-style UI with windows, title bars, menu dropdowns, beveled buttons, and a trash icon.
- Terminal-inspired landing page with ASCII art, scanlines, and a boot sequence.
- Light and dark themes:
  - Light mode: warm paper-terminal / amber vibe.
  - Dark mode: phosphor green CRT vibe.
- Copy-to-clipboard for each field.
- Copy All button for the full generated address.
- Fictional CC dummy generator from a BIN/prefix for UI mockups and non-transactional QA.
- CC dummy output is intentionally non-Luhn so it cannot pass real card-number validation.
- Keyboard shortcuts for faster use.
- Fully static app: just HTML, CSS, and JavaScript.
- No build step, no framework, no backend.

---

## Project Structure

```txt
billing-generating/
├── index.html          # Main page
├── css/
│   └── styles.css      # Macintosh + CRT design system
├── js/
│   ├── data.js         # Country datasets
│   ├── generator.js    # Address generation logic
│   ├── cc-generator.js # Fictional, non-Luhn CC dummy generator
│   └── app.js          # UI behavior and interactions
├── SKILL.md            # Design-system guide for future edits
└── README.md
```

---

## Run It Locally

You can open the HTML file directly, but using a local server is better because clipboard APIs work properly on `localhost`.

```bash
cd /home/ubuntu/billing-generating
python3 -m http.server 8080
```

Then open:

```txt
http://localhost:8080
```

If you really want to open it directly:

```bash
xdg-open /home/ubuntu/billing-generating/index.html
```

---

## Supported Countries

| Code | Country        | Postal Format | Phone Format     |
|------|----------------|---------------|------------------|
| US   | United States  | `#####`       | `(###) ###-####` |
| GB   | United Kingdom | `@@# #@@`     | `0#### ######`   |
| CA   | Canada         | `@#@ #@#`     | `(###) ###-####` |
| AU   | Australia      | `####`        | `0### ### ###`   |
| DE   | Germany        | `#####`       | `0### #######`   |
| FR   | France         | `#####`       | `0# ## ## ## ##` |
| JP   | Japan          | `###-####`    | `0##-####-####`  |
| ID   | Indonesia      | `#####`       | `08##-####-####` |
| SG   | Singapore      | `######`      | `#### ####`      |
| NL   | Netherlands    | `#### @@`     | `06-########`    |
| BR   | Brazil         | `#####-###`   | `(##) #####-####`|
| MX   | Mexico         | `#####`       | `## #### ####`   |

`#` means a digit, and `@` means an uppercase letter.

---

## How It Works

The generator returns a plain object like this:

```js
{
  country: "ID",
  countryName: "Indonesia",
  cardholderName: "Budi Wijaya",
  addressLine1: "Jl. Sudirman No. 142",
  addressLine2: "Blok 12",
  city: "Jakarta Selatan",
  region: "DKI Jakarta",
  postalCode: "12190",
  phoneNumber: "0812-3456-7890"
}
```

The UI reads that object and fills the form fields. Each country has its own name pools, street patterns, regions, postal format, and phone format.

---

## CC Dummy Generator

The CC dummy window accepts a BIN/prefix like `453204`, a placeholder template like `453204xxxxxxxxxx`, or pipe format like `453204|12|2028|123`, then creates fictional card-shaped rows with expiry and CVV strings.

Important behavior:

- Generated numbers preserve the entered prefix.
- Expiry month/year and CVV can be fixed or left as `rnd`.
- Count controls how many rows are generated, from 1 to 100.
- Status starts as `UNKN`; the mock checker marks rows as `SANDBOX` locally.
- Output is intentionally **non-Luhn** internally, while the UI status starts as `UNKN`.
- Use it for UI mockups, parser demos, screenshots, and seed data only.
- Do not use it for live payment checks, card checking, or transaction testing.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Command + G` | Generate a new address |
| `Ctrl/Command + Shift + C` | Copy the full address |
| `Ctrl/Command + N` | Clear / start fresh |
| `Esc` | Close open dialogs |

---

## Adding a New Country

Open `js/data.js` and add the new country code to these datasets:

1. `FIRST_NAMES`
2. `LAST_NAMES`
3. `STREET_NAMES`
4. `STREET_TYPES`
5. `REGIONS`
6. `SECONDARY_LINES`
7. `COUNTRIES`

If the street format needs custom behavior, add a new branch inside `buildStreetLine()` in `js/generator.js`.

Example: Indonesia uses `Jl. {street} No. {number}`, Japan uses a block-style format, and Brazil uses `Rua {street}, {number}`.

---

## Design Notes

The app has a dedicated design-system guide in `SKILL.md`. If you're going to change the look and feel, read that first.

Quick rules:

- Use CSS variables from `css/styles.css` instead of hardcoded colors.
- Keep icons pixel-based and SVG-first.
- Use `currentColor` for chrome icons when possible.
- Keep the CRT / terminal feel consistent.
- Test both light and dark mode before shipping UI changes.
- Hard-refresh the browser after favicon changes because browsers cache favicons aggressively.

---

## Deploy

Since this is a static app, you can deploy it pretty much anywhere:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- S3 static hosting
- Any basic static web server

No build command needed. Just serve the project directory.

---

## License

MIT. Use it freely for testing, QA, demos, and educational projects.
