# AI Agent Prompt: Fighting Game Tournament System

## System Overview

You are assisting with the development of an **AI-Powered Fighting Game Tournament System** built with Next.js 15, TypeScript, and LM Studio. This is a sophisticated application that combines local AI processing with automated tournament management.

## Core Application Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode, no `any` types)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Zustand with persistence
- **AI Integration**: LM Studio SDK for local LLM processing
- **Testing**: Jest + React Testing Library (strict TDD)
- **Build**: Production-optimized with comprehensive error handling

### Key Pages & Routes
- `/playervs` - Main fighter management and battle setup
- `/tournament` - Tournament creation and management
- `/leaderboard` - Fighter statistics and battle replays

## Core Systems

### 1. Fighter Management System (`/playervs`)

The Player vs Player page is the central hub for fighter creation and battle setup.

**Key Components:**
- `FighterImageUpload` - Handles fighter image upload and AI analysis
- `ChooseExistingFighter` - Allows selection from previously uploaded fighters
- `RebalanceFightersButton` - AI-powered fighter stat balancing
- `BattleViewer` - Real-time battle simulation and replay

**Core Fighter Data Structure:**
```typescript
interface Fighter {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  stats: {
    health: number;
    maxHealth: number;
    strength: number;
    luck: number;
    agility: number;
    defense: number;
    age: number;
    size: 'small' | 'medium' | 'large';
    build: 'thin' | 'average' | 'muscular' | 'heavy';
    magic?: number;
    ranged?: number;
    intelligence?: number;
    uniqueAbilities?: string[];
  };
  visualAnalysis: {
    age: string;
    size: string;
    build: string;
    appearance: string[];
    weapons: string[];
    armor: string[];
  };
  combatHistory: any[];
  winLossRecord: { wins: number; losses: number; draws: number };
  createdAt: string;
}
```

**Fighter Upload Flow:**
```typescript
const handleFighterUpload = async ({ url, analysis }: { 
  url: string; 
  analysis: Record<string, unknown> 
}) => {
  const fighterName = extractFighterName(analysis, 'Unknown Fighter');
  const fighterStats = await generateFighterStats(analysis);
  
  const fighter: Fighter = {
    id: generateId(),
    name: fighterName,
    imageUrl: url,
    stats: fighterStats,
    visualAnalysis: analysis,
    combatHistory: [],
    winLossRecord: { wins: 0, losses: 0, draws: 0 }
  };
  
  setFighter('fighterA', fighter);
};
```

### 2. AI Fighter Balancing System

One of the most innovative features is the AI-powered fighter balancing system.

**Fighter Classification:**
```typescript
const FIGHTER_TYPES = {
  HUMAN: {
    name: 'Human',
    healthRange: [600, 800],
    strengthRange: [60, 90],
    agilityRange: [50, 95],
    defenseRange: [40, 80],
    luckRange: [20, 50]
  },
  MONSTER: {
    name: 'Monster',
    healthRange: [800, 1200],
    strengthRange: [80, 100],
    agilityRange: [30, 70],
    defenseRange: [60, 90],
    luckRange: [10, 40]
  },
  // ... more types
};
```

**AI Balancing Function:**
```typescript
export async function balanceFighterWithLLM(fighterData: FighterData) {
  const fighterTypeKey = classifyFighter(fighterData.name);
  const typeConfig = FIGHTER_TYPES[fighterTypeKey];
  
  const contextPrompt = `Generate balanced stats for a fighting game character.
  
  Fighter: ${fighterData.name}
  Type: ${typeConfig.name}
  Size: ${fighterData.stats.size}
  Build: ${fighterData.stats.build}
  
  Type Guidelines:
  - ${typeConfig.name}: Health ${typeConfig.healthRange[0]}-${typeConfig.healthRange[1]}, 
    Strength ${typeConfig.strengthRange[0]}-${typeConfig.strengthRange[1]}, 
    Agility ${typeConfig.agilityRange[0]}-${typeConfig.agilityRange[1]}
  `;
  
  const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'local-model',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at generating balanced fighter statistics...'
        },
        { role: 'user', content: contextPrompt }
      ],
      temperature: 0.3,
      max_tokens: 512
    })
  });
}
```

### 3. Tournament System (`/tournament`)

The tournament system provides automated tournament creation and management.

**Tournament Data Structure:**
```typescript
interface Tournament {
  id: string;
  name: string;
  fighters: Fighter[];
  totalRounds: number;
  currentRound: number;
  brackets: TournamentBracket[];
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

interface TournamentBracket {
  round: number;
  matches: TournamentMatch[];
}

interface TournamentMatch {
  id: string;
  fighterA: Fighter;
  fighterB: Fighter;
  winner?: Fighter;
  battleLog?: BattleLog[];
  status: 'pending' | 'in-progress' | 'completed';
}
```

**Tournament Creation Flow:**
```typescript
export default function TournamentPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const handleTournamentCreated = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setViewMode('tournament');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tournament System</h1>
        <p className="text-gray-600">
          Create and manage automated single-elimination tournaments with up to 8 fighters.
        </p>
      </div>
      
      {/* Tournament Controls */}
      <TournamentControls
        tournament={selectedTournament}
        onTournamentUpdated={handleTournamentUpdated}
      />
      
      {/* Tournament Bracket */}
      <TournamentBracket tournament={selectedTournament} />
    </div>
  );
}
```

### 4. Leaderboard & Analytics (`/leaderboard`)

The leaderboard system provides comprehensive fighter performance analytics.

**Leaderboard Data Structure:**
```typescript
interface FighterStats {
  name: string;
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  averageDamageDealt: number;
  averageDamageTaken: number;
  averageRoundsSurvived: number;
  totalRounds: number;
  currentStats: { [key: string]: number | string };
  opponents: string[];
  arenas: string[];
  lastBattle: string;
  imageUrl?: string;
}
```

**Battle Replay Interface:**
```typescript
interface BattleReplay {
  id: string;
  fighterA: Fighter;
  fighterB: Fighter;
  scene: Scene;
  battleLog: Array<{
    round: number;
    attacker: string;
    defender: string;
    attackCommentary: string;
    defenseCommentary: string;
    attackerDamage: number;
    defenderDamage: number;
    randomEvent: string | null;
    arenaObjectsUsed: string | null;
    healthAfter: {
      attacker: number;
      defender: number;
    };
  }>;
  winner: string;
  date: string;
}
```

### 5. Battle System

The battle system handles real-time combat simulation with AI-generated commentary.

**Battle State Management:**
```typescript
interface BattleState {
  fighters: {
    fighterA: Fighter | null;
    fighterB: Fighter | null;
  };
  gamePhase: 'setup' | 'fighting' | 'finished';
  fighterAHealth: number | null;
  fighterBHealth: number | null;
  combatLog: BattleLog[];
  currentRound: number;
  maxRounds: number;
  winner: string | null;
  showRoundAnim: boolean;
  scene: Scene | null;
}
```

**Battle Execution:**
```typescript
const handleBeginCombat = async () => {
  if (!fighterA || !fighterB || !scene) return;
  
  setGamePhase('fighting');
  setFighterAHealth(fighterA.stats.health);
  setFighterBHealth(fighterB.stats.health);
  setCurrentRound(1);
  
  // Generate battle log using AI
  const battleLog = await generateBattleLog(fighterA, fighterB, scene);
  setCombatLog(battleLog);
  
  // Execute battle round by round
  for (let round = 1; round <= maxRounds; round++) {
    await executeBattleRound(round, battleLog[round - 1]);
  }
  
  const winner = determineWinner();
  setWinner(winner);
  setGamePhase('finished');
};
```

## AI Integration with LM Studio

### Local AI Processing Architecture

The application uses LM Studio for all AI features, ensuring privacy and performance.

**LM Studio Client Configuration:**
```typescript
const DESCRIBER_MODEL = 'google/gemma-3-4b';  // Image analysis model
const WRITER_MODEL = 'gemma-the-writer-n-restless-quill-10b-uncensored@q2_k';  // Story generation

export const analyzeImage = async (
  imageBase64: string,
  prompt: string
): Promise<AnalysisResult> => {
  const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: DESCRIBER_MODEL,
      messages: [
        {
          role: 'system',
          content: IMAGE_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
};
```

### Prompt Engineering

The system uses sophisticated prompt engineering for consistent AI responses.

**Fighter Analysis Prompt:**
```typescript
export const FIGHTER_ANALYSIS_PROMPT = `Analyze this image as a potential fighter for a tournament system.

CRITICAL REQUIREMENTS:
- Output ONLY a valid JSON object with the following keys: "name", "description", "stats", "visual_analysis"
- All property names and string values MUST be double-quoted
- "stats" must be an object with numeric values
- "visual_analysis" must include "age", "size", "build", "appearance", "weapons", "armor"

ANALYSIS FOCUS:
- **Name**: Identify the character or entity name
- **Description**: Brief description of the fighter
- **Stats**: Generate balanced statistics (health, strength, agility, defense, luck)
- **Visual Analysis**: Detailed physical characteristics and equipment

QUALITY REQUIREMENTS:
- Be specific and descriptive
- Focus on combat-relevant characteristics
- Identify potential strengths and weaknesses
- Consider size, build, and equipment in stat generation
- Ensure logical relationships between stats
`;
```

**Battle Commentary Prompt:**
```typescript
export const BATTLE_COMMENTARY_PROMPT = `Generate exciting battle commentary for a fighting game round.

FIGHTERS:
- Fighter A: ${fighterA.name} (Health: ${fighterAHealth}, Strength: ${fighterA.stats.strength}, Agility: ${fighterA.stats.agility})
- Fighter B: ${fighterB.name} (Health: ${fighterBHealth}, Strength: ${fighterB.stats.strength}, Agility: ${fighterB.stats.agility})

ARENA: ${scene.name} - ${scene.description}

ROUND: ${round}

REQUIREMENTS:
- Generate attack and defense commentary
- Include arena-specific elements
- Make it exciting and descriptive
- Reference fighter stats and characteristics
- Keep it under 100 words per commentary

OUTPUT FORMAT:
{
  "attackCommentary": "Exciting attack description",
  "defenseCommentary": "Defensive action description",
  "randomEvent": "Optional random event or null",
  "arenaObjectsUsed": "Optional arena object or null"
}
`;
```

## State Management with Zustand

The application uses Zustand for state management with persistence.

**Fighting Game Store:**
```typescript
interface FightingGameStore {
  // Fighter state
  fighters: {
    fighterA: Fighter | null;
    fighterB: Fighter | null;
  };
  
  // Battle state
  gamePhase: 'setup' | 'fighting' | 'finished';
  fighterAHealth: number | null;
  fighterBHealth: number | null;
  combatLog: BattleLog[];
  currentRound: number;
  maxRounds: number;
  winner: string | null;
  showRoundAnim: boolean;
  scene: Scene | null;
  
  // Actions
  setFighter: (position: 'fighterA' | 'fighterB', fighter: Fighter) => void;
  setScene: (scene: Scene) => void;
  setGamePhase: (phase: FightingGameStore['gamePhase']) => void;
  resetGame: () => void;
  updateHealthAndCommentary: (round: BattleLog) => void;
}
```

## Testing Strategy

The project follows strict TDD principles with comprehensive test coverage.

**Example Test Structure:**
```typescript
describe('Fighter Balancing', () => {
  test('should balance fighter stats using LLM', async () => {
    const mockFighterData = {
      name: 'Bruce Lee',
      stats: {
        health: 100,
        strength: 50,
        agility: 50,
        defense: 50,
        luck: 50,
        age: 32,
        size: 'medium',
        build: 'muscular'
      }
    };

    const result = await balanceFighterWithLLM(mockFighterData);
    
    expect(result.method).toBe('llm');
    expect(result.newStats.health).toBeGreaterThan(0);
    expect(result.newStats.strength).toBeGreaterThan(0);
    expect(result.newStats.agility).toBeGreaterThan(0);
  });
});
```

## File Structure

```
src/
├── app/
│   ├── playervs/
│   │   └── page.tsx              # Main fighter management page
│   ├── tournament/
│   │   └── page.tsx              # Tournament management
│   ├── leaderboard/
│   │   └── page.tsx              # Leaderboard and battle replays
│   └── api/
│       ├── analyze-image/        # Image analysis endpoint
│       ├── generate-fighter-stats/ # Fighter stat generation
│       ├── tournaments/          # Tournament management
│       └── battle-replays/       # Battle replay data
├── components/
│   ├── fighting/
│   │   ├── FighterImageUpload.tsx
│   │   ├── ChooseExistingFighter.tsx
│   │   ├── RebalanceFightersButton.tsx
│   │   ├── BattleViewer.tsx
│   │   ├── HealthBar.tsx
│   │   └── WinnerAnimation.tsx
│   ├── tournament/
│   │   ├── TournamentCreator.tsx
│   │   ├── TournamentBracket.tsx
│   │   └── TournamentControls.tsx
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── stores/
│   │   └── fightingGameStore.ts  # Zustand store
│   ├── types/
│   │   ├── fighter.ts
│   │   ├── tournament.ts
│   │   └── battle.ts
│   ├── utils/
│   │   ├── fighterUtils.ts
│   │   └── battleUtils.ts
│   ├── fighter-balancing.ts      # AI balancing logic
│   └── lmstudio-client.ts        # LM Studio integration
└── hooks/
    └── useFighterGeneration.ts   # Custom hooks
```

## Key Development Principles

### 1. Type Safety
- Strict TypeScript implementation with no `any` types
- Comprehensive interfaces for all data structures
- Runtime type validation for AI responses

### 2. Test-Driven Development
- Write failing tests before implementation
- Comprehensive test coverage (463 tests passing)
- Mock testing for AI dependencies
- E2E testing with Playwright

### 3. AI Integration Best Practices
- Local AI processing for privacy and performance
- Sophisticated prompt engineering for consistency
- Fallback systems for AI unavailability
- Response validation and error handling

### 4. Performance Optimization
- Efficient state management with Zustand
- Optimized rendering with React.memo and useMemo
- Caching strategies for repeated operations
- Production-ready build optimization

## Current Development Status

### ✅ Completed Features
- AI-powered fighter generation and balancing
- Automated tournament system with bracket generation
- Comprehensive leaderboard and analytics
- Battle replay system with AI commentary
- Real-time battle simulation
- Complete test coverage (463 tests)

### 🚀 Ready for Enhancement
- Multiplayer support
- Advanced AI models
- Custom tournament formats
- Fighter evolution system
- Community features

## Development Environment

### Cursor IDE Experience
- AI-powered code completion and refactoring
- Intelligent bug detection and suggestions
- Automated test generation following TDD principles
- Enhanced productivity through AI assistance

### Local Development Setup
- Git Bash terminal (Windows compatibility)
- LM Studio running locally for AI features
- Jest testing with comprehensive coverage
- Production build verification

## Key Challenges & Solutions

### 1. AI Response Consistency
**Challenge**: Ensuring consistent AI responses for fighter analysis and stat generation.

**Solution**: 
- Comprehensive prompt engineering with strict JSON output requirements
- Multiple fallback strategies (rule-based, cached responses)
- Validation systems to ensure response quality
- Lower temperature settings for more predictable outputs

### 2. Tournament Scalability
**Challenge**: Managing tournaments with varying numbers of fighters and complex bracket logic.

**Solution**:
- Flexible bracket generation algorithms
- Efficient data structures for tournament state management
- Comprehensive error handling for edge cases
- Responsive UI that adapts to different tournament sizes

### 3. Battle Replay Performance
**Challenge**: Smooth playback of complex battle sequences with real-time updates.

**Solution**:
- Efficient state management for battle progression
- Optimized rendering strategies for health bars and animations
- Comprehensive replay controls with pause/resume functionality
- Robust error handling for corrupted battle data

## Future Development Guidelines

When assisting with future development, consider:

1. **Maintain Type Safety**: Always use strict TypeScript types
2. **Follow TDD**: Write tests before implementing features
3. **AI Integration**: Use local LM Studio for all AI features
4. **Performance**: Optimize for smooth user experience
5. **Error Handling**: Implement comprehensive fallback systems
6. **Documentation**: Update relevant documentation files

## Key Files for Reference

- `src/app/playervs/page.tsx` - Main fighter management page
- `src/lib/fighter-balancing.ts` - AI balancing logic
- `src/lib/stores/fightingGameStore.ts` - State management
- `src/lib/lmstudio-client.ts` - AI integration
- `src/components/fighting/BattleViewer.tsx` - Battle simulation
- `src/app/tournament/page.tsx` - Tournament management
- `src/app/leaderboard/page.tsx` - Leaderboard and replays

This system represents a sophisticated integration of modern web technologies with local AI processing, creating an engaging and scalable fighting game tournament platform. 