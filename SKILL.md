---
name: billing-generating-design-system
description: Use when extending, restyling, or adding features to the billing-generating app (Macintosh System 7 chrome over a CRT-terminal palette). Covers theme tokens, typography, pixel icon conventions, window chrome, boot splash, and the rules for keeping new UI consistent with the existing dual-mode (paper-terminal light / phosphor-green dark) design.
version: 1.0.0
author: exd77
license: MIT
metadata:
  hermes:
    tags: [design-system, css, retro-ui, macintosh, crt, terminal, vanilla-js]
    related_skills: [frontend-design, sketch]
---

# Billing Generator — Design System

## Overview

`billing-generating` is a **vanilla HTML/CSS/JS** static site that overlays Macintosh System 7 / Mac OS Classic chrome (striped title bars, beveled buttons, sunken inputs, stippled desktop, beach-ball spinner, draggable windows, top menu bar) on top of a CRT-terminal palette. There are two themes:

- **Light** = "paper-terminal" — dark sepia ink on cream paper, amber CRT phosphor accent.
- **Dark** = phosphor green on deep green-black, brighter green accent and heavier scanlines.

Both modes share the same chrome, fonts, and pixel-icon language. Themes switch via `[data-theme]` on `<html>`, with a localStorage preference (`billing-gen-theme` = `auto|light|dark`) bootstrapped inline in `<head>` to avoid flash-of-wrong-theme.

The app is **zero-dependency** beyond Google Fonts (VT323, Press Start 2P) and runs as static files.

## When to Use

Load this skill when you are about to:

- Add a new field, button, dialog, or window to the app.
- Add a new country / generator pattern.
- Change colors, fonts, icons, animations, or chrome.
- Add or replace a pixel icon (favicon, menu logo, banner icon, dialog icon).
- Touch the boot splash, scanlines, or CRT effects.
- Edit `index.html`, `css/styles.css`, or any file under `js/`.

Don't load for: pure README/docs typo fixes, dependency bumps in unrelated bot repos, generic Mac UI questions unrelated to this codebase.

## File Layout

```
billing-generating/
├── index.html          # Single entry. Inline theme bootstrap + favicon SVG live in <head>.
├── css/
│   └── styles.css      # Single stylesheet, sectioned 0–14 with banner comments.
├── js/
│   ├── data.js         # Country datasets (FIRST_NAMES, LAST_NAMES, STREET_NAMES, …)
│   ├── generator.js    # Pure logic: Generator.generate(countryCode) -> object
│   └── app.js          # UI wiring: boot, menus, dialogs, drag, clock, shortcuts
└── README.md
```

`styles.css` section map (search `^ \* \d+\. ` to jump):

| §  | Contents |
|----|----------|
| 0  | Theme tokens — light (default) and dark |
| 1  | Reset & base |
| 2  | Custom pixel cursor (classic Mac arrow) |
| 3  | Boot splash (`INITIALIZING TERMINAL…`) |
| 4  | Top menu bar + dropdowns |
| 5  | Desktop & windows |
| 6  | Title bar (striped + close/zoom box) |
| 7  | Window body, form rows, inputs, buttons |
| 8  | Trash icon |
| 9  | Modal dialogs (About, Alert) |
| 10 | Beach ball spinner |
| 11 | Drag outline |
| 12 | Animations & keyframes |
| 13 | Responsive |
| 14 | Terminal / CRT effects |

When adding new rules, slot them under the matching section, not at the end of the file.

## Theme Tokens (source of truth)

All colors, shadows, fonts, and CRT knobs live in CSS custom properties on `:root` (light) and `[data-theme="dark"]`. **Never hardcode colors** — always reference a token so theme switching keeps working.

### Fonts

| Token            | Stack                                                      | Use for                              |
|------------------|------------------------------------------------------------|--------------------------------------|
| `--font-mono`    | `VT323, IBM Plex Mono, Source Code Pro, Menlo, …`          | Boot log, input values, code-ish text |
| `--font-display` | `Press Start 2P, VT323, Courier New`                       | Boot message, banner ASCII headings  |
| `--font-ui`      | `VT323, Geneva, Chicago, Lucida Grande`                    | Menus, labels, buttons (default)     |

`body` defaults to `--font-ui` at `16px`/`1.4`. Don't add new font families without updating tokens.

### Light mode (paper-terminal / amber)

| Token             | Hex / value             | Role                              |
|-------------------|-------------------------|-----------------------------------|
| `--ink`           | `#1a1208`               | Foreground text & strokes         |
| `--paper`         | `#f3ecd6`               | Window/menu background            |
| `--paper-2`       | `#e8dcb0`               | Hover surface                     |
| `--paper-3`       | `#d4c08a`               | Pressed surface                   |
| `--mid`           | `#c8b574`               | Stippled desktop base             |
| `--mid-light`     | `#b8a560`               | Bevel-light / dither dots         |
| `--mid-dark`      | `#6b5530`               | Bevel-dark / button active        |
| `--text-dim`      | `#5a4525`               | Boot log secondary text           |
| `--accent`        | `#d05010` (amber-rust)  | Accent / phosphor glow base       |
| `--accent-2`      | `#ff7a30`               | Accent highlight                  |
| `--accent-glow`   | `rgba(208,80,16,0.45)`  | Drop-shadow / text-shadow         |
| `--accent-glow-2` | `rgba(208,80,16,0.20)`  | Subtle outer glow                 |
| `--error`         | `#a82800`               | Error/warn text                   |
| `--scan-opacity`  | `0.06`                  | CRT scanline strength             |

### Dark mode (phosphor green CRT)

| Token             | Hex / value             | Notes                                    |
|-------------------|-------------------------|------------------------------------------|
| `--ink`           | `#5cff7c`               | Phosphor green — also the favicon fill   |
| `--paper`         | `#021a08`               | Deep green-black                         |
| `--paper-2`       | `#052a10`               | Hover                                    |
| `--paper-3`       | `#0a3a18`               | Pressed                                  |
| `--mid`           | `#051508`               | Desktop near-black                       |
| `--mid-light`     | `#1a3a22`               |                                          |
| `--mid-dark`      | `#2a5a32`               |                                          |
| `--text-dim`      | `#7acc8a`               |                                          |
| `--accent`        | `#88ffaa`               | Brighter phosphor                        |
| `--accent-2`      | `#aaffcc`               |                                          |
| `--accent-glow`   | `rgba(92,255,124,0.55)` |                                          |
| `--accent-glow-2` | `rgba(92,255,124,0.25)` |                                          |
| `--error`         | `#ff5577`               |                                          |
| `--scan-opacity`  | `0.14`                  | Heavier scanlines on dark                |

### Glitch / RGB-split

`--glitch-r: #ff003c`, `--glitch-g: #00fff0`, `--glitch-b: #ffea00`. Used by the banner ASCII chromatic-aberration effect — leave alone unless you're explicitly tuning the glitch.

### SVG dual-mode helpers

- `--svg-invert`: `0` light / `1` dark. Apply via `filter: invert(var(--svg-invert))` to **hardcoded black/white** SVGs (trash can, dialog icons, bomb). They will flip to white-on-dark in dark mode.
- `--cursor-arrow`: themed pixel arrow cursor (black in light, phosphor green in dark). Don't replace — extend tokens if you need a new cursor variant.

## Iconography Rules

The app ships **two species of inline SVG**:

1. **Pixel B/W icons** (trash can, dialog icons): `fill="#000"` and `fill="#fff"` hardcoded. Always paired with `filter: invert(var(--svg-invert))` so dark mode flips them automatically. Never give these `currentColor`.

2. **Pixel CRT prompt icons** (favicon, brand logo, banner icon, boot splash): the canonical mark — a 14×14 CRT monitor with `>` prompt and blinking `_` cursor. **Use `fill="currentColor"`** so they inherit text color (and invert cleanly when the menu opens). The cursor rectangle gets a class (`brand-logo-cursor`, `banner-icon-cursor`, `boot-crt-cursor`) wired to the `blinkCaret` keyframe.

The favicon is the one **exception**: it lives in a `data:image/svg+xml,…` URL, so `currentColor` does not resolve. **Hardcode `fill='%235cff7c'`** (URL-encoded `#5cff7c` = `--ink` dark phosphor) so the tab icon reads as a green CRT regardless of theme. If the user ever wants a separate light-mode favicon, add a second `<link rel="icon" media="(prefers-color-scheme: light)">`.

### Adding a new pixel icon

- Use a square viewBox with integer coords, `shape-rendering="crispEdges"`, and `<rect>` primitives only.
- For chrome icons (sit on menu / window backgrounds): `currentColor`.
- For modal/dialog illustrations: hardcoded `#000` + the `--svg-invert` trick.
- Do **not** introduce raster PNG icons unless the asset truly cannot be expressed as pixel rectangles.

## Window Chrome Conventions

- Every window is a `<section class="mac-window">` with a `<header class="title-bar">` containing `close-box` + striped fill + centered `title-bar-text` + `zoom-box`.
- Inactive windows get `title-bar-inactive` (no stripes).
- Body content goes in `<div class="window-body">`. Note-style aside windows add `window-body-note`.
- Resize grip lives in `<footer class="resize-bar">` — present but currently decorative.
- Dragging is wired in `app.js` via `data-draggable="<window-id>"` on the title bar.
- New windows must include the boot-aware fade: `mac-window-anim` class + initial `landingFadeIn` honoring `body:not(.is-booting)`.

## Form Field Pattern

Every editable address field follows a 3-cell row:

```html
<div class="form-row">
  <label class="field-label" for="city">City:</label>
  <input type="text" id="city" class="mac-input" readonly />
  <button type="button" class="copy-btn" data-copy="city" aria-label="Copy city">⧉</button>
</div>
```

Rules:

- `mac-input` is **always** `readonly` — values come from `Generator.generate()`, never user input.
- Copy buttons use `data-copy="<id>"`; `app.js` finds the matching input automatically.
- Postal/short inputs add `mac-input-short`.
- Keep the `aria-label` on the copy button so screen readers don't see "⧉" alone.

## Adding a New Country

This is the most common extension. Edit `js/data.js` and add to **all five** registries — anything missing crashes `Generator.generate()`:

1. `FIRST_NAMES[CODE]` — array of common first names.
2. `LAST_NAMES[CODE]` — array of common surnames.
3. `STREET_NAMES[CODE]` and `STREET_TYPES[CODE]` — name pool + suffix/prefix pool.
4. `REGIONS[CODE]` — `[ [regionName, regionCode, [city, …]], … ]`.
5. `SECONDARY_LINES[CODE]` — array for optional Address Line 2 (apartment / unit forms).
6. `COUNTRIES[CODE]` — `{ name, flag, phoneCode, phonePattern, postalPattern }`.
   - `phonePattern` / `postalPattern` use `#` for digits and `@` for uppercase letters. See `Generator.fillPattern()`.

If the country needs an unusual street layout (e.g. JP `chome-banchi-go`, ID `Jl. {name} No. {n}`, BR `Rua {name}, {n}`), add a `case "CODE":` branch in `js/generator.js` → `buildStreetLine()`. Default branch is `{number} {street} {type}`.

After adding: hard-refresh, pick the new country in the dropdown, click Generate, and verify all 8 fields populate cleanly.

## Boot Splash & CRT Effects

The boot splash (`#bootSplash`) is a separate "first page" that fully covers the landing on load. It plays:

1. CRT logo bobbing + glow (`bootBob` + drop-shadow stack).
2. Animated boot-log lines (`bootLineIn`, populated line-by-line in `app.js`).
3. Hatched progress bar (`bootProgress` keyframe).
4. CRT turn-off transition on dismiss (`crtTurnOff` — collapse to a horizontal line, then a dot).

Body has `is-booting` while the splash is up. `body.is-booting .banner-ascii / .ascii-noise / .scan-bar { visibility: hidden }` keeps landing animations from desyncing. **Don't add new landing animations that ignore `is-booting`** — gate them the same way.

CRT scanlines come from `var(--scan-opacity)` and the `.crt-overlay` / `.scan-bar` rules in §14. Tweak via tokens, not by overwriting opacity in component rules.

## Common Pitfalls

1. **Hardcoded colors break dark mode.** If you write `color: #1a1208` instead of `color: var(--ink)`, dark mode will look broken. Always use a token.

2. **`currentColor` in a `data:` favicon URL doesn't work.** Browsers don't resolve CSS variables or `currentColor` inside `data:image/svg+xml`. Hardcode the fill (we use `%235cff7c` = `#5cff7c` phosphor green) and URL-encode the `#` as `%23`.

3. **Forgetting one of the five country registries crashes `Generator.generate()`.** Add to `FIRST_NAMES`, `LAST_NAMES`, `STREET_NAMES`+`STREET_TYPES`, `REGIONS`, `SECONDARY_LINES`, and `COUNTRIES` — all of them.

4. **New SVGs that ignore the dual-mode pattern.** Pixel B/W illustrations need `filter: invert(var(--svg-invert))`. Chrome marks need `fill="currentColor"`. Mixing them up gives invisible icons in one mode.

5. **Clipboard API silently fails over `file://`.** The browser only exposes `navigator.clipboard.writeText` on `https://` or `localhost`. For local testing, run `python3 -m http.server 8080` instead of double-clicking `index.html`.

6. **Adding components outside the section structure.** New CSS goes under the matching numbered section in `styles.css`, not appended at the bottom. Same for `app.js` — extend an existing wiring block (boot, menus, dialogs, drag, clock, shortcuts) rather than creating a new free-floating IIFE.

7. **Title / favicon caching.** Browsers cache favicons aggressively. After changing the favicon SVG or `<title>`, hard-refresh (`Ctrl+Shift+R`) and ideally close+reopen the tab. The new icon may still take a beat to appear.

8. **New keyboard shortcuts colliding with the OS.** The app already binds `⌘/Ctrl+G` (Generate), `⌘/Ctrl+Shift+C` (Copy All), `⌘/Ctrl+N` (New Address), and `Esc` (close dialogs). Don't add shortcuts that collide with browser/OS defaults you can't intercept (`⌘W`, `⌘T`, `⌘R`).

9. **Forgetting `aria-label` / `role` on icon-only controls.** `close-box`, `zoom-box`, `copy-btn`, and trash-icon already have them — match the pattern for any new icon button.

10. **Animations without `prefers-reduced-motion`.** Heavy CRT/glitch effects should be opt-in. If you add a new always-on animation, gate it with a `@media (prefers-reduced-motion: reduce)` override that disables or shortens it.

## Verification Checklist

Before considering a UI change done:

- [ ] Toggle light ⇄ dark via the menu-bar sun/moon button — both modes render correctly.
- [ ] Reload with `prefers-color-scheme: dark` set in DevTools to verify auto-mode bootstrap.
- [ ] No hardcoded hex colors introduced (search the diff for `#[0-9a-f]{3,6}` outside of `:root` / `[data-theme]` / SVG fills).
- [ ] New SVG icons follow either the `currentColor` (chrome) or the invert-filter (pixel illustration) convention.
- [ ] Favicon, brand logo, banner icon, boot CRT all share the same 14×14 prompt-icon design.
- [ ] If a country was added: every dropdown option works end-to-end (Generate populates all 8 fields, Copy All formats cleanly).
- [ ] Boot splash still plays and dismisses without leaving `is-booting` on `<body>`.
- [ ] Hard-refresh (`Ctrl+Shift+R`) confirms favicon + `<title>` reflect the latest change.
- [ ] Run `python3 -m http.server 8080` and open `http://localhost:8080` to verify clipboard buttons (they fail over `file://`).

## One-Shot Recipes

### Add a new menu action

1. In `index.html`, add a `<div class="menu-option" data-action="<id>">…</div>` to the right `menu-dropdown`.
2. In `app.js`, in the menu-action switch, add a `case "<id>":` that calls your handler.
3. If it should appear in `File`, also add a keyboard shortcut block in the shortcuts handler.

### Replace the favicon with a new variant

1. Inline-encode the SVG: replace each `#` in colors with `%23`, each space with `%20`.
2. Drop into the `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,…">` in `index.html`.
3. Hard-refresh + close-and-reopen the tab.

### Add a new pixel CRT-style icon (matching the brand language)

Copy the 14-rect `<g fill="currentColor">…</g>` block from the `.brand-logo` SVG in `index.html`, tweak rectangles, give the cursor `<rect>` a class wired to `blinkCaret`. Place inside any element whose `color` you want it to inherit.

### Tweak CRT intensity per-mode

Change `--scan-opacity` (light: `0.06`, dark: `0.14`) and the `--accent-glow*` rgba alphas in §0. Don't rewrite the `box-shadow` / `text-shadow` stacks per-component.
