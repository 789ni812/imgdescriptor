# Optimized Game Variables & Flow Guide

## 🎮 **Core Game Variables (Optimized)**

### **Character Variables**
```typescript
character: {
  id: string
  name: string
  age: number
  traits: string[] // ['brave', 'curious', 'wise', etc.]
  moralAlignment: {
    score: number // -100 to +100
    level: 'evil' | 'neutral' | 'good'
    reputation: string // "A feared villain" | "An unknown adventurer" | "A respected hero"
    alignmentHistory: Array<{turn: number, score: number, change: number}>
  }
}
```

### **Game State Variables**
```typescript
currentTurn: number // 1, 2, 3, etc.
imageDescription: string // "A dark cave with ancient symbols"
generatedStory: string // The current story text
playerChoices: Choice[] // Available choices for this turn
choiceOutcomes: ChoiceOutcome[] // Results of previous choices
currentDifficulty: number // 1-10 (drives story complexity)
```

### **DM Variables**
```typescript
dmPersonality: {
  personality: {
    name: string // "Gandalf", "Mysterious DM", etc.
    style: string // "wise", "mysterious", "encouraging"
    description: string // DM personality description
  }
  notes: string // Additional DM preferences
}
currentMood: 'positive' | 'negative' | 'neutral'
previousAdaptations: DMAdaptation[] // DM's previous adjustments
```

### **Performance Variables (Simplified)**
```typescript
playerPerformance: {
  alignmentChange: number // How much alignment changed this turn
  choiceQuality: 'good' | 'neutral' | 'poor' // Based on alignment consistency
  engagementLevel: 'low' | 'medium' | 'high' // Simple engagement metric
}
```

---

## 🎯 **Game Flow & When Variables Are Used**

### **Step 1: Image Upload**
**Variables Used:**
- `imageDescription` ← Generated from uploaded image
- `currentTurn` ← Set to 1
- `currentDifficulty` ← Set to 5 (default)

**What Happens:**
1. User uploads image
2. AI analyzes image → `imageDescription`
3. Game initializes with `currentTurn = 1`, `currentDifficulty = 5`

### **Step 2: Story Generation**
**Variables Used:**
- `imageDescription`
- `character.moralAlignment` (score, level, reputation)
- `currentTurn`
- `character.traits`
- `dmPersonality`
- `currentDifficulty` ← Drives story complexity

**What Happens:**
1. System builds story prompt using character alignment data
2. AI generates `generatedStory` based on image + character context + difficulty
3. Story reflects character's moral standing and DM personality

### **Step 3: Choice Generation**
**Variables Used:**
- `generatedStory`
- `character` (full character data)
- `currentTurn`
- `dmPersonality`
- `currentDifficulty` ← Affects choice complexity
- `previousAdaptations` (if any)

**What Happens:**
1. System creates `playerChoices` based on story and difficulty
2. Choices reflect character's alignment and DM's style
3. Previous adaptations influence choice difficulty/theme

### **Step 4: Player Makes Choice**
**Variables Used:**
- `playerChoices`
- `character.moralAlignment`
- `currentTurn`

**What Happens:**
1. Player selects choice
2. System calculates `choiceOutcomes`
3. Updates `character.moralAlignment.score`
4. Records choice in `alignmentHistory`
5. Calculates `playerPerformance`

### **Step 5: DM Reflection**
**Variables Used:**
- **ALL** variables from above
- `playerPerformance` (calculated from this turn)

**What Happens:**
1. System calls `/api/dm-reflection` with complete game state
2. AI analyzes player's choice and performance
3. Returns:
   - `reflection`: DM's thoughts on player's choice
   - `adaptations`: How DM will adjust future turns
   - `difficultyAdjustment`: How to modify `currentDifficulty`

### **Step 6: Story Continues**
**Variables Used:**
- `generatedStory` (updated with choice outcome)
- `character.moralAlignment` (updated score)
- `currentTurn` (incremented)
- `currentDifficulty` (adjusted based on DM reflection)
- `dmPersonality` (potentially evolved)
- `previousAdaptations` (updated with new adaptations)

**What Happens:**
1. Story progresses based on player's choice
2. Character alignment updates
3. Difficulty adjusts based on performance
4. DM personality may evolve
5. Game prepares for next turn

---

## 📊 **Optimized Variable Impact Matrix**

| Variable | Affects Story | Affects Choices | Affects DM | Affects Difficulty |
|----------|---------------|-----------------|------------|-------------------|
| `moralAlignment.score` | ✅ | ✅ | ✅ | ✅ |
| `moralAlignment.level` | ✅ | ✅ | ✅ | ✅ |
| `moralAlignment.reputation` | ✅ | ✅ | ✅ | ❌ |
| `currentTurn` | ✅ | ✅ | ✅ | ✅ |
| `dmPersonality` | ✅ | ✅ | ✅ | ✅ |
| `currentMood` | ✅ | ✅ | ✅ | ✅ |
| `previousAdaptations` | ✅ | ✅ | ✅ | ✅ |
| `currentDifficulty` | ✅ | ✅ | ❌ | ❌ |
| `playerPerformance` | ❌ | ✅ | ✅ | ✅ |

---

## 🎯 **Key Variable Relationships**

### **Moral Alignment Impact**
- **High Score (+50 to +100)**: Stories favor heroic choices, easier good options
- **Neutral Score (-25 to +25)**: Balanced story options
- **Low Score (-100 to -50)**: Stories favor selfish choices, easier evil options

### **Difficulty Impact**
- **Low Difficulty (1-3)**: Simple choices, clear consequences
- **Medium Difficulty (4-7)**: Balanced complexity, some moral ambiguity
- **High Difficulty (8-10)**: Complex dilemmas, hidden consequences

### **DM Personality Impact**
- **Wise DM**: More philosophical choices, moral dilemmas
- **Mysterious DM**: More cryptic choices, hidden consequences
- **Encouraging DM**: Positive reinforcement, easier choices

### **Turn Progression Impact**
- **Early Turns (1-3)**: Introduction, basic choices
- **Middle Turns (4-7)**: Complex moral dilemmas, character development
- **Late Turns (8+)**: Climactic choices, major consequences

### **Performance Impact**
- **High Engagement**: DM increases difficulty, adds complexity
- **Low Engagement**: DM decreases difficulty, provides more guidance
- **Poor Choices**: DM adjusts difficulty down, provides hints
- **Good Choices**: DM increases challenge, adds complexity

---

## 🔧 **API Endpoints & Variable Usage**

### **POST /api/analyze-image**
**Input Variables:**
- `image` (file upload)

**Output Variables:**
- `imageDescription` (generated description)

### **POST /api/generate-story**
**Input Variables:**
- `description` (imageDescription)
- `prompt` (includes character alignment context)
- `difficulty` (currentDifficulty)

**Output Variables:**
- `generatedStory` (story text)

### **POST /api/generate-choices**
**Input Variables:**
- `story` (generatedStory)
- `character` (full character object)
- `turn` (currentTurn)
- `difficulty` (currentDifficulty)

**Output Variables:**
- `playerChoices` (array of choice objects)

### **POST /api/dm-reflection**
**Input Variables:**
- `character` (full character object)
- `currentTurn`
- `imageDescription`
- `generatedStory`
- `playerChoices`
- `choiceOutcomes`
- `dmPersonality`
- `currentMood`
- `previousAdaptations`
- `playerPerformance`
- `currentDifficulty`

**Output Variables:**
- `reflection` (DM's thoughts)
- `adaptations` (future adjustments)
- `difficultyAdjustment` (how to modify currentDifficulty)

---

## 📝 **Development Notes**

### **Variable Persistence**
- Character alignment persists across turns
- DM adaptations accumulate over time
- Difficulty adjusts based on player performance

### **Performance Calculation**
- `alignmentChange`: Difference from previous turn
- `choiceQuality`: Based on alignment consistency with character's current score
- `engagementLevel`: Simple assessment based on choice complexity and player behavior

### **DM Evolution**
- DM personality can evolve based on player performance
- Adaptations influence future story and choice generation
- Mood changes affect story tone and choice difficulty

---

## 🚀 **Future Enhancements**

### **Planned Variable Additions**
- `character.inventory` - Items and equipment
- `character.relationships` - NPC relationships
- `worldState` - Global world conditions

### **Advanced DM Features**
- `dmMemory` - Long-term player behavior patterns
- `dmGoals` - Story objectives and themes

## ✅ **Summary of Optimizations**

### **Removed Variables:**
- `moralAlignment.recentChoices` - Redundant with `choiceOutcomes`
- `playerPerformance.responseTime` - Hard to implement, not meaningful
- `playerPerformance.choiceConsistency` - Complex, replaced by `choiceQuality`
- `playerPerformance.difficultyRating` - Renamed to `currentDifficulty`

### **Simplified Variables:**
- `playerPerformance.storyEngagement` → `engagementLevel` (simpler scale)
- `playerPerformance.difficultyRating` → `currentDifficulty` (input, not output)

### **Benefits:**
- **Cleaner data model** - Less redundancy
- **Easier implementation** - Simpler calculations
- **Better performance** - Fewer variables to track
- **Clearer purpose** - Each variable has a distinct role

This optimized system maintains all the dynamic, adaptive gameplay while being more maintainable and easier to implement! 