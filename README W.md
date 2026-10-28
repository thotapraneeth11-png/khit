# AegisAI Cybersecurity Dashboard

A standalone frontend extraction of the supplied AegisAI HTML dashboard.

## Files

- `index.html` — main dashboard markup and entry point.
- `style.css` — responsive dark SOC theme, layout, cards, forms, tables, and animations.
- `script.js` — tab navigation, demo buttons, illustrative canvas charts, and sample UI interactions.
- `assets/logo.svg` — local shield logo asset.
- `.gitignore` — ignores local secrets, generated output, editor files, and temporary files.

## Run locally

1. Keep the files and `assets/` folder together.
2. Open `index.html` in a modern browser, or serve the folder using a local static server.
3. No build step is required for this frontend demo.

## Important limitations

The supplied HTML referenced external `style.css`, `app.js.download`, and `charts.js.download` files that were not included with the uploaded HTML. This package supplies replacement styling and browser-side demo interactions. Some original application behavior may therefore differ from the original saved website.

This is a **frontend demonstration only**. Dashboard telemetry and charts are illustrative; registration is not stored; role labels are not secure authentication; and lockdown, firewall, endpoint, patching, and attack-simulation controls do not operate real systems. Do not enter real credentials or sensitive data. For production, connect a backend API, enforce authentication and role-based authorization server-side, store secrets outside source control, and implement audited security controls.
