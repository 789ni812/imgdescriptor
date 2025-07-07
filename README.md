# AI Image Describer RPG Game

An interactive, AI-driven storytelling game that transforms uploaded images into dynamic RPG adventures with adaptive Dungeon Master (DM) interaction.

## 🎮 Features

### **Core Gameplay**
- **Image Analysis**: AI analyzes uploaded images and generates detailed descriptions
- **Dynamic Storytelling**: AI generates engaging stories based on images and character context
- **Choice System**: Meaningful choices that affect character development and story direction
- **Character Development**: Comprehensive character stats, moral alignment, and progression
- **Turn-Based Adventure**: 3-turn story progression with cumulative narrative impact

### **DM Reflection & Adaptation System**
- **AI Dungeon Master**: Intelligent DM that reflects on player choices and adapts future content
- **Dynamic Difficulty**: Adjusts story complexity based on player performance
- **Personality-Driven**: Different DM personalities create unique storytelling experiences
- **Adaptive Narratives**: Story direction changes based on player behavior and choices

### **Advanced Features**
- **Good vs Bad Framework**: Customizable moral alignment system with configurable themes
- **Template System**: Save and load game sessions with all character data and story history
- **Debug Logging**: Comprehensive logging for fine-tuning and troubleshooting
- **Mock Mode**: Test functionality without external APIs
- **Responsive UI**: Modern, accessible interface with real-time feedback
- **Sound Feedback**: Audio cues for story generation and user interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- LM Studio running locally (for AI features)
- Git Bash (recommended for Windows)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd imgDescriptor-cursor

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start your adventure!

## 🎯 How to Play

1. **Upload an Image**: Drag and drop or select an image to begin
2. **Character Creation**: AI automatically creates a character based on the image
3. **Story Generation**: AI generates an engaging story scene
4. **Make Choices**: Select from meaningful choices that affect your character
5. **DM Reflection**: AI DM analyzes your choices and adapts future content
6. **Continue Adventure**: Upload new images for subsequent turns
7. **Final Story**: After 3 turns, receive a cohesive final narrative

## 🛠️ Development

### **Testing (TDD Enforced)**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test/file.test.tsx
```

### **Build & Quality Assurance**
```bash
# Production build
npm run build

# Development server
npm run dev

# Linting
npm run lint
```

### **Current Status**
- ✅ **463 tests passing** with comprehensive TDD coverage
- ✅ **Production build successful** with optimized performance
- ✅ **Full TypeScript support** with strict typing
- ✅ **Complete feature set** including DM Reflection & Adaptation
- ✅ **Modern UI**: Fully migrated to shadcn/ui with consistent theming
- ✅ **Debug logging system** for fine-tuning and troubleshooting
- ✅ **Robust Audio system** with comprehensive mocking and error handling
- ✅ **All test suites passing** including previously problematic Audio and LM Studio client tests

## 🏗️ Architecture

### **Tech Stack**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **AI Integration**: LM Studio SDK

### **Key Systems**
- **Character System**: Stats, moral alignment, traits, and progression
- **DM System**: Personality-driven storytelling with adaptation
- **Template System**: Game session management and persistence
- **Debug System**: Comprehensive logging and monitoring
- **API System**: RESTful endpoints for AI interactions
- **Audio System**: Sound feedback with robust mocking for testing

## 📚 Documentation

- **[Game Variables Guide](GAME_VARIABLES_GUIDE.md)**: Complete variable reference and user experience flow
- **[Architecture Guide](ARCHITECTURE.md)**: Technical architecture and system design
- **[Project Specification](spec.md)**: Detailed feature specifications and implementation status
- **[Future Ideas](IDEAS.md)**: Planned features and enhancement roadmap

## 🔧 Configuration

### **LM Studio Setup**
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load a compatible model (e.g., Llama 3.1 8B)
3. Start the local server (default: http://localhost:1234)
4. The app will automatically connect to LM Studio

### **Mock Mode**
For testing without LM Studio, enable mock mode in `src/lib/config.ts`:
```typescript
export const MOCK_MODE = true;
```

## 🐛 Debugging

### **Browser Debug Tools**
- **Console Logs**: Detailed debug information in browser console
- **Network Tab**: Monitor API calls and responses
- **React DevTools**: Inspect component state and props
- **Application Tab**: View local storage and session data

### **Debug Logging**
The app includes comprehensive debug logging:
- Component state changes
- API call details and responses
- Character development tracking
- DM reflection and adaptation processes
- Performance metrics and timing
- Audio system events and errors

## 🤝 Contributing

### **Development Workflow**
1. **TDD First**: Write failing tests before implementing features
2. **Type Safety**: Use strict TypeScript types (no `any`)
3. **Test Coverage**: Ensure comprehensive test coverage
4. **Build Verification**: All changes must pass production build
5. **Documentation**: Update relevant documentation files

### **Code Quality**
- Follow established patterns and conventions
- Maintain strict TypeScript typing
- Write clear, descriptive commit messages
- Ensure all tests pass before committing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Project Status (2025-01-27)

- ✅ **Complete Feature Set**: All core features implemented and tested
- ✅ **DM Reflection & Adaptation**: AI DM system fully functional
- ✅ **Modern UI**: Fully migrated to shadcn/ui with consistent theming
- ✅ **Debug System**: Comprehensive logging and monitoring
- ✅ **Production Ready**: Optimized build with full test coverage
- ✅ **Documentation**: Complete and up-to-date documentation
- ✅ **Test Suite Robust**: All 463 tests passing with comprehensive coverage
- ✅ **Audio System**: Fully functional with robust testing and error handling
- 🚀 **Ready for Enhancement**: Solid foundation for future features

The app is now ready for comprehensive testing, fine-tuning, and future enhancements!
