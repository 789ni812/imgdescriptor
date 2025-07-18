# Fighter Voting System & Database Migration - Project Plan

## Project Overview

This document outlines the implementation plan for two major features:
1. **Fighter Voting System** - Community-driven fighter popularity voting
2. **Database Migration** - Transition from JSON files to SQLite database

## Phase 1: Fighter Voting System (2-3 weeks)

### Overview
Implement a community voting system where users can vote on their favorite fighters through a slideshow interface. Users see two fighters at a time and have 30 seconds to vote before the slideshow advances.

### Technical Architecture

#### Data Structures
```typescript
// Voting session management
interface VotingSession {
  id: string;
  status: 'active' | 'completed';
  totalPairs: number;
  currentPairIndex: number;
  createdAt: Date;
  completedAt?: Date;
}

// Fighter pair for voting
interface FighterPair {
  sessionId: string;
  pairIndex: number;
  fighterA: Fighter;
  fighterB: Fighter;
  timeLimit: number; // 30 seconds
}

// Vote submission
interface VoteSubmission {
  sessionId: string;
  pairIndex: number;
  selectedFighterId: string;
  voterId: string; // Session-based
  timestamp: Date;
}

// Voting results
interface VotingResults {
  totalVotes: number;
  fighterVotes: Record<string, number>;
  popularFighters: Array<{
    fighterId: string;
    name: string;
    votes: number;
    percentage: number;
  }>;
}
```

#### API Endpoints
```typescript
// Start new voting session
POST /api/fighting-game/start-voting-session
Response: { sessionId: string, firstPair: FighterPair }

// Submit vote
POST /api/fighting-game/submit-vote
Body: { sessionId: string, selectedFighterId: string }
Response: { nextPair?: FighterPair, votingComplete?: boolean }

// Get voting results
GET /api/fighting-game/voting-results
Response: VotingResults

// Get current voting session
GET /api/fighting-game/current-voting-session
Response: VotingSession | null
```

### Implementation Tasks

#### Week 1: Core Voting Infrastructure
- [ ] **Task 1.1: Create voting data structures and types**
  - Create `src/lib/types/voting.ts` with all voting interfaces
  - Add voting-related types to existing fighter interfaces
  - Write comprehensive tests for type validation

- [ ] **Task 1.2: Implement voting session management**
  - Create `src/lib/utils/votingUtils.ts` for session logic
  - Implement fighter pair generation algorithm
  - Add session persistence to JSON files (temporary)
  - Write tests for session management

- [ ] **Task 1.3: Create voting API endpoints**
  - Implement `/api/fighting-game/start-voting-session`
  - Implement `/api/fighting-game/submit-vote`
  - Implement `/api/fighting-game/voting-results`
  - Add proper error handling and validation
  - Write API tests

#### Week 2: Voting UI Components
- [ ] **Task 2.1: Create voting slideshow component**
  - Create `src/components/voting/FighterVotingSlideshow.tsx`
  - Reuse existing slideshow infrastructure
  - Add voting buttons and countdown timer
  - Implement 30-second auto-advance logic
  - Write component tests

- [ ] **Task 2.2: Add voting button to leaderboard**
  - Modify `src/components/fighting/Leaderboard.tsx`
  - Add "Vote Fighter" button in header
  - Implement voting session initialization
  - Add loading states and error handling
  - Write integration tests

- [ ] **Task 2.3: Create voting results display**
  - Create `src/components/voting/VotingResults.tsx`
  - Display popular fighters with vote counts
  - Add visual indicators for top performers
  - Integrate with leaderboard display
  - Write component tests

#### Week 3: Integration and Polish
- [ ] **Task 3.1: Integrate voting with leaderboard**
  - Add voting statistics to fighter profiles
  - Update leaderboard sorting to include popularity
  - Add voting history to fighter details
  - Write integration tests

- [ ] **Task 3.2: Add voting analytics**
  - Create voting trends and statistics
  - Add voting participation metrics
  - Implement voting session history
  - Write analytics tests

- [ ] **Task 3.3: Final testing and optimization**
  - End-to-end testing of voting flow
  - Performance optimization for large datasets
  - Mobile responsiveness testing
  - Browser compatibility testing

### Success Criteria
- [ ] Users can start voting sessions from leaderboard
- [ ] Voting slideshow displays fighter pairs with 30-second timer
- [ ] Votes are properly recorded and persisted
- [ ] Voting results are displayed in leaderboard
- [ ] All tests pass (TDD compliance)
- [ ] Mobile-responsive design
- [ ] Performance optimized for 100+ fighters

---

## Phase 2: Database Migration (3-4 weeks)

### Overview
Implement a hybrid database approach for local development while maintaining JSON file deployment for production. The database will be used locally with LM Studio for content generation, while production will use pre-generated JSON files for viewing only.

### Architecture Strategy

#### Local Development (Database + LM Studio)
- **SQLite database** for all fighter, tournament, battle, and voting data
- **LM Studio integration** for real-time content generation
- **Full CRUD operations** for creating, updating, and managing content
- **Voting system** with real-time analytics and session management

#### Production Deployment (JSON Files + Pre-generated Content)
- **Static JSON files** for all fighter metadata, tournaments, and battles
- **Pre-generated content** for slideshows, commentary, and voting results
- **Read-only experience** for users viewing completed content
- **No database dependencies** for production deployment

#### Data Flow
```
Local Development:
LM Studio → Database → Content Generation → JSON Export

Production Deployment:
JSON Files → Static Content → User Viewing Experience
```

### Technical Architecture

#### Database Schema (Prisma)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Fighter {
  id          String   @id @default(cuid())
  name        String
  imageUrl    String
  description String?
  stats       Json     // Store complex stats as JSON
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  battlesAsA    Battle[] @relation("FighterA")
  battlesAsB    Battle[] @relation("FighterB")
  votesReceived Vote[]   @relation("VotedFighter")
  votesGiven    Vote[]   @relation("Voter")
  
  @@map("fighters")
}

model Arena {
  id                   String   @id @default(cuid())
  name                 String
  imageUrl             String
  description          String?
  environmentalObjects Json     // Array of objects
  createdAt            DateTime @default(now())
  
  battles Battle[]
  
  @@map("arenas")
}

model Tournament {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  status    String   // 'pending', 'active', 'completed'
  
  matches Match[]
  
  @@map("tournaments")
}

model Battle {
  id        String   @id @default(cuid())
  fighterAId String
  fighterBId String
  arenaId   String
  winner    String?
  battleLog Json     // Store complete battle log
  createdAt DateTime @default(now())
  
  fighterA Fighter   @relation("FighterA", fields: [fighterAId], references: [id])
  fighterB Fighter   @relation("FighterB", fields: [fighterBId], references: [id])
  arena    Arena     @relation(fields: [arenaId], references: [id])
  matches  Match[]
  
  @@map("battles")
}

model Vote {
  id              String   @id @default(cuid())
  voterId         String   // Session-based or anonymous
  fighterAId      String
  fighterBId      String
  selectedFighterId String
  votingSessionId String
  createdAt       DateTime @default(now())
  
  voter           Fighter  @relation("Voter", fields: [voterId], references: [id])
  votedFighter    Fighter  @relation("VotedFighter", fields: [selectedFighterId], references: [id])
  
  @@map("votes")
}

model Match {
  id          String   @id @default(cuid())
  tournamentId String
  battleId    String
  round       Int
  matchNumber Int
  createdAt   DateTime @default(now())
  
  tournament Tournament @relation(fields: [tournamentId], references: [id])
  battle     Battle     @relation(fields: [battleId], references: [id])
  
  @@map("matches")
}
```

#### Database Service Layer
```typescript
// src/lib/database/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Implementation Tasks

#### Week 1: Database Setup and Schema
- [ ] **Task 1.1: Install and configure Prisma**
  - Install Prisma dependencies: `npm install prisma @prisma/client`
  - Initialize Prisma: `npx prisma init`
  - Configure SQLite database for local development only
  - Write Prisma configuration tests
  - Add database to `.gitignore` (local only)

- [ ] **Task 1.2: Design and implement database schema**
  - Create `prisma/schema.prisma` with all models
  - Define relationships and constraints
  - Add database indexes for performance
  - Write schema validation tests
  - Add environment-based database selection

- [ ] **Task 1.3: Create database service layer**
  - Create `src/lib/database/` directory
  - Implement Prisma client configuration
  - Create database utility functions
  - Write database connection tests
  - Add environment detection for local vs production

#### Week 2: Data Migration and Export System
- [ ] **Task 2.1: Create migration scripts**
  - Create `scripts/migrate-to-database.ts`
  - Implement JSON file reading logic
  - Add data validation and transformation
  - Write migration tests

- [ ] **Task 2.2: Migrate existing data**
  - Migrate fighter metadata from JSON files
  - Migrate tournament data and battle logs
  - Migrate arena metadata
  - Verify data integrity after migration

- [ ] **Task 2.3: Create data access layer**
  - Create `src/lib/database/repositories/`
  - Implement FighterRepository
  - Implement TournamentRepository
  - Implement BattleRepository
  - Write repository tests

- [ ] **Task 2.4: Create JSON export system**
  - Create `scripts/export-to-json.ts`
  - Export database content to JSON files
  - Generate production-ready static files
  - Add export validation and testing

#### Week 3: API Migration and Environment Detection
- [ ] **Task 3.1: Update fighter-related APIs**
  - Migrate `/api/fighting-game/list-fighters-metadata`
  - Migrate `/api/save-fighter-metadata`
  - Update fighter utility functions
  - Add environment-based data source selection
  - Write API migration tests

- [ ] **Task 3.2: Update tournament-related APIs**
  - Migrate `/api/tournaments/leaderboard`
  - Migrate tournament creation and execution
  - Update battle replay functionality
  - Add environment-based data source selection
  - Write tournament API tests

- [ ] **Task 3.3: Update voting APIs**
  - Migrate voting session management
  - Update vote submission and results
  - Implement voting analytics queries
  - Add environment-based data source selection
  - Write voting API tests

- [ ] **Task 3.4: Create environment detection system**
  - Add `NODE_ENV` based data source selection
  - Implement fallback from database to JSON files
  - Add production mode detection
  - Create data source abstraction layer

#### Week 4: Testing, Export, and Production Preparation
- [ ] **Task 4.1: Comprehensive testing**
  - End-to-end testing of all features
  - Performance testing with large datasets
  - Database query optimization
  - Write performance tests

- [ ] **Task 4.2: Production export system**
  - Create automated JSON export pipeline
  - Generate production-ready static files
  - Add export validation and testing
  - Create deployment scripts

- [ ] **Task 4.3: Environment-specific testing**
  - Test local development with database
  - Test production mode with JSON files
  - Test fallback mechanisms
  - Write environment-specific tests

- [ ] **Task 4.4: Documentation and deployment**
  - Update API documentation
  - Create local development guide
  - Create production deployment guide
  - Update project documentation

### Success Criteria
- [ ] Local development uses database with LM Studio for content generation
- [ ] Production deployment uses JSON files for read-only viewing
- [ ] Automated export system generates production-ready static files
- [ ] Environment detection automatically switches data sources
- [ ] All tests pass in both local and production modes
- [ ] Database queries optimized with indexes for local development
- [ ] Production deployment has no database dependencies
- [ ] Documentation updated for both development and deployment workflows

---

## Integration Points

### Voting System + Database
- **Local Development**: Voting data stored in database for real-time analytics
- **Production**: Pre-generated voting results stored in JSON files
- **Export Process**: Voting data exported to JSON for production deployment

### Environment-Based Data Sources
- **Local Development**: Database with LM Studio for content generation
- **Production**: JSON files for read-only viewing experience
- **Automatic Detection**: Environment-based data source selection

### Performance Benefits
- **Local Development**: Faster content generation and real-time updates
- **Production**: Optimized static file serving with no database overhead
- **Scalability**: Database for development complexity, JSON for production simplicity

## Risk Mitigation

### Voting System Risks
- **Session Management**: Use robust session handling with fallbacks
- **Data Loss**: Implement vote persistence with retry mechanisms
- **Performance**: Optimize slideshow rendering for large fighter lists

### Database Migration Risks
- **Data Loss**: Comprehensive backup and validation procedures
- **Export Failures**: Automated export validation and testing
- **Environment Conflicts**: Clear separation between local and production data sources

## Future Enhancements

### Post-Migration Features
- **Advanced Analytics**: Complex voting trends and fighter popularity analysis (local development)
- **Content Management**: Enhanced tools for managing and exporting content
- **Tournament Seeding**: Use voting results to seed tournament brackets
- **Social Features**: Share voting results and tournament outcomes

### Scalability Improvements
- **Local Development**: Database optimization for content generation
- **Production**: Static file optimization and CDN integration
- **Export Automation**: Streamlined content export for production deployment

---

## Development Workflow

### TDD Compliance
- Write failing tests before implementation
- Ensure all new features have comprehensive test coverage
- Maintain existing test suite integrity

### Git Workflow
- Feature branches for each major task
- Conventional commit messages
- Regular integration testing

### Documentation
- Update all relevant documentation files
- Create new documentation for database schema
- Maintain API documentation

This project plan provides a structured approach to implementing both features while maintaining code quality, performance, and user experience. 