# Project Architecture Overview

## Platform & Framework
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (using `@import "tailwindcss"` syntax)
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

## Template System Architecture

### Overview
The template system provides complete game state persistence and restoration capabilities, enabling exact game resumption and rapid testing scenarios.

### Core Components

#### 1. Template Schema (`src/lib/types/template.ts`)
- **GameTemplate Interface**: Complete game state storage including character, images, prompts, and configuration
- **Validation Functions**: Strict type checking and data integrity validation
- **Template Utilities**: Creation, cloning, version compatibility checking
- **Application System**: Core logic for applying templates and restoring game state

#### 2. Template Store (`src/lib/stores/templateStore.ts`)
- **Zustand Store**: CRUD operations for template management
- **Template Selection**: Active template tracking and selection
- **Persistence**: Local storage integration for template persistence

#### 3. Template Manager UI (`src/components/TemplateManager.tsx`)
- **Template Management**: Create, select, delete, import/export templates
- **Template Application**: Apply templates with visual feedback
- **Missing Content Detection**: Display what content needs to be generated
- **Result Display**: Success/error states with detailed feedback

### Template Application Flow

#### 1. Template Validation
```typescript
const result = applyTemplate(template);
// Validates template structure, version compatibility, and data integrity
```

#### 2. Game State Restoration
```typescript
// Restore character state
characterStore.updateCharacter({
  ...template.character,
  currentTurn: calculatedTurn
});

// Restore image history
characterStore.updateCharacter({ imageHistory: [] });
template.images.forEach(image => characterStore.addImageToHistory(image));

// Restore final story if exists
if (template.finalStory) {
  characterStore.updateCharacter({ finalStory: template.finalStory });
}
```

#### 3. Missing Content Detection
- **Complete Templates**: No missing content (has final story)
- **Incomplete Templates**: Detect missing images and final story
- **Visual Feedback**: Display missing content list to user

### Integration Points

#### Character Store Integration
- **ExtendedCharacter Interface**: Added `finalStory` property for template integration
- **State Restoration**: Complete character state restoration from templates
- **Image History Management**: Bulk loading of template images

#### UI Integration
- **TemplateManager Component**: Full template management interface
- **Apply Button**: One-click template application
- **Result Display**: Visual feedback on application success/failure
- **Missing Content Warnings**: Clear indication of what needs generation

### Benefits

#### 1. Gameplay Continuity
- **Exact Resumption**: Resume games from exact saved state
- **Complete State**: Character stats, image history, turn progress preserved
- **No Data Loss**: All generated content maintained in templates

#### 2. Development Speed
- **Rapid Testing**: Use pre-generated templates for instant UI testing
- **Consistent Data**: Reliable test scenarios with known content
- **Template Reuse**: Share complete game sessions between developers

#### 3. User Experience
- **Visual Feedback**: Clear indication of template application status
- **Missing Content Awareness**: Users know what content needs generation
- **Error Handling**: Robust validation and error reporting

### Implementation Status

#### ✅ Phase 24.1: Enhanced Schema (COMPLETED)
- Complete GameTemplate schema with full game state
- Comprehensive validation and utility functions
- Template store with CRUD operations
- Basic template management UI

#### ✅ Phase 24.2: Template Application System (COMPLETED)
- `applyTemplate()` function with validation
- Character store integration for state restoration
- Missing content detection and reporting
- Enhanced TemplateManager UI with apply functionality
- Comprehensive test coverage

#### 🔄 Phase 24.3: Smart Content Regeneration (PENDING)
- Automatic detection of missing content
- AI-powered content generation for incomplete templates
- Integration with existing image analysis and story generation

#### 🔄 Phase 24.4: Testing Integration (PENDING)
- Template-based test data generation
- Integration with Jest testing environment
- Automated template application in test suites

#### 🔄 Phase 24.5: Advanced Features (PENDING)
- Template categories and search
- Template sharing and collaboration
- Advanced editing and management features

---
This document should be updated as the project evolves. Use it as a reference for onboarding, architecture decisions, and best practices.

## Image Storage and Template Portability

### Best Practices
- All images referenced in templates should be stored in `public/imageRepository/` and referenced as `/imageRepository/filename.jpg`.
- On local development, copy uploaded/generated images to this folder.
- On template export, ensure all referenced images are present and optionally export as a zip with images + template JSON for portability.
- On Vercel (production), the `public/` folder is read-only; all images must be present at build time and committed to the repo.
- No uploads or LLM generation in production unless using a cloud storage backend.
- In the future, for uploads in production, use a cloud storage solution (e.g., S3, Supabase Storage) and update template image URLs accordingly.

### Environment Handling Table
| Environment      | Image Storage Location         | Uploads Allowed? | LLM Generation? | Template Usage         |
|------------------|-------------------------------|------------------|-----------------|-----------------------|
| Local (Windows)  | public/imageRepository/       | Yes              | Yes             | Generate & Export     |
| Vercel (Prod)    | public/imageRepository/       | No               | No              | Import & Use Only     |

### Notes
- This section is a reference for future-proofing and deployment strategy.
- When deploying to Vercel, ensure all images referenced in templates are present in `public/imageRepository/` and committed to the repo.
- For future cloud storage, update image management and template export/import logic accordingly.

## Turn Limit Editing (2025-07-01)
- The template system allows users to increase the turn limit at any time.
- Users can decrease the turn limit only if the current turn is less than or equal to the new limit.
- All turn-based logic (story generation, upload disabling, final story button, etc.) uses the dynamic turn limit from the template config.
- Validation prevents decreasing the turn limit below the current turn, with clear user feedback.

## Toast Notification System (2025-07-01)
- A global toast notification system is used for all key template and game interactions:
  - Export, import, save, delete, select, apply, and edit templates
  - Any other important user action (success or error)
- Toasts are small, subtle, and non-intrusive, appearing in a consistent location (e.g., bottom-right or top-right).
- Toasts disappear automatically after a short duration and are accessible to screen readers.
- All toast logic is centralized for maintainability and consistency.
- All relevant tests verify toast appearance and content for user actions.

--- 