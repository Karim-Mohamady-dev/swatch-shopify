# SWATCH — Colour-Flood Puffer Store

An **original rebuild** from the frames of the SmartDuke Technologies Facebook reel
#8 “Shopify Sections” — Swatch for Shopify (studio.smartduke.com/templates/swatch-shopify,
reel: https://www.facebook.com/reel/1111211575074559).
No source code from the seller was used or copied — the layout, copy and all code
in this folder were written from scratch from what the reel shows.

## What the reel shows

A product page for a puffer jacket, “Tangerine Puffer $89.00” (was $110.00).
Picking a colour swatch **floods the whole page background with that colour**
(animated transition) and recolours the jacket. This rebuild recreates exactly
that interaction — plus the reel's other sections: turn it around, colour split,
built for the cold, and the whole range.

## Price correction (2026-11-27)

A second, frame-by-frame watch of the reel showed the first build's prices were
wrong ($59–$69). Corrected to the reel's figures: Tangerine $89.00 (was $110.00),
Berry $89.00 (was $110.00), Cobalt $94.00, Plum $89.00 (was $110.00),
Butter $89.00 (was $110.00). The compare-at price ($110.00) is shown struck
through wherever a “was” price exists. The five products are now exactly the
reel's five colours — the invented Cloud / Ember / Moss / Midnight products
were removed.

## Features

- **Colour flood** — 5 swatches (Tangerine #f97316, Berry #be185d, Cobalt #1d4ed8,
  Plum #7e22ce, Butter #facc15). Picking one floods the whole page background
  with a smooth ~700 ms transition, recolours the SVG puffer jacket live, and
  updates the product name. Text flips to white on dark floods and ink on light
  ones so it stays readable on every colour. “Pick a colour” · “It floods the
  stage” · “The colour drop”.
- **Giant colour name** — a huge colour name (e.g. TANGERINE) sits behind the
  product and changes with the selected colour.
- **Turn it around** — a control flips the jacket visual to show its back
  (mirrored SVG variant: yoke seam + label patch, no zipper or pockets).
- **Colour split** — “Can't decide? Drag the line. Pick a colour for each
  side.” Two swatch pickers (one per side) and a draggable divider comparing
  two jacket colours side by side; keyboard arrows on the handle also move it.
- **Built for the cold** — 01/04 Quilted shell; 02/04 Recycled down fill
  (“Warmth without the weight — recycled down traps air and holds its loft
  wash after wash.”); 03/04 Two-way zip (“Open it from the hem when you sit,
  or vent from the top.”); 04/04 Elastic cuffs (“Soft binding at the wrist
  seals the cold out without squeezing.”).
- **The whole range** — “Five colours, one list.” A list of all five jackets
  with prices (+ struck-through compare-at prices) and a “Shop all” link that
  scrolls to the product grid.
- **Product hero** — big hand-drawn SVG puffer jacket (CSS/SVG only, no photos),
  price + compare-at price, size selector (XS–XL; a size must be picked before
  adding), quantity stepper, live total on the Add to bag button.
- **More puffers** — the other 4 products. Clicking any card loads it as the
  hero product and the colour flood follows.
- **Reviews** — 3 demo reviews.
- **Bag drawer** — live count in the header, per-item quantities, remove,
  subtotal, validated demo checkout (name + email) returning a demo order
  number. No payment.
- **Bilingual EN/AR** — full RTL, saved language preference. Bag, selected
  colour/size and language persist in localStorage.
- **Footer newsletter** — email validation + demo note.
- No literal `{{...}}` placeholders anywhere in the UI; every button/control works.

## Stack

React + TypeScript + Vite + Tailwind CSS v4, Phosphor icons (`@phosphor-icons/react`).

## Run

```bash
npm run build    # tsc + vite build (verified: passes)
npm run preview  # serve the production build locally
npm run dev      # dev server
```

## Demo note

Demo store — original rebuild from the reel frames. All products and prices are
examples; checkout takes no payment and places no real order.
