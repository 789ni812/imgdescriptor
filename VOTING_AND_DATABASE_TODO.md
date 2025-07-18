# Fighter Voting System & Database Migration - Todo List

## Phase 1: Fighter Voting System

### Week 1: Core Voting Infrastructure

#### Task 1.1: Create voting data structures and types
- [ ] **Write failing Jest test for voting types** (`src/lib/types/voting.test.ts`)
  - Test `VotingSession` interface validation
  - Test `FighterPair` interface validation
  - Test `VoteSubmission` interface validation
  - Test `VotingResults` interface validation

- [ ] **Create voting types file** (`src/lib/types/voting.ts`)
  - Define `VotingSession` interface
  - Define `FighterPair` interface
  - Define `VoteSubmission` interface
  - Define `VotingResults` interface
  - Add type validation functions

- [ ] **Update existing fighter interfaces** (`src/lib/types/fighter.ts`)
  - Add `voteCount?: number` to fighter stats
  - Add `popularity?: number` to fighter stats
  - Add voting-related types to existing interfaces

- [ ] **Run tests and verify** - All voting type tests should pass

#### Task 1.2: Implement voting session management
- [ ] **Write failing Jest test for voting utilities** (`src/lib/utils/votingUtils.test.ts`)
  - Test session creation and management
  - Test fighter pair generation algorithm
  - Test session persistence to JSON files
  - Test vote counting and results calculation

- [ ] **Create voting utilities** (`src/lib/utils/votingUtils.ts`)
  - Implement `createVotingSession()` function
  - Implement `generateFighterPairs()` function
  - Implement `saveVotingSession()` function
  - Implement `loadVotingSession()` function
  - Implement `calculateVotingResults()` function

- [ ] **Create voting data storage** (`public/voting/`)
  - Create directory structure for voting data
  - Implement JSON file storage for sessions
  - Implement JSON file storage for votes
  - Add data validation and error handling

- [ ] **Run tests and verify** - All voting utility tests should pass

#### Task 1.3: Create voting API endpoints
- [ ] **Write failing Jest test for voting APIs** (`src/app/api/fighting-game/start-voting-session/route.test.ts`)
  - Test session creation endpoint
  - Test error handling for invalid requests
  - Test response format validation

- [ ] **Create start voting session API** (`src/app/api/fighting-game/start-voting-session/route.ts`)
  - Implement POST endpoint for session creation
  - Add request validation
  - Return session ID and first fighter pair
  - Add proper error handling

- [ ] **Write failing Jest test for vote submission** (`src/app/api/fighting-game/submit-vote/route.test.ts`)
  - Test vote submission endpoint
  - Test session validation
  - Test next pair generation

- [ ] **Create submit vote API** (`src/app/api/fighting-game/submit-vote/route.ts`)
  - Implement POST endpoint for vote submission
  - Validate session and fighter IDs
  - Save vote to storage
  - Return next fighter pair or completion status

- [ ] **Write failing Jest test for voting results** (`src/app/api/fighting-game/voting-results/route.test.ts`)
  - Test results retrieval endpoint
  - Test vote counting accuracy
  - Test popular fighters calculation

- [ ] **Create voting results API** (`src/app/api/fighting-game/voting-results/route.ts`)
  - Implement GET endpoint for voting results
  - Calculate vote counts and percentages
  - Return popular fighters list
  - Add caching for performance

- [ ] **Run tests and verify** - All voting API tests should pass

### Week 2: Voting UI Components

#### Task 2.1: Create voting slideshow component
- [ ] **Write failing Jest test for voting slideshow** (`src/components/voting/FighterVotingSlideshow.test.tsx`)
  - Test component rendering with fighter pairs
  - Test 30-second countdown timer
  - Test voting button functionality
  - Test auto-advance logic

- [ ] **Create voting slideshow component** (`src/components/voting/FighterVotingSlideshow.tsx`)
  - Reuse existing slideshow infrastructure from `TournamentOverview.tsx`
  - Add voting buttons for each fighter
  - Implement 30-second countdown timer
  - Add auto-advance logic when timer expires
  - Add progress indicator for voting session

- [ ] **Add voting UI styling** (`src/components/voting/FighterVotingSlideshow.tsx`)
  - Style voting buttons with hover effects
  - Add countdown timer visualization
  - Style progress indicator
  - Ensure mobile responsiveness

- [ ] **Run tests and verify** - All voting slideshow tests should pass

#### Task 2.2: Add voting button to leaderboard
- [ ] **Write failing Jest test for leaderboard voting** (`src/components/fighting/Leaderboard.test.tsx`)
  - Test "Vote Fighter" button presence
  - Test voting session initialization
  - Test loading states during voting

- [ ] **Modify leaderboard component** (`src/components/fighting/Leaderboard.tsx`)
  - Add "Vote Fighter" button to header section
  - Implement voting session initialization logic
  - Add loading states for voting operations
  - Add error handling for voting failures

- [ ] **Add voting state management** (`src/components/fighting/Leaderboard.tsx`)
  - Add voting session state
  - Add voting results state
  - Add loading and error states
  - Implement voting session cleanup

- [ ] **Run tests and verify** - All leaderboard voting tests should pass

#### Task 2.3: Create voting results display
- [ ] **Write failing Jest test for voting results** (`src/components/voting/VotingResults.test.tsx`)
  - Test results display with vote counts
  - Test popular fighters ranking
  - Test visual indicators for top performers

- [ ] **Create voting results component** (`src/components/voting/VotingResults.tsx`)
  - Display popular fighters with vote counts
  - Add visual indicators for top performers
  - Show voting statistics and trends
  - Add export/share functionality

- [ ] **Integrate results with leaderboard** (`src/components/fighting/Leaderboard.tsx`)
  - Add voting results section to leaderboard
  - Display popular fighters in leaderboard
  - Add sorting by popularity option
  - Update fighter profiles with vote counts

- [ ] **Run tests and verify** - All voting results tests should pass

### Week 3: Integration and Polish

#### Task 3.1: Integrate voting with leaderboard
- [ ] **Write failing Jest test for voting integration** (`src/components/fighting/Leaderboard.test.tsx`)
  - Test voting statistics in fighter profiles
  - Test leaderboard sorting by popularity
  - Test voting history display

- [ ] **Update fighter profiles** (`src/components/fighting/Leaderboard.tsx`)
  - Add voting statistics to fighter display
  - Show vote count and popularity percentage
  - Add voting history to fighter details
  - Update fighter ranking calculations

- [ ] **Add popularity sorting** (`src/components/fighting/Leaderboard.tsx`)
  - Add "Popularity" sort option to leaderboard
  - Implement popularity-based ranking
  - Update sort dropdown with new option
  - Add popularity indicators to fighter rows

- [ ] **Run tests and verify** - All integration tests should pass

#### Task 3.2: Add voting analytics
- [ ] **Write failing Jest test for voting analytics** (`src/lib/utils/votingAnalytics.test.ts`)
  - Test voting trends calculation
  - Test participation metrics
  - Test session history tracking

- [ ] **Create voting analytics utilities** (`src/lib/utils/votingAnalytics.ts`)
  - Implement voting trends analysis
  - Add participation metrics calculation
  - Create session history tracking
  - Add voting pattern analysis

- [ ] **Add analytics to UI** (`src/components/voting/VotingAnalytics.tsx`)
  - Display voting trends over time
  - Show participation statistics
  - Add session history viewer
  - Create analytics dashboard

- [ ] **Run tests and verify** - All analytics tests should pass

#### Task 3.3: Final testing and optimization
- [ ] **Write end-to-end tests** (`e2e/voting.spec.ts`)
  - Test complete voting flow from leaderboard
  - Test voting session with multiple pairs
  - Test results display and leaderboard updates
  - Test mobile responsiveness

- [ ] **Performance optimization**
  - Optimize slideshow rendering for large fighter lists
  - Add caching for voting results
  - Optimize API response times
  - Add lazy loading for fighter images

- [ ] **Mobile responsiveness testing**
  - Test voting interface on mobile devices
  - Ensure touch-friendly voting buttons
  - Test countdown timer on small screens
  - Verify responsive design across devices

- [ ] **Browser compatibility testing**
  - Test in Chrome, Firefox, Safari, Edge
  - Verify session storage functionality
  - Test timer accuracy across browsers
  - Ensure consistent behavior

- [ ] **Run all tests and verify** - All tests should pass

---

## Phase 2: Database Migration

### Week 1: Database Setup and Schema

#### Task 1.1: Install and configure Prisma
- [ ] **Install Prisma dependencies**
  ```bash
  npm install prisma @prisma/client
  npm install --save-dev @types/node
  ```

- [ ] **Initialize Prisma**
  ```bash
  npx prisma init
  ```

- [ ] **Write failing Jest test for Prisma configuration** (`src/lib/database/prisma.test.ts`)
  - Test Prisma client initialization
  - Test database connection
  - Test client singleton pattern

- [ ] **Configure SQLite database** (`prisma/schema.prisma`)
  - Set up SQLite as database provider
  - Configure database URL for development
  - Add environment variable support

- [ ] **Run tests and verify** - Prisma configuration tests should pass

#### Task 1.2: Design and implement database schema
- [ ] **Write failing Jest test for database schema** (`prisma/schema.test.ts`)
  - Test model relationships
  - Test field constraints
  - Test index definitions

- [ ] **Create database schema** (`prisma/schema.prisma`)
  - Define Fighter model with all fields
  - Define Arena model with relationships
  - Define Tournament model with status
  - Define Battle model with foreign keys
  - Define Vote model for voting system
  - Define Match model for tournament structure

- [ ] **Add database indexes** (`prisma/schema.prisma`)
  - Add indexes for frequently queried fields
  - Add composite indexes for complex queries
  - Optimize indexes for leaderboard queries
  - Add indexes for voting analytics

- [ ] **Generate Prisma client**
  ```bash
  npx prisma generate
  ```

- [ ] **Run tests and verify** - Schema validation tests should pass

#### Task 1.3: Create database service layer
- [ ] **Write failing Jest test for database service** (`src/lib/database/prisma.test.ts`)
  - Test database connection management
  - Test client singleton pattern
  - Test error handling

- [ ] **Create database service layer** (`src/lib/database/prisma.ts`)
  - Implement Prisma client configuration
  - Add singleton pattern for client
  - Add connection management
  - Add error handling and logging

- [ ] **Create database utilities** (`src/lib/database/utils.ts`)
  - Add database connection helpers
  - Add transaction management
  - Add query optimization utilities
  - Add data validation helpers

- [ ] **Run tests and verify** - Database service tests should pass

### Week 2: Data Migration

#### Task 2.1: Create migration scripts
- [ ] **Write failing Jest test for migration** (`scripts/migrate-to-database.test.ts`)
  - Test JSON file reading
  - Test data transformation
  - Test database insertion
  - Test data validation

- [ ] **Create migration script** (`scripts/migrate-to-database.ts`)
  - Implement JSON file reading logic
  - Add data transformation functions
  - Add database insertion logic
  - Add data validation and error handling

- [ ] **Create data validation utilities** (`src/lib/database/validation.ts`)
  - Validate fighter data structure
  - Validate tournament data structure
  - Validate battle log data
  - Add data integrity checks

- [ ] **Run tests and verify** - Migration tests should pass

#### Task 2.2: Migrate existing data
- [ ] **Create fighter migration** (`scripts/migrate-fighters.ts`)
  - Read fighter JSON files from `public/vs/fighters/`
  - Transform fighter data to database format
  - Insert fighters into database
  - Validate migration results

- [ ] **Create tournament migration** (`scripts/migrate-tournaments.ts`)
  - Read tournament JSON files from `public/tournaments/`
  - Transform tournament data to database format
  - Insert tournaments and battles into database
  - Validate migration results

- [ ] **Create arena migration** (`scripts/migrate-arenas.ts`)
  - Read arena JSON files from `public/vs/arena/`
  - Transform arena data to database format
  - Insert arenas into database
  - Validate migration results

- [ ] **Verify data integrity**
  - Compare JSON file counts with database records
  - Validate data relationships
  - Check for data corruption
  - Generate migration report

#### Task 2.3: Create data access layer
- [ ] **Write failing Jest test for repositories** (`src/lib/database/repositories/FighterRepository.test.ts`)
  - Test fighter CRUD operations
  - Test fighter queries and filtering
  - Test relationship queries

- [ ] **Create FighterRepository** (`src/lib/database/repositories/FighterRepository.ts`)
  - Implement fighter CRUD operations
  - Add fighter query methods
  - Add relationship queries
  - Add performance optimizations

- [ ] **Create TournamentRepository** (`src/lib/database/repositories/TournamentRepository.ts`)
  - Implement tournament CRUD operations
  - Add tournament query methods
  - Add battle relationship queries
  - Add tournament statistics

- [ ] **Create BattleRepository** (`src/lib/database/repositories/BattleRepository.ts`)
  - Implement battle CRUD operations
  - Add battle query methods
  - Add battle log management
  - Add battle statistics

- [ ] **Run tests and verify** - Repository tests should pass

### Week 3: API Migration

#### Task 3.1: Update fighter-related APIs
- [ ] **Write failing Jest test for fighter API migration** (`src/app/api/fighting-game/list-fighters-metadata/route.test.ts`)
  - Test database-based fighter listing
  - Test backward compatibility
  - Test performance improvements

- [ ] **Migrate fighter listing API** (`src/app/api/fighting-game/list-fighters-metadata/route.ts`)
  - Update to use FighterRepository
  - Maintain backward compatibility
  - Add performance optimizations
  - Add error handling

- [ ] **Migrate fighter save API** (`src/app/api/save-fighter-metadata/route.ts`)
  - Update to use FighterRepository
  - Maintain JSON file backup
  - Add database transaction handling
  - Add validation

- [ ] **Update fighter utilities** (`src/lib/utils/fighterUtils.ts`)
  - Update to use database queries
  - Maintain JSON file fallback
  - Add performance optimizations
  - Add error handling

- [ ] **Run tests and verify** - Fighter API migration tests should pass

#### Task 3.2: Update tournament-related APIs
- [ ] **Write failing Jest test for tournament API migration** (`src/app/api/tournaments/leaderboard/route.test.ts`)
  - Test database-based leaderboard generation
  - Test performance improvements
  - Test data accuracy

- [ ] **Migrate leaderboard API** (`src/app/api/tournaments/leaderboard/route.ts`)
  - Update to use database queries
  - Optimize leaderboard generation
  - Add caching for performance
  - Maintain backward compatibility

- [ ] **Migrate tournament creation API** (`src/app/api/tournaments/create/route.ts`)
  - Update to use TournamentRepository
  - Add database transaction handling
  - Maintain JSON file backup
  - Add validation

- [ ] **Update battle replay functionality**
  - Update to use BattleRepository
  - Optimize battle log queries
  - Add performance improvements
  - Maintain backward compatibility

- [ ] **Run tests and verify** - Tournament API migration tests should pass

#### Task 3.3: Update voting APIs
- [ ] **Write failing Jest test for voting API migration** (`src/app/api/fighting-game/start-voting-session/route.test.ts`)
  - Test database-based voting session management
  - Test performance improvements
  - Test data consistency

- [ ] **Migrate voting session API** (`src/app/api/fighting-game/start-voting-session/route.ts`)
  - Update to use database for session storage
  - Add database transaction handling
  - Maintain JSON file backup
  - Add performance optimizations

- [ ] **Migrate vote submission API** (`src/app/api/fighting-game/submit-vote/route.ts`)
  - Update to use database for vote storage
  - Add database transaction handling
  - Add vote validation
  - Add performance optimizations

- [ ] **Migrate voting results API** (`src/app/api/fighting-game/voting-results/route.ts`)
  - Update to use database queries
  - Optimize vote counting queries
  - Add caching for performance
  - Add real-time updates

- [ ] **Run tests and verify** - Voting API migration tests should pass

### Week 4: Testing and Optimization

#### Task 4.1: Comprehensive testing
- [ ] **Write end-to-end tests** (`e2e/database-migration.spec.ts`)
  - Test complete database migration flow
  - Test all API endpoints with database
  - Test performance improvements
  - Test data integrity

- [ ] **Performance testing**
  - Test leaderboard generation performance
  - Test voting results calculation performance
  - Test battle replay performance
  - Test database query optimization

- [ ] **Database query optimization**
  - Analyze slow queries
  - Add missing indexes
  - Optimize complex queries
  - Add query caching

- [ ] **Write performance tests** (`src/lib/database/performance.test.ts`)
  - Test database connection performance
  - Test query execution times
  - Test concurrent access
  - Test memory usage

#### Task 4.2: Backward compatibility
- [ ] **Write compatibility tests** (`src/lib/database/compatibility.test.ts`)
  - Test JSON file fallback functionality
  - Test data consistency between formats
  - Test graceful degradation
  - Test migration rollback

- [ ] **Implement graceful fallback**
  - Add JSON file reading as fallback
  - Implement dual-write capability
  - Add data consistency checks
  - Add migration rollback functionality

- [ ] **Test data consistency**
  - Compare JSON file data with database
  - Validate all relationships
  - Check for data corruption
  - Generate consistency report

- [ ] **Run tests and verify** - Compatibility tests should pass

#### Task 4.3: Documentation and cleanup
- [ ] **Update API documentation**
  - Update API endpoint documentation
  - Add database schema documentation
  - Add migration guide
  - Add troubleshooting guide

- [ ] **Create database maintenance guide** (`docs/database-maintenance.md`)
  - Add database backup procedures
  - Add performance monitoring
  - Add troubleshooting guide
  - Add optimization tips

- [ ] **Remove deprecated code**
  - Remove JSON file dependencies
  - Clean up unused utilities
  - Remove deprecated API endpoints
  - Update import statements

- [ ] **Update project documentation**
  - Update `README.md` with database information
  - Update `ARCHITECTURE.md` with database schema
  - Update `spec.md` with migration status
  - Update development setup instructions

- [ ] **Run all tests and verify** - All tests should pass

---

## Success Criteria Checklist

### Voting System
- [ ] Users can start voting sessions from leaderboard
- [ ] Voting slideshow displays fighter pairs with 30-second timer
- [ ] Votes are properly recorded and persisted
- [ ] Voting results are displayed in leaderboard
- [ ] All tests pass (TDD compliance)
- [ ] Mobile-responsive design
- [ ] Performance optimized for 100+ fighters

### Database Migration
- [ ] All existing functionality works with database
- [ ] Performance improved for leaderboard queries
- [ ] Data integrity maintained during migration
- [ ] Backward compatibility preserved
- [ ] All tests pass (TDD compliance)
- [ ] Database queries optimized with indexes
- [ ] Documentation updated

### Integration
- [ ] Voting system integrated with database
- [ ] Real-time voting statistics using database queries
- [ ] Improved performance for voting results display
- [ ] Seamless user experience during migration
- [ ] All features work together harmoniously

This todo list provides a comprehensive breakdown of all tasks required to implement both features while maintaining code quality and following TDD principles. 