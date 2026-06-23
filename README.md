# Polished (Vue)

A Vue + Vite + TypeScript nail studio app for managing polish inventory, generating nail design ideas, and saving designs.

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
