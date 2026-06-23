# Polished (Vue)

A Vue + Vite + TypeScript nail studio app for managing polish inventory, generating nail design ideas, and saving designs.

The current experience is intentionally close to the previous static version, but now runs as a routed SPA.

## Stack

- Vue 3
- Vite
- TypeScript
- Vue Router

Configured intentionally without:

- Pinia
- Testing setup
- JSX
- ESLint
- Prettier

## Current Feature Set

### Collection

- Add polish with:
	- Name
	- Brand
	- Color
	- Formula
	- Date Purchased
	- Image URL
- Auto-fill support from product URL lookup
- Duplicate warning by name + brand
- Favorite, log-use, remove-use, delete
- Inventory filters:
	- Search
	- Brand
	- Color family
	- Formula
	- Recently used
	- Favorites only
	- Sort by date/uses/favorites

### Generator

- Multi-select dropdown polish selector
- Selected-polish chips with swatches and remove `x`
- Auto-suggest from least-used shades
- Fresh idea generation on each click (non-repeating attempt)
- Save flow with inline confirmation and saved-state button

### Library

- Saved design cards with:
	- Generated design name
	- Swatch row
	- Tried/not tried badge
	- Description
	- Polishes list
	- Saved date
- Mark as tried/not tried
- Delete design
- Per-design image upload
	- Upload panel appears only after Add/Update Image button click
	- Remove image action
- Filters:
	- Tried status
	- Uses favorite polish

## Run

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Routes

- `/` - My Collection
- `/generator` - Nail Art Generator
- `/library` - Design Library

## Key Structure

- [src/App.vue](src/App.vue): shared hero shell + top navigation
- [src/router/index.ts](src/router/index.ts): route definitions
- [src/composables/useStudio.ts](src/composables/useStudio.ts): shared state/actions + localStorage persistence
- [src/views/CollectionView.vue](src/views/CollectionView.vue): inventory management
- [src/views/GeneratorView.vue](src/views/GeneratorView.vue): idea generation
- [src/views/LibraryView.vue](src/views/LibraryView.vue): saved designs gallery
- [src/assets/main.css](src/assets/main.css): app styling

## Persistence

- Data is saved in browser localStorage using key `nail-studio-state-v1`.

## Notes

- The app uses a shared composable store pattern (`useStudio`) instead of Pinia.
