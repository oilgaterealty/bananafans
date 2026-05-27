# Custom Booking Websites — Local Preview

This folder contains a **standalone local preview** of a future Oilgate AI service tab/page called **Custom Booking Websites**.

It is a static HTML / CSS / JS draft used to review the design, copy, and live cost calculator before any of this is wired into the live oilgateai.com website.

---

## What this preview is

A premium, mobile-first service page that pitches custom booking websites for service businesses (barbers, hairstylists, nail techs, estheticians, spas, med spas, and other appointment-based local service pros).

Core positioning:

> Stop renting your booking app. Own a premium custom booking website powered by Stripe.

It includes:

- A hero with eyebrow, headline, subheadline, supporting paragraph, and two CTAs.
- A transparent pricing card (**Starts at $750**, typical starter range $750–$2,500).
- A live, fully interactive **Booking Cost Calculator** above the fold that compares the user's current platform (Booksy, Vagaro, Squire, or Other) vs. **Oilgate AI + Stripe**.
- A break-even point.
- A 5-year cost projection table with a **Total Saved After 5 Years** line.
- A "Why this exists" section, a Rented-vs-Owned comparison, target verticals, and a feature parity strip.
- A final CTA section.

---

## How to open / view it locally

The preview is just static files — no build step, no server required.

**Option A — Open directly in a browser**

1. In your file explorer, navigate to:

   ```
   local-previews/custom-booking-websites/
   ```

2. Double-click `index.html`, or right-click → *Open with* → your browser.

**Option B — Serve it locally (recommended for the calculator)**

Some browsers restrict module / font loading on `file://`. If anything looks off, serve the folder with any tiny static server:

```bash
# from the repo root, pick one:
npx serve local-previews/custom-booking-websites
# or
python -m http.server --directory local-previews/custom-booking-websites 5173
```

Then visit the URL printed in the terminal (e.g. http://localhost:5173).

---

## Is this wired into the live website?

**No.** This preview is fully isolated:

- It lives only inside `local-previews/custom-booking-websites/`.
- It does **not** modify the existing live homepage (`src/App.tsx`, `index.html`, etc.).
- It does **not** add itself to the live navigation or to any production route.
- It does **not** replace, remove, or alter any existing pages, components, or global styling.
- Its CSS is scoped to this folder and is not imported by the production app.
- Its JavaScript runs only when `index.html` inside this folder is opened.

It is a **future tab draft**. When the `Custom Booking Websites` tab is later added to OilgateAI.com, this preview is the source of truth for design and copy direction.

---

## About the calculator

The calculator is **interactive** and recalculates live as inputs change. It uses **editable planning assumptions** — these are not promises or guarantees of fees you will pay. Final pricing depends on your services, staff/calendars, deposit rules, intake forms, integrations, and workflow complexity.

Built-in defaults:

- **Booksy:** $29.99/mo software, **2.69% + $0.30** per transaction (default selected platform).
- **Vagaro:** $23.99/mo software, processing pre-filled but editable.
- **Squire:** $30.00/mo software (Independent), processing pre-filled but editable.
- **Other:** $100.00/mo software, 2.9% + $0.30 placeholder.
- **Oilgate AI + Stripe:** **$0/mo** platform fee, **2.9% + $0.30** Stripe processing, one-time website build defaulted to **$750**.
- Transaction count is estimated from annual card volume ÷ assumed average ticket ($50 default). Average ticket is **not** a main hero input — it lives in "Advanced edits".

All inputs are honest:

- If Year 1 with Oilgate AI is more expensive (because of the one-time build), the table shows that — it is not faked as a savings.
- The break-even month accounts for the one-time build cost, annual platform fee savings, and processing rate differences.
- The **Total Saved After 5 Years** number is the real 5-year delta, not an average.

---

## File map

```
local-previews/custom-booking-websites/
├── assets/
│   ├── oilgate-ai-drop-logo.png   # real Oilgate AI drop icon
│   └── oilgate-ai-full-logo.png   # real Oilgate AI full logo
├── index.html                     # standalone preview page
├── styles.css                     # scoped premium dark theme
├── script.js                      # calculator logic (pure client-side)
└── README.md                      # this file
```

Real Oilgate AI logos are used. Competitor names appear only as text labels (Booksy, Vagaro, Squire) — no fake competitor logos and no fake Oilgate AI logos are used anywhere in this preview.
