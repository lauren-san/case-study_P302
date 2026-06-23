# Nail Art Website — Brief

## Current Build Status (June 2026)

This brief now reflects the shipped implementation in this repository.

- Framework: Vue 3 + Vite + TypeScript + Vue Router
- Routing:
  - `/` = My Collection
  - `/generator` = Nail Art Generator
  - `/library` = Design Library
- State and persistence:
  - Shared composable state in `src/composables/useStudio.ts`
  - `localStorage` key: `nail-studio-state-v1`
- Tooling choices:
  - Pinia: not used
  - Testing scaffolds: not included
  - JSX: not used
  - ESLint: not included
  - Prettier: not included

## Summary
A nail art inspiration and tracking website designed for polish lovers. Users can manage their personal polish inventory, track usage over time, and generate nail art ideas based on the polishes they own.

The goal is to make it easy and fun to:
- Keep track of your collection
- Use what you already have
- Discover new nail design ideas tailored to your inventory

---

## Core Features / Design

### 1. Polish Inventory Management
- Add new polishes with:
  - Name
  - Brand
  - Color (with visual swatch)
  - Finish (matte, glitter, chrome, etc.)
  - Date purchased
  - Image URL
- Track usage:
  - Increment “uses” count per application
- Favorite polishes:
  - Star/favorite toggle
- Duplicate warning for same name + brand

### 2. Inventory Views
- Grid view (visual-first, swatches)
- List view (sortable by:
  - Date purchased
  - Most used
  - Favorites)
- Filters:
  - Search (name + brand)
  - Brand
  - Color family
  - Finish
  - Favorites
  - Recently used

### 3. Nail Art Generator
- Select polishes (manual or auto-suggest)
  - Manual selector is a multi-select dropdown
  - Selected chips with swatches and remove `x`
- Generate design ideas based on:
  - Color combinations (complementary, monochrome, etc.)
  - Finish mix (matte + gloss, glitter accents)
- Output:
  - Design title
  - Design description
  - Palette swatches
- Ability to:
  - Save designs
  - Show inline “saved” confirmation next to button

### 4. Design Library
- Saved designs gallery
- Filter by:
  - Tried vs. not tried
  - Includes favorite polish
- Each saved design card includes:
  - Generated design name
  - Palette swatches
  - Tried/not tried badge
  - Optional uploaded design image
    - Upload controls appear only after pressing Add/Update Image button

### 5. UX Principles
- Visual-first (color swatches are key)
- Lightweight + fast (quick add, quick log use)
- Encourages reuse (highlight “unused” or “low-use” polishes)
- Accessible:
  - Clear labels
  - High contrast
  - Color not the only identifier (names + labels included)

---

## Nice-to-Haves

### Inventory Enhancements
- Expiration or “age” indicator (based on purchase date)
- Cost tracking + total collection value
- Duplicate detection (same polish added twice)

### Smart Suggestions
- “Use these today” suggestions:
  - Least-used polishes
  - Recently purchased
- Seasonal design suggestions

### Social / Sharing
- Share designs (image or link)
- Community inspiration feed
- Import/export collection

### Visual Features
- Realistic polish swatch rendering
- Nail preview templates (short, long, almond, etc.)
- Drag-and-drop to build designs manually

### Reminders & Insights
- “You haven’t used this in X days”
- Most-used vs least-used analytics
- Favorite color trends

---

## Future Opportunities
- Mobile app
- AI-generated nail art previews
- Integration with shopping (wishlist or restock alerts)