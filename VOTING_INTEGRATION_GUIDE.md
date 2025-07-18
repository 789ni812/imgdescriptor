# Voting Integration Guide for LLM Systems

This guide explains how LLM systems can access and utilize voting data to enhance fighter analysis, commentary generation, and overall game experience.

## Overview

The voting system now integrates voting data directly into fighter files and provides API endpoints for LLM systems to access:
- **Popularity scores** and voting statistics
- **Voting history** and trends
- **Crowd favorites** and trending fighters
- **Enhanced fighter data** for commentary generation

## Data Structure

### Enhanced Fighter Data

Fighter JSON files now include a `votingData` field with comprehensive voting statistics:

```typescript
interface FighterVotingData {
  totalVotes: number;           // Total votes received across all sessions
  totalWins: number;           // Number of voting rounds won
  totalLosses: number;         // Number of voting rounds lost
  winRate: number;             // Win rate (0.0 to 1.0)
  popularityScore: number;     // Calculated popularity (0.0 to 1.0)
  votingHistory: Array<{       // Detailed voting history
    sessionId: string;
    roundNumber: number;
    voteCount: number;
    totalVotesInRound: number;
    percentage: number;
    won: boolean;
    date: string;
  }>;
  recentVotingTrend: 'rising' | 'falling' | 'stable';
  crowdFavorite: boolean;      // High popularity threshold (>0.7)
}
```

### Popularity Score Calculation

The popularity score is calculated using a weighted formula:
- **Vote Score (40%)**: Normalized total votes (capped at 100 votes)
- **Win Rate (30%)**: Success rate in voting rounds
- **Consistency Bonus (20%)**: Bonus for participating in multiple rounds
- **Recent Performance (10%)**: Average performance in last 3 rounds

## API Endpoints

### 1. Get All Fighters with Voting Data

**Endpoint**: `GET /api/fighting-game/voting/integration?action=all-fighters`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "fighter-1",
      "name": "Norman Bates",
      "image": "psycho.jpg",
      "stats": { /* fighter stats */ },
      "votingData": {
        "totalVotes": 45,
        "totalWins": 2,
        "totalLosses": 0,
        "winRate": 1.0,
        "popularityScore": 0.85,
        "crowdFavorite": true,
        "recentVotingTrend": "rising",
        "votingHistory": [ /* detailed history */ ]
      }
    }
  ],
  "count": 4
}
```

### 2. Get Specific Fighter Voting Stats

**Endpoint**: `GET /api/fighting-game/voting/integration?action=fighter-stats&fighterId=fighter-1`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalVotes": 45,
    "totalWins": 2,
    "totalLosses": 0,
    "winRate": 1.0,
    "popularityScore": 0.85,
    "crowdFavorite": true,
    "recentVotingTrend": "rising",
    "votingHistory": [ /* detailed history */ ]
  }
}
```

### 3. Get Crowd Favorites

**Endpoint**: `GET /api/fighting-game/voting/integration?action=crowd-favorites`

**Response**: Returns fighters with `popularityScore > 0.7`

### 4. Get Trending Fighters

**Endpoint**: `GET /api/fighting-game/voting/integration?action=trending`

**Response**: Returns fighters with `recentVotingTrend: 'rising'`

## Integration Examples

### 1. Enhanced Fighter Commentary

```typescript
// Get fighter voting data for commentary
const response = await fetch('/api/fighting-game/voting/integration?action=fighter-stats&fighterId=fighter-1');
const { data: votingData } = await response.json();

// Generate enhanced commentary
let commentary = `Fighter ${fighter.name} enters the arena`;
if (votingData.crowdFavorite) {
  commentary += ` as a crowd favorite with ${votingData.totalVotes} total votes`;
}
if (votingData.recentVotingTrend === 'rising') {
  commentary += ` and their popularity is on the rise`;
}
commentary += `!`;
```

### 2. Tournament Seeding Based on Popularity

```typescript
// Get all fighters sorted by popularity
const response = await fetch('/api/fighting-game/voting/integration?action=all-fighters');
const { data: fighters } = await response.json();

// Seed tournament based on popularity
const seededFighters = fighters
  .filter(f => f.votingData?.totalVotes > 0)
  .sort((a, b) => (b.votingData?.popularityScore || 0) - (a.votingData?.popularityScore || 0));
```

### 3. Dynamic Match Commentary

```typescript
// Compare two fighters' voting data
const fighter1Data = await getFighterVotingStats('fighter-1');
const fighter2Data = await getFighterVotingStats('fighter-2');

let commentary = '';
if (fighter1Data.crowdFavorite && fighter2Data.crowdFavorite) {
  commentary = "This is a clash of crowd favorites!";
} else if (fighter1Data.recentVotingTrend === 'rising' && fighter2Data.recentVotingTrend === 'falling') {
  commentary = "A rising star faces a fighter whose popularity is declining";
}
```

### 4. Voting History Analysis

```typescript
// Analyze voting patterns
const votingData = await getFighterVotingStats('fighter-1');
const recentRounds = votingData.votingHistory.slice(-3);
const averageVotePercentage = recentRounds.reduce((sum, round) => sum + round.percentage, 0) / recentRounds.length;

if (averageVotePercentage > 70) {
  commentary = "This fighter has been dominating the polls recently";
}
```

## Automatic Integration

Voting data is automatically integrated into fighter files when:
1. A voting session is completed
2. All rounds have been voted on
3. The session status changes to 'completed'

The integration process:
1. Calculates voting statistics for each fighter
2. Updates fighter JSON files with `votingData` field
3. Maintains voting history for trend analysis
4. Updates popularity scores and crowd favorite status

## Usage in LLM Prompts

### Example Prompt Enhancement

```typescript
// Before: Basic fighter data
const fighterPrompt = `Fighter: ${fighter.name}, Stats: ${JSON.stringify(fighter.stats)}`;

// After: Enhanced with voting data
const enhancedPrompt = `
Fighter: ${fighter.name}
Stats: ${JSON.stringify(fighter.stats)}
Voting Data:
- Total Votes: ${fighter.votingData?.totalVotes || 0}
- Win Rate: ${fighter.votingData?.winRate || 0}
- Popularity Score: ${fighter.votingData?.popularityScore || 0}
- Crowd Favorite: ${fighter.votingData?.crowdFavorite ? 'Yes' : 'No'}
- Recent Trend: ${fighter.votingData?.recentVotingTrend || 'No data'}
- Voting History: ${JSON.stringify(fighter.votingData?.votingHistory || [])}
`;
```

### Commentary Generation

```typescript
// Generate dynamic commentary based on voting data
function generateVotingCommentary(fighter) {
  const voting = fighter.votingData;
  if (!voting) return "A mysterious fighter with no voting history";
  
  let commentary = "";
  
  if (voting.crowdFavorite) {
    commentary += "The crowd's favorite fighter, ";
  }
  
  if (voting.recentVotingTrend === 'rising') {
    commentary += "whose popularity is soaring, ";
  } else if (voting.recentVotingTrend === 'falling') {
    commentary += "whose star seems to be fading, ";
  }
  
  commentary += `with ${voting.totalVotes} total votes and a ${(voting.winRate * 100).toFixed(0)}% win rate in voting rounds.`;
  
  return commentary;
}
```

## Best Practices

1. **Check for Data Availability**: Always verify `votingData` exists before using it
2. **Handle Missing Data**: Provide fallbacks for fighters without voting history
3. **Use Trending Data**: Incorporate `recentVotingTrend` for dynamic commentary
4. **Respect Crowd Favorites**: Give special attention to fighters with `crowdFavorite: true`
5. **Analyze Patterns**: Use `votingHistory` for detailed trend analysis

## Error Handling

```typescript
try {
  const response = await fetch('/api/fighting-game/voting/integration?action=fighter-stats&fighterId=fighter-1');
  const data = await response.json();
  
  if (!data.success) {
    console.warn('Voting data not available:', data.error);
    return null;
  }
  
  return data.data;
} catch (error) {
  console.error('Failed to fetch voting data:', error);
  return null;
}
```

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live voting data
- **Advanced Analytics**: Machine learning-based popularity predictions
- **Cross-Session Analysis**: Long-term voting pattern analysis
- **Social Features**: Voting-based matchmaking and rivalries

This integration ensures that LLM systems have access to rich, contextual voting data to create more engaging and dynamic content for your fighting game. 