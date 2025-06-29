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

## Enhanced Template-Driven Game System (In Progress)

### Overview
The template system has evolved from basic configuration storage to a comprehensive game state management system that enables complete game continuity and rapid testing.

### Architecture Components

#### 1. Template Schema
```typescript
interface GameTemplate {
  // Basic metadata
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  
  // Complete game state
  gameState: {
    currentTurn: number;
    character: Character; // Full character state with current stats
    imageHistory: ImageHistoryEntry[]; // All images with descriptions/stories
    finalStory?: string;
  };
  
  // App configuration
  prompts: {
    imageDescription: string;
    storyGeneration: string;
    finalStory: string;
    characterInitialization: string;
  };
  config: {
    maxTurns: number;
    enableMarkdown: boolean;
    autoSave: boolean;
    theme: string;
    language: string;
  };
  
  // Template metadata
  metadata: {
    isTestTemplate: boolean;
    description?: string;
    tags?: string[];
    category?: string;
  };
}
```

#### 2. Template Store (Zustand)
- **Location:** `src/lib/stores/templateStore.ts`
- **Features:**
  - CRUD operations for templates
  - Template selection and management
  - State persistence (optional)
- **Actions:** `addTemplate`, `updateTemplate`, `deleteTemplate`, `selectTemplate`

#### 3. Template Application System
- **Function:** `applyTemplate(template: GameTemplate)`
- **Process:**
  1. Validate template version and data integrity
  2. Restore complete character state
  3. Load all image history with generated content
  4. Set current turn and game progress
  5. Update UI to reflect restored state
- **Smart Regeneration:** Only regenerate missing content

#### 4. Template Manager UI
- **Location:** `src/components/TemplateManager.tsx`
- **Features:**
  - Template creation, selection, deletion
  - Import/export with validation
  - Template application to game state
  - Visual indicators for template status

### Template Application Flow

```
1. User selects template file
   ↓
2. Validate template (version, data integrity)
   ↓
3. Apply game state:
   - Restore character (stats, experience, level)
   - Load image history (images, descriptions, stories)
   - Set current turn
   - Restore final story (if exists)
   ↓
4. Check content completeness:
   - Determine what content exists
   - Identify what needs generation
   ↓
5. Update UI:
   - Show current state
   - Indicate what actions are available
   ↓
6. Resume game from exact saved state
```

### Testing Integration

#### Test Templates
- **Purpose:** Pre-generated templates with realistic content
- **Benefits:** Instant UI testing without AI generation delays
- **Structure:** Complete game state with mock-generated content

#### Mock System Integration
- **Location:** `src/lib/config.ts`
- **Feature:** Use template data when available
- **Fallback:** Standard mock data when no template selected

#### Template-Based Testing
- **Scenarios:** Different templates for different test cases
- **Rapid Iteration:** No need to regenerate content during development
- **Realistic Data:** Test with actual game state structures

### Benefits

#### Gameplay Continuity
- **Resume Games:** Continue from exact saved state
- **Content Preservation:** All generated content is maintained
- **State Restoration:** Character progress, image history, turn number

#### Development Speed
- **Rapid Testing:** Instant UI testing with pre-generated content
- **Scenario Testing:** Different templates for different test cases
- **Content Reuse:** Share complete game sessions

#### Testing Efficiency
- **No AI Delays:** Test with pre-generated content
- **Realistic Data:** Use actual game state structures
- **Scenario Coverage:** Multiple templates for different scenarios

### Implementation Status

#### ✅ Completed (Phase 24.1)
- Enhanced template schema with complete game state
- Template validation and creation utilities
- Zustand template store with CRUD operations
- Template management UI (create, select, delete, import/export)

#### 🔄 In Progress (Phase 24.2)
- Template application system
- Complete game state restoration
- Character store integration

#### 📋 Planned
- Smart content regeneration (Phase 24.3)
- Testing integration (Phase 24.4)
- Advanced template features (Phase 24.5)

### Technical Decisions

#### Why Complete Game State?
- **User Experience:** Resume games exactly where left off
- **Testing Efficiency:** No need to regenerate content
- **Data Integrity:** Preserve all generated content

#### Why Template Application System?
- **State Management:** Centralized state restoration
- **Validation:** Ensure data integrity and compatibility
- **UI Integration:** Seamless user experience

#### Why Testing Integration?
- **Development Speed:** Eliminate AI generation delays
- **Scenario Coverage:** Multiple test scenarios
- **Realistic Testing:** Use actual game state structures

---
This document should be updated as the project evolves. Use it as a reference for onboarding, architecture decisions, and best practices. 