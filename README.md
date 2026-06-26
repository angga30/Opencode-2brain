# Memory Growth Adaptive Learning Plugin

An Opencode plugin that monitors agent memory growth and implements adaptive learning through gradual skill weighting and pattern recognition. Integrates with [agentmemory.dev](https://www.agent-memory.dev/) for persistent memory storage.

## Overview

This plugin tracks an agent's learning progress by monitoring which skills are used, how successfully they're applied, and what patterns emerge from solving problems. It implements adaptive weight adjustment that prioritizes recent successful patterns while maintaining long-term learning trends.

## Key Features

### 🎯 **Skill Tracking**
- Track skill usage frequency and success rates
- Dynamic weight calculation (1-100 scale)
- Time-decay algorithms prioritizing recent patterns
- Category-based organization (beginner/intermediate/advanced)

### 🧠 **Pattern Recognition**
- Identify successful problem-solving patterns
- Confidence scoring for pattern reliability
- Automatic detection of learning trends
- Failure pattern analysis for improvement areas

### ⚖️ **Adaptive Weighting**
- Hybrid scoring: automatic metrics + manual override
- Time-decay bands:
  - **2.0x** for 0-7 days (recent patterns)
  - **1.5x** for 8-30 days (moderate recency)
  - **1.0x** for 30+ days (historical data)
- Minimum weight floor of 10 for active skills
- Success rate calculation: `(successCount / usageCount) * 100`

### 💾 **Memory Management**
- Integration with agentmemory.dev MCP server
- Graceful degradation with local queue when offline
- Export/import learning state for backup
- Soft/hard reset options

### 📊 **Analytics & Insights**
- Real-time learning velocity tracking
- Skill correlation analysis
- Pattern confidence trends
- Actionable recommendations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Command Interface Layer                  │
│  /memory-status, /memory-weights, /memory-patterns, etc.    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                   Adaptive Weighting Layer                  │
│  Time-decay calculation, hybrid scoring, weight adjustment   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                  Pattern Recognition Layer                  │
│  Pattern detection, confidence scoring, trend analysis      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                     Skill Tracking Layer                    │
│  Skill library, usage tracking, weight calculation          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                   Memory Abstraction Layer                  │
│  MCP client, agentmemory adapter, graceful degradation      │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd memory-growth-plugin

# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test
```

## Configuration

Create a `src/config/skills.json` file to define your skill library:

```json
{
  "skills": [
    {
      "id": "error-handling",
      "name": "Error Handling",
      "category": "resilience",
      "difficulty": "intermediate",
      "currentWeight": 50,
      "usageCount": 0,
      "successCount": 0
    },
    {
      "id": "api-integration",
      "name": "API Integration",
      "category": "networking",
      "difficulty": "advanced",
      "currentWeight": 50,
      "usageCount": 0,
      "successCount": 0
    }
  ]
}
```

## Commands

### `/memory-status`
Quick health check of learning state.

**Output:**
```
📊 Memory Status
├─ Skills Tracked: 12
├─ Active Patterns: 5
├─ Recent Success Rate: 85%
├─ Learning Velocity: +3 skills/week
└─ Top Skills: error-handling (92), api-integration (88)
```

### `/memory-weights`
Display current skill weights with trends.

**Options:**
- `--category <name>` - Filter by category
- `--sort <field>` - Sort by weight/usage/success

**Output:**
```
⚖️  Skill Weights
├─ error-handling: 92 (↑5) - 95% success
├─ api-integration: 88 (↑2) - 88% success
└─ database-queries: 45 (↓3) - 60% success
```

### `/memory-patterns`
Show successful learning patterns.

**Options:**
- `--confidence <min>` - Minimum confidence score (default: 30)
- `--recent <days>` - Patterns from recent days (default: 7)

**Output:**
```
🧠 Learning Patterns
├─ api-error → error-handling + retry-logic (92% confidence)
├─ performance-issue → optimization + profiling (78% confidence)
└─ data-validation → schema-check + sanitization (85% confidence)
```

### `/memory-adjust-weight <skill> <value>`
Manual weight tuning for skills.

**Example:**
```bash
/memory-adjust-weight error-handling 95
```

### `/memory-analyze`
Deep analytics and correlations.

**Options:**
- `--category <name>` - Analyze specific category

**Output:**
```
📊 Learning Analytics

**Skill Correlations:**
├─ High-weight skills: 4
├─ Low-weight skills: 3
├─ Average success rate: 82%
└─ Learning velocity: +3 skills/week

**Pattern Analysis:**
├─ High-confidence patterns: 5
├─ Average pattern confidence: 76%
└─ Most common problem type: api-error

**Recommendations:**
├─ Consider using underutilized high-weight skills: caching, retry-logic
└─ Leverage 5 high-confidence patterns for common problems
```

### `/memory-export [filename]`
Export learning state as JSON.

**Example:**
```bash
/memory-export backup-2024-06-26.json
```

**Output format:**
```json
{
  "version": "1.0",
  "exportDate": "2024-06-26T10:00:00Z",
  "skills": [...],
  "patterns": [...]
}
```

### `/memory-import <filename>`
Import learning state from JSON.

**Example:**
```bash
/memory-import backup-2024-06-26.json
```

### `/memory-reset <mode> --confirm`
Reset learning state with safety confirmations.

**Modes:**
- `soft` - Reset weights only (default)
- `hard` - Reset all learning data

**Example:**
```bash
/memory-reset soft --confirm
```

## API Usage

### Initialization

```typescript
import { initialize } from 'memory-growth-plugin';

await initialize();
```

### Capturing Solutions

```typescript
import { AgentMemoryAdapter } from 'memory-growth-plugin';

const memoryBackend = new AgentMemoryAdapter('http://localhost:3111');

await memoryBackend.captureSolution({
  id: 'solution-1',
  timestamp: new Date(),
  problemType: 'api-error',
  skillsUsed: ['error-handling', 'retry-logic'],
  context: { api: 'REST' },
  result: 'success',
  executionTime: 2000
});
```

### Tracking Skill Usage

```typescript
import { SkillLibrary } from 'memory-growth-plugin';

const skillLibrary = new SkillLibrary();
await skillLibrary.loadFromConfig('src/config/skills.json');

// Update skill usage
skillLibrary.updateUsage('error-handling', true); // success
```

### Pattern Detection

```typescript
import { PatternDetector, PatternStore } from 'memory-growth-plugin';

const detector = new PatternDetector();
const store = new PatternStore();

const solutions = await memoryBackend.getSolutions();
const patterns = detector.detectPatterns(solutions);

store.addPatterns(patterns);
store.updatePatternScores(solutions);

const highConfidencePatterns = store.getPatternsByConfidence(70);
```

## Development

### Scripts

```bash
npm run dev          # Watch mode for development
npm test            # Run all tests
npm run test:watch  # Watch mode for tests
npm run test:coverage  # Generate coverage report
npm run build       # Compile TypeScript
```

### Testing

The plugin uses Jest for testing with 80%+ coverage target.

```bash
# Run all tests
npm test

# Run specific test file
npm test -- pattern-detector.test.ts

# Generate coverage report
npm run test:coverage
```

### Project Structure

```
memory-growth-plugin/
├── src/
│   ├── commands/         # CLI command implementations
│   ├── memory/          # Memory abstraction layer
│   ├── patterns/        # Pattern recognition
│   ├── skills/          # Skill tracking & weighting
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Plugin entry point
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── src/config/
│   └── skills.json      # Skill library configuration
└── docs/
    └── superpowers/
        └── specs/       # Design specifications
```

## Graceful Degradation

When agentmemory.dev is unavailable, the plugin:

1. Queues operations locally
2. Returns queued solution IDs
3. Maintains in-memory cache
4. Syncs when connection restored

```typescript
// Solution captured while offline
const solutionId = await memoryBackend.captureSolution(solution);
// Returns: "queued-solution-1"

// Later sync when online
await memoryBackend.syncQueue();
```

## Time-Decay Algorithm

Weight calculation uses multi-tier time decay:

```typescript
baseWeight = (successCount / usageCount) * 100
timeDecayMultiplier = {
  "0-7 days": 2.0,
  "8-30 days": 1.5,
  "30+ days": 1.0
}
finalWeight = baseWeight * timeDecayMultiplier
```

**Example:**
- Skill: 80% success rate (80 base weight)
- Last used: 3 days ago
- Final weight: 80 × 2.0 = **160** (capped at 100)

## Pattern Confidence Scoring

Pattern confidence combines:

1. **Success rate** (70% weight): How often pattern leads to success
2. **Frequency** (20% weight): How commonly pattern occurs
3. **Recency** (10% weight): How recently pattern was used

```typescript
confidence = (successRate * 0.7) + (frequency * 0.2) + (recency * 0.1)
```

Patterns below 30% confidence are hidden from standard views.

## Export/Import Format

```json
{
  "version": "1.0",
  "exportDate": "2024-06-26T10:00:00Z",
  "skills": [
    {
      "id": "error-handling",
      "name": "Error Handling",
      "category": "resilience",
      "difficulty": "intermediate",
      "currentWeight": 92,
      "usageCount": 25,
      "successCount": 23,
      "lastUsed": "2024-06-26T08:00:00Z"
    }
  ],
  "patterns": [
    {
      "problemType": "api-error",
      "skillsUsed": ["error-handling", "retry-logic"],
      "successCount": 18,
      "failureCount": 2,
      "confidenceScore": 92,
      "lastOccurrence": "2024-06-26T08:00:00Z"
    }
  ]
}
```

## License

MIT

## Contributing

Contributions welcome! Please:

1. Write tests for new features
2. Maintain 80%+ test coverage
3. Follow existing code patterns
4. Update documentation

## Support

For issues and questions, please use the repository's issue tracker.
