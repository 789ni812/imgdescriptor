# AI Image Describer RPG - Project Overview for AI Assistants

## Project Summary

**AI Image Describer RPG** is a sophisticated Next.js/TypeScript application that transforms user-uploaded images into an interactive, turn-based storytelling game. The app uses an LLM (via LM Studio) to generate detailed image descriptions and branching story segments, creating a dynamic RPG experience where player choices shape the narrative.

## Core Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode, no `any` types)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: Zustand with persistence
- **AI Integ
ration**: LM Studio SDK for local LLM processing
- **Testing**: Jest + React Testing Library (strict TDD)
- **Build**: Production-optimized with comprehensive error handling

## Key Features

### 1. **Turn-Based Storytelling System**
- 3-turn limit with dynamic turn management
- Each turn: image upload → AI description → story generation → player choices
- **After a user selects a choice, the DM narrates the outcome, updates stats, and determines if the game continues or ends (game over) via `/api/dm-outcome`.**
- Story continuation across turns with full context preservation
- Per-turn accordion UI with loading states and content management

### 2. **AI Dungeon Master System**
- **DM Reflection & Adaptation**: AI DM reflects on each turn and adapts future content
- **Personality-Driven Storytelling**: Different DM personalities create unique experiences
- **Dynamic Difficulty Scaling**: Automatic adjustment based on player performance
- **Mood & Personality Evolution**: DM personality changes based on player actions
- **Adaptive Narratives**: Story direction changes based on player behavior

### 3. **Dungeon Master Agency & Gamebook Tone (2025-06-23)**

- The AI Dungeon Master (DM) is responsible for:
  - Actively adjusting the player's health and stats based on narrative events, choices, and remaining turns.
  - Making explicit, gamebook-style decisions and consequences, including the possibility of player death or stat-based outcomes.
  - Maintaining a consistent narrative tone inspired by classic gamebooks (e.g., Ian Livingstone's Forest of Doom). The DM's narration should be immersive, direct, and filled with tension and consequence.
  - Using prompt engineering to ensure the LLM always writes in this style. Example: 'Write the next story segment in the style of Ian Livingstone's Forest of Doom, with clear consequences and a sense of peril.'

### Choices Recap UI
- Each turn card must display all choices generated for that turn, with the user's selected choice clearly highlighted (e.g., border, background, or icon).
- The recap should appear below the story for best narrative flow.

### 4. **Character Development System**
- **Comprehensive Stats**: Intelligence, Creativity, Perception, Wisdom, Health
- **Moral Alignment**: Numeric alignment score (-100 to +100) with reputation tracking
- **Character Progression**: Stats evolve based on choices and story outcomes
- **Choice-Consequence Matrix**: Each choice affects character development

### 5. **Template Management System**
- **Portable Templates**: Save/load complete game sessions with full state
- **Template Types**: Support for different use cases (game, comics, business, etc.)
- **Import/Export**: Share templates with images and prompts
- **Template Editing**: Full CRUD operations with validation

### 6. **Good vs Bad Framework**
- **Moral Duality**: Configurable themes (hero-vs-villain, yin-yang, etc.)
- **Customizable Roles**: Define hero and villain characteristics
- **Profile Pictures**: Visual representation of good/bad entities
- **Narrative Integration**: Moral choices affect story direction

### 7. **Advanced UI/UX Features**
- **Responsive Design**: Modern, accessible interface with shadcn/ui components
- **Real-time Feedback**: Loading states, progress indicators, toast notifications
- **Visual Storytelling**: Image gallery with accordion-based content display
- **Debug System**: Comprehensive logging and monitoring capabilities

## Architecture Overview

### State Management
- **Zustand Stores**: Character, DM, Template stores with persistence
- **Client-Only Rendering**: All Zustand-dependent UI uses ClientOnly pattern
- **Type Safety**: Strict TypeScript interfaces for all state
- **Persistence**: Local storage integration with error handling

### AI Integration
- **LM Studio SDK**: Local LLM processing for privacy and performance
- **Mock Mode**: Full functionality testing without external APIs
- **Prompt Engineering**: Dynamic prompts with character context and DM personality
- **Error Handling**: Robust fallback mechanisms and retry logic

### Component Architecture
- **Modular Design**: Reusable components with clear separation of concerns
- **TDD Approach**: All components have comprehensive test coverage
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Performance**: React.memo, useMemo, and useCallback optimizations

## Development Workflow

### TDD Process (Strictly Enforced)
1. **Write Failing Test**: Create comprehensive test suite covering all requirements
2. **Implement Code**: Write minimal code to make tests pass
3. **Refactor**: Clean up code while ensuring tests continue to pass
4. **Quality Assurance**: Run full test suite, build check, browser preview
5. **Documentation**: Update spec.md and commit with conventional commit message

### Testing Strategy
- **418 Tests Passing**: Comprehensive coverage across all components
- **Component Testing**: UI interactions, state changes, accessibility
- **Integration Testing**: API endpoints, store interactions, end-to-end flows
- **Mock Testing**: Full functionality without external dependencies

### Code Quality Standards
- **TypeScript Strict**: No `any` types, comprehensive interfaces
- **ESLint Compliance**: No linting errors or warnings
- **Performance**: Optimized rendering and state management
- **Documentation**: Inline comments and comprehensive documentation

## Key Technical Decisions

### 1. **Client-Only Rendering for Zustand**
- All UI components that depend on Zustand state use ClientOnly pattern
- Prevents hydration mismatches between server and client
- Ensures state consistency and eliminates SSR/CSR issues

### 2. **Dynamic Prompt System**
- Character stats, choices, and game state injected into AI prompts
- DM personality and mood affect story generation
- Adaptive difficulty scaling based on player performance
- Comprehensive prompt templates with placeholder system

### 3. **Template Portability**
- Templates stored as JSON with relative image paths
- No zip export required; folder copying enables sharing
- Version compatibility and migration support
- Template type system for different use cases

### 4. **Mock Mode Support**
- Full functionality testing without external APIs
- Comprehensive mock data for all AI responses
- Enables development and testing without LM Studio
- Maintains all features and interactions

## Current Implementation Status

### ✅ **Fully Implemented Features**
- **DM Reflection & Adaptation System**: Complete AI DM with personality evolution
- **Character Development**: Stats, moral alignment, progression tracking
- **Template Management**: Save/load with full state persistence
- **Good vs Bad Framework**: Customizable moral alignment system
- **Turn-Based Gameplay**: 3-turn system with story continuation
- **Advanced UI**: shadcn/ui components with responsive design
- **Debug System**: Comprehensive logging and monitoring
- **Mock Mode**: Full functionality without external APIs

### 🚀 **Ready for Enhancement**
- **Combat System**: Dice rolls, health management, skill checks
- **Inventory System**: Items, equipment, and effects
- **Multiplayer Support**: Collaborative storytelling
- **Voice Integration**: Audio narration and voice commands
- **Advanced AI Features**: Machine learning integration

## File Structure

```
src/
├── app/                 # Next.js App Router (pages, layout, API routes)
├── components/          # React components (UI, layout, feature)
├── hooks/              # Custom React hooks
├── lib/                # Utilities, constants, Zustand stores, types
│   ├── stores/         # Zustand state management
│   ├── types/          # TypeScript type definitions
│   ├── prompts/        # Dynamic prompt system
│   └── utils/          # Utility functions
└── types/              # Legacy or shared types
```

## API Endpoints

- `/api/analyze-image` - Image analysis and description generation
- `/api/generate-story` - Story generation with character context
- `/api/generate-choices` - Choice generation with consequences
- `/api/dm-reflection` - DM reflection and adaptation
- `/api/dm-outcome` - **NEW:** After a user selects a choice, this endpoint sends the current game state, previous story, and selected choice to the Dungeon Master (LLM). The DM narrates the outcome, updates stats, and determines if the game continues or ends (game over).
- `/api/upload-image` - Image upload and storage

## Environment Configuration

### Development (Windows + Git Bash)
- **Terminal**: Git Bash for npm commands (not PowerShell/CMD)
- **Dependencies**: All testing libraries installed
- **Jest Config**: `jest.config.js` for Windows compatibility
- **Build**: Production build with optimization

### Production (Vercel)
- **Static Assets**: Images in `public/imageRepository/`
- **Read-only**: No uploads or LLM generation in production
- **Template Usage**: Import and use templates only

## Key Dependencies

```json
{
  "next": "^15.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "zustand": "^4.0.0",
  "tailwindcss": "^4.0.0",
  "jest": "^29.0.0",
  "react-markdown": "^9.0.0",
  "uuid": "^9.0.0"
}
```

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/components/ComponentName.test.tsx

# Watch mode
npm run test:watch

# Build check
npm run build

# Development server
npm run dev
```

## Browser Preview

- **Development**: http://localhost:3000
- **Port Management**: Check for running processes and stop if needed
- **Git Bash**: Use Git Bash terminal for all npm commands

## Documentation Files

- **ARCHITECTURE.md**: Technical architecture, data models, system diagrams
- **spec.md**: Project specification, phases, implementation status
- **IDEAS.md**: Future use cases and enhancement roadmap
- **README.md**: Project overview and setup instructions
- **GAME_VARIABLES_GUIDE.md**: Variable reference and user experience flow

## Development Principles

### 1. **Type Safety First**
- Never use `any` in production code
- Comprehensive TypeScript interfaces
- Strict type validation and error handling

### 2. **Test-Driven Development**
- Write failing tests before implementation
- Comprehensive test coverage for all features
- All tests must pass before commit

### 3. **Performance Optimization**
- React.memo for component optimization
- useMemo/useCallback for expensive calculations
- Efficient state management and rendering

### 4. **User Experience**
- Responsive and accessible design
- Real-time feedback and loading states
- Intuitive navigation and interactions

### 5. **Extensibility**
- Modular architecture for future features
- Template system for different use cases
- Plugin-like structure for enhancements

## Common Development Patterns

### 1. **Component Structure**
```typescript
interface ComponentProps {
  // Strictly typed props
}

const Component: React.FC<ComponentProps> = React.memo(({ ... }) => {
  // Component logic with hooks
  return (
    // JSX with shadcn/ui components
  );
});

export default Component;
```

### 2. **Store Actions**
```typescript
interface Store {
  // State interface
  actions: {
    // Action definitions
  };
}

const useStore = create<Store>((set, get) => ({
  // State and actions
}));
```

### 3. **Hook Pattern**
```typescript
interface HookReturn {
  // Return type interface
}

const useCustomHook = (): HookReturn => {
  // Hook logic
  return {
    // Return values
  };
};
```

### 4. **Test Structure**
```typescript
describe('Component', () => {
  it('should render correctly', () => {
    // Test implementation
  });
});
```

## Error Handling

### 1. **API Errors**
- Comprehensive error handling in all API routes
- User-friendly error messages
- Fallback mechanisms for failed requests

### 2. **State Errors**
- Zustand store error boundaries
- Local storage error handling
- Graceful degradation for state issues

### 3. **UI Errors**
- Error boundaries for component failures
- Loading states and error displays
- Retry mechanisms for failed operations

## Performance Considerations

### 1. **Rendering Optimization**
- React.memo for stable components
- useMemo for expensive calculations
- useCallback for event handlers

### 2. **State Management**
- Granular selectors for Zustand stores
- Efficient state updates and batching
- Memory management for large datasets

### 3. **Asset Optimization**
- Next.js Image component for images
- Code splitting for large components
- Efficient bundle size management

## Security Considerations

### 1. **Client-Side Security**
- Input validation and sanitization
- XSS prevention in markdown rendering
- Secure state management

### 2. **API Security**
- Request validation and rate limiting
- Error message sanitization
- Secure file upload handling

### 3. **Data Privacy**
- Local processing with LM Studio
- No external data transmission
- Secure template storage

## Future Development Roadmap

### 1. **Advanced Game Mechanics**
- Combat system with dice rolls
- Inventory and item management
- Skill checks and character progression

### 2. **Enhanced AI Features**
- Machine learning integration
- Advanced DM personality evolution
- Sophisticated story generation

### 3. **Multiplayer Support**
- Collaborative storytelling
- Shared game sessions
- Real-time interaction

### 4. **Voice Integration**
- Audio narration
- Voice commands
- Speech-to-text input

### 5. **Educational Applications**
- Learning tools
- Creative writing aids
- Interactive storytelling for education

## Support and Maintenance

### 1. **Debug System**
- Comprehensive logging across all components
- API call monitoring and response tracking
- Performance metrics and timing analysis

### 2. **Error Recovery**
- Graceful degradation for failures
- Automatic retry mechanisms
- User-friendly error messages

### 3. **Performance Monitoring**
- Build optimization
- Runtime performance tracking
- Memory usage monitoring

## Conclusion

This AI Image Describer RPG project represents a sophisticated implementation of AI-driven storytelling with comprehensive game mechanics, advanced UI/UX, and robust technical architecture. The project follows strict development practices including TDD, type safety, and performance optimization, making it a solid foundation for future enhancements and extensions.

The combination of local AI processing, dynamic storytelling, and modular architecture creates a unique and powerful platform for interactive narrative experiences, with the potential for significant expansion into educational, creative, and entertainment applications. 