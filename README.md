# Nail Studio Vault

A lightweight web app for managing nail polish inventory and generating nail art ideas from your collection.

## Quick Start

1. Open the project folder.
2. Open [index.html](index.html) in your browser.

No build step or dependencies are required.

## Implemented Features

### 1. Polish Inventory Management

- Add polish with:
	- Name
	- Brand
	- Color swatch
	- Finish
	- Date purchased
	- Optional tags
- Log use count per application.
- Favorite toggle per polish.
- Duplicate warning when the same name + brand is added.

### 2. Inventory Views

- Grid and list views.
- Sort options:
	- Date purchased
	- Most used
	- Favorites first
- Filters:
	- Search (name/brand)
	- Color family
	- Finish
	- Favorites only
	- Recently used (7 days, 30 days, never)

### 3. Nail Art Generator

- Manual polish selection (up to 3).
- Auto-suggest based on least-used and recently purchased polish.
- Rule-based design generation using:
	- Color relationship (monochrome, analog, complementary)
	- Finish mix (single texture, matte/gloss, glitter accent, mixed)
- Save generated idea to design library.

### 4. Design Library

- Saved designs gallery.
- Mark design as tried/not tried.
- Delete saved designs.
- Filter by:
	- Tried status
	- Includes favorite polish

### 5. UX and Accessibility

- Visual-first layout with color swatches.
- Quick actions for logging use and favoriting.
- Local persistence using browser localStorage.
- Labels and ARIA attributes for core controls.
- Color is not the only identifier; names and metadata are always shown.

## Nice-to-Haves Included

- Inventory age indicator based on purchase date.
- Duplicate detection warning.
- "Unused" summary metric in header stats.

## Tech

- HTML
- CSS
- Vanilla JavaScript (no framework)

## Files

- [index.html](index.html): App structure and UI sections
- [styles.css](styles.css): Design system and responsive styling
- [app.js](app.js): App state, filtering logic, generator, and persistence
