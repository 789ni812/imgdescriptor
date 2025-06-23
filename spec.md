# Project Specification: AI Image Describer (from 2025-06-23)

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

### Phase 17: (define your next feature here)
- [ ] Task 1
- [ ] Task 2

### Phase 18: (future feature)
- [ ] Task 1
- [ ] Task 2

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
- ✅ Responsive card-based layout
- ✅ Comprehensive test coverage
- ✅ TDD workflow with browser preview

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