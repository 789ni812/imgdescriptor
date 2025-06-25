# Project Architecture Overview

## Platform & Framework
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **AI Integration:** LM Studio SDK

## Folder Structure
```
src/
├── app/                 # Next.js App Router (pages, layout, API routes)
├── components/          # React components (UI, layout, feature)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, constants, Zustand stores, types
│   ├── stores/          # Zustand state management
│   ├── types/           # TypeScript type definitions
│   └── ...
└── types/               # (Legacy or shared types)
public/                  # Static assets (images, icons)
jest.config.js           # Jest configuration
```

## State Management
- **Zustand** for all character/game state
  - Store: `src/lib/stores/characterStore.ts`
  - Uses `persist` middleware for localStorage persistence
  - All state updates are via store actions (no direct mutation)
  - **Image History:** Each image entry now stores its own AI-generated description and story, enabling robust per-turn display and replay.
- **Turn System:**
  - 3-turn limit, managed in Zustand
  - Reset Game button resets all state

## Testing Process
- **Framework:** Jest + React Testing Library
- **Workflow:** Strict TDD (Test-Driven Development)
  - Write failing test → implement code → make test pass → refactor
  - All features require tests before implementation
- **Test Coverage:**
  - UI, state, and game logic are all covered
  - Reset Game and turn logic are explicitly tested
- **Run tests:** `npm test` or `npm run test:watch`
- **Build check:** `npm run build` (must pass before commit)

## UI/UX
- **Layout:**
  - Responsive, stacked card layout (no grid)
  - Each image/turn is displayed as a vertical `GalleryCard` with:
    - The image at the top
    - An accordion below with two sections: "Image Description" (collapsed by default) and "Image Story" (expanded by default)
    - A "Turn X" label for each card, newest at the top
  - Header displays character stats
  - Main area: image upload, preview, description, story, and controls
- **Reset Game:**
  - Button appears if any turns have been used
  - Resets all state and clears persisted storage
- **Prompts:**
  - Dual prompt system (default/custom) for both image description and story generation

## Conventions & Best Practices
- **TypeScript:**
  - All code is strictly typed
  - No use of `any` except in legacy/test code
- **Component Structure:**
  - Components are colocated with their tests
  - Use functional components and hooks
- **State:**
  - All state is managed via Zustand store actions
  - No direct mutation of state outside the store
- **Testing:**
  - All new features require tests
  - Tests must pass before code is considered complete
- **Commits:**
  - Conventional commit messages (feat, fix, chore, etc.)
  - Commit after passing tests and build

## Decision Rationale
- **Next.js App Router:** Modern, flexible routing and layouts
- **Zustand:** Simple, scalable state management with persistence
- **shadcn/ui:** Modern, accessible UI components
- **TDD:** Ensures reliability and maintainability
- **Stacked Card Layout:** More flexible and visually appealing than a grid for this use case; supports per-turn replay and accordion-based detail viewing.

---
This document should be updated as the project evolves. Use it as a reference for onboarding, architecture decisions, and best practices. 