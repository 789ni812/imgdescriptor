# Project Specification: AI Image Describer RPG Game (from 2025-06-23)

## TDD Workflow (for each task)
1. **Write/Update the Test** (make it fail if needed)
2. **Implement the Code** (make the test pass)
3. **Run All Relevant Tests** (ensure everything passes)
4. **Run `npm run build`** (ensure the build is successful)
5. **Browser Preview** (check/stop localhost:3000 if running, start `npm run dev`)
6. **Update `spec.md`** (mark the task as complete)
7. **Commit All Changes** (code, tests, and spec.md) with a clear, conventional commit message

## Archive
- All previous phases and project history are now in `spec-2025-06-23.md`.

## New Phases (2025-06-23 and onward)

### Phase 17: Character Scoring System & State Management
**Objective:** Implement a comprehensive RPG character scoring system using Zustand for state management.

#### Tasks
- [x] **17.1: Install and Configure Zustand**
  - Zustand installed and configured
  - Store created in `src/lib/stores/characterStore.ts` with default values and types
  - Test created and passing
  - Build and browser preview successful
  - **Commit:** `feat(state): add Zustand for character state management`

- [x] **17.2: Define Character Schema and Types**
  - Comprehensive character types, creation, and validation implemented in `src/lib/types/character.ts`
  - Tests for type validation and character creation all passing
  - Build and browser preview successful
  - **Commit:** `feat(types): define comprehensive character schema and validation`

- [x] **17.3: Implement Character Store Actions**
  - Create actions for: updateStat, updateStats, addExperience, updateCharacterName
  - Add computed selectors for derived character stats (getTotalStats, getAverageStats)
  - Write tests for all store actions and selectors
  - **Commit:** `feat(store): implement character store actions and selectors`

- [ ] **17.4: Character Initialization System**
  - Create character initialization based on first image description
  - Implement character generation from AI analysis
  - Write tests for character initialization logic
  - **Commit:** `feat(character): implement character initialization system`

### Phase 18: Markdown Formatting
**Objective:** Add markdown rendering to descriptions and stories for better formatting and readability.

#### Tasks
- [x] **18.1: Install Markdown Renderer**
  - Install react-markdown: `npm install react-markdown`
  - Create markdown rendering component in `src/components/ui/MarkdownRenderer.tsx`
  - Write tests for markdown rendering functionality
  - **Commit:** `feat(ui): add markdown rendering component`

- [x] **18.2: Update Image Description Display**
  - Modify `DescriptionDisplay` to render markdown content
  - Update tests to verify markdown rendering
  - **Commit:** `feat(description): add markdown formatting to image descriptions`

- [x] **18.3: Update Story Display**
  - Modify `StoryDisplay` to render markdown content
  - Update tests to verify markdown rendering
  - **Commit:** `feat(story): add markdown formatting to generated stories`

- [x] **18.4: Update AI Prompts for Markdown**
  - Modify default prompts to request markdown formatting
  - Update constants to include markdown formatting instructions
  - Write tests for markdown-formatted responses
  - **Commit:** `feat(prompts): update AI prompts to generate markdown content`

- [x] **18.5: Fix MarkdownRenderer Tests (ESM/Jest Issue Resolution)**
  - Resolved ESM/Jest compatibility issues with react-markdown
  - Implemented custom mock for react-markdown to simulate HTML output
  - Re-enabled all previously skipped markdown rendering tests (10 tests)
  - All tests now pass with proper markdown element validation
  - **Completed 2025-06-24**
  - **Commit:** `fix(tests): resolve MarkdownRenderer ESM/Jest issues with custom mock`

### Phase 19: Header Scoring Display
**Objective:** Show key character scoring numbers in the header.

#### Tasks
- [ ] **19.1: Create Header Scoring Component**
  - Create `src/components/layout/CharacterStats.tsx` for header display
  - Display key stats: Health, Heartrate, Age, etc.
  - Write tests for character stats display
  - **Commit:** `feat(header): add character stats display component`

- [x] **19.2: Integrate Character Stats in Header**
  - Update `Header` component to include character stats
  - Connect to Zustand store for real-time updates
  - Write tests for header integration
  - **Commit:** `feat(header): integrate character stats in header`

- [x] **19.3: Style Header Stats**
  - Apply small font styling and proper layout
  - Ensure responsive design for different screen sizes
  - Write tests for styling and responsiveness
  - **Commit:** `style(header): style character stats display`

> **2025-06-24:**
> - Fixed a bug where character stats were shown twice (in both header and main content).
> - Now, `CharacterStats` is only rendered in the header, with proper responsive design (desktop: in header bar, mobile: below bar).
> - Improved header layout and visual separation from main content.

### Phase 20: Turn-Based Game System
**Objective:** Implement a 3-turn system for continuing the story with new images.

#### Tasks
- [x] **20.1: Implement Turn Management**
  - Turn state management (`currentTurn`, `incrementTurn`, reset) implemented in character store
  - Turn counter and validation logic (max 3 turns, UI disables upload and shows message)
  - Tests for turn management system in `characterStore.test.ts`
  - **Completed 2025-06-24**
  - **Commit:** `feat(game): implement turn-based game system`

- [x] **20.2: Create Turn Display Component**
  - Turn display is implemented in `CharacterStats` (header) and shows current turn in the UI
  - Also shown as `Turn {character.currentTurn}/3` in the header for clarity
  - **Completed 2025-06-24**
  - **Commit:** `feat(ui): add turn counter component`

- [x] **20.3: Update Story Generation for Turns**
  - Story generation prompt now includes turn number, character stats, and previous story context
  - Refactored prompt construction into a pure function for TDD
  - Fully tested with unit and integration tests
  - **Completed 2025-06-24**
  - **Commit:** `feat(story): update story generation for turn-based gameplay`

- [x] **20.3.1: Add 3-Turn Mock Data for Story Evolution**
  - Create 3 sets of mocked image descriptions (one for each turn)
  - Create 3 sets of mocked story generations that build upon each other
  - Update mock system to return different data based on current turn
  - Write tests for turn-based mock data selection
  - **Completed 2025-06-24**
  - **Commit:** `feat(mocks): add 3-turn mock data for story evolution testing`

- [x] **20.4: Implement Turn Validation**
  - Image upload is disabled after 3 turns (turn limit enforced in UI)
  - User sees a clear message when turns are exhausted
  - Tests in page.test.tsx verify upload is disabled and message is shown
  - **Completed 2025-06-24**
  - **Commit:** `feat(game): implement turn validation and game end logic`

### Phase 21: Image Gallery and Story Continuation
**Objective:** Display all uploaded images and enable story continuation.

#### Tasks
- [x] **21.1: Create Image Gallery Component**
  - Create `src/components/ImageGallery.tsx` to display all uploaded images
  - Implement grid layout for multiple images
  - Write tests for image gallery functionality
  - **Completed 2025-06-24**
  - **Commit:** `feat(ui): add image gallery component`

- [ ] **21.2: Integrate Image Gallery in Layout**
  - Add image gallery to main page layout
  - Position images appropriately in the UI
  - Write tests for gallery integration
  - **Commit:** `feat(layout): integrate image gallery in main layout`

- [ ] **21.3: Implement Story Continuation Logic**
  - Create logic to continue story based on new images and character state
  - Update story generation to reference previous story elements
  - Write tests for story continuation
  - **Commit:** `feat(story): implement story continuation logic`

- [ ] **21.4: Add Story History and Context**
  - Store story history in Zustand store
  - Pass story context to AI for continuation
  - Write tests for story history management
  - **Commit:** `feat(story): add story history and context management`

### 21.3: Add Loading Indicator for LLM Operations

**Goal:**
Display a clear loading indicator (spinner or message) whenever the user is waiting for a response from the LLM (image description or story generation), so users know the app is working and not frozen.

**Requirements:**
- Show a loading spinner or animated message in the UI:
  - When image description is being generated.
  - When story generation is in progress.
- The indicator should be visible in the relevant panel/section (not just global).
- The indicator disappears as soon as the response is received or an error occurs.
- The rest of the UI should remain interactive (except for the specific operation in progress).
- Optionally, display a message like "Generating story, this may take a few minutes..." for long operations.

**Acceptance Criteria:**
- Users see a clear loading indicator while waiting for LLM responses.
- The indicator is removed immediately when the result or error is shown.
- No UI flicker or blocking of unrelated actions.

**Todo List:**
1. Write a failing Jest test for the loading indicator behavior in both image and story panels.
2. Implement a loading spinner or message in the UI.
3. Ensure the indicator is shown/hidden based on loading state from hooks.
4. Test with both fast and slow LLM responses.
5. Refactor and commit.

### Developer Mock Mode for Fast UI/UX Review (2025-06-24)
**Objective:** Allow developers to instantly review UI changes by toggling between real and mocked responses for image upload, image description, and story generation.

#### Features
- Config file (`src/lib/config.ts`) to enable/disable mocks for:
  - Image upload (use a static image)
  - Image description (use a static or random description)
  - Story generation (use a static or random story)
- When enabled, the app instantly returns mock data instead of calling the real API/AI.
- Works independently for each feature (can mock one, two, or all three).
- (Optional) UI toggle in dev mode to enable/disable mocks without code changes.

#### Status
- **Implemented and enabled for all features via config.**
- Toggle mocks by editing `src/lib/config.ts`.

#### Steps
1. Create `src/lib/config.ts` with mock flags for each feature. **(Done)**
2. Update hooks (`useImageAnalysis`, `useStoryGeneration`) to use config and return mock data if enabled. **(Done)**
3. Provide mock data (static image in `public/`, mock description/story strings). **(Done)**
4. (Optional) Add a dev-only UI toggle for enabling/disabling mocks.

#### Benefits
- Instantly see UI changes without waiting for AI responses.
- Test all flows, including error states, with predictable data.

---

## Technical Requirements

### State Management
- **Zustand** for character state and game state
- Persistent storage for character data
- Real-time updates across components

### Character Schema
```typescript
interface Character {
  // Basic Info
  id: string;
  name: string;
  
  // RPG Stats (1-20 range)
  stats: {
    intelligence: number;
    creativity: number;
    perception: number;
    wisdom: number;
  };
  
  // Game Stats
  experience: number;
  level: number;
  experienceToNext: number;
  
  // Story Context
  storyHistory: StoryEntry[];
  currentTurn: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Game Flow
1. User uploads first image → Character initialization
2. Story generated → Character stats updated
3. User has 3 turns to upload new images
4. Each turn: New image → Updated story → Character evolution
5. Game ends after 3 turns

---

## Use this file to plan, track, and TDD all new features from this point forward.

## Project Overview
A Next.js application that allows users to upload images and get AI-generated descriptions and stories using the LM Studio SDK. The project follows a strict Test-Driven Development (TDD) workflow with automatic browser preview.

## Current Features
- ✅ Image upload with drag & drop
- ✅ AI-powered image description generation
- ✅ Story generation based on image descriptions
- ✅ Dual prompt system (default and custom prompts)
- ✅ Modern UI with shadcn/ui components
- ✅ Responsive card-based layout (flex-wrap, not grid)
- ✅ Reset Game button to clear state and turns
- ✅ Robust test coverage for reset/game logic

## Development Phases

### Phase 17: Story Continuation Game
**Objective:** Add a story continuation feature that allows users to continue stories based on previous image descriptions.

#### Tasks
- [ ] Create story history storage system
- [ ] Add "Continue Story" functionality
- [ ] Implement story branching based on new images
- [ ] Add story export as markdown files
- [ ] Create story timeline visualization

### Phase 18: Enhanced UI/UX
**Objective:** Improve the user interface and experience with advanced features.

#### Tasks
- [ ] Add dark/light theme toggle
- [ ] Implement keyboard shortcuts
- [ ] Add image gallery view
- [ ] Create progress indicators for AI operations
- [ ] Add undo/redo functionality

### Phase 19: Performance & Optimization
**Objective:** Optimize application performance and add advanced features.

#### Tasks
- [ ] Implement image caching
- [ ] Add offline support
- [ ] Optimize bundle size
- [ ] Add service worker
- [ ] Implement lazy loading

### Phase 20: Advanced AI Features
**Objective:** Add more sophisticated AI capabilities.

#### Tasks
- [ ] Add image style analysis
- [ ] Implement emotion detection
- [ ] Add object recognition
- [ ] Create image comparison features
- [ ] Add batch processing

---

## Technical Stack
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Testing:** Jest + React Testing Library
- **AI Integration:** LM Studio SDK
- **Development:** TDD workflow with browser preview

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Start LM Studio and ensure it's running on localhost:1234
4. Run development server: `npm run dev`
5. Open http://localhost:3000

## Testing
- Run tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run build: `npm run build`

## Project Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and constants
└── types/              # TypeScript type definitions
```

# Project Status Update (2024-06-23)

- The project is in a clean, TDD-verified state.
- All tests and the production build pass.
- Mock mode for image, description, and story generation is implemented and documented in `src/lib/config.ts`.
- Skipped tests are tracked in code comments or directly in test files (the previous `skipped-tests.md` was deleted).
- The app works with both mock and live data.
- Ready for review of skipped tests, turn validation, or image gallery/story continuation. 