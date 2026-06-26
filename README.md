# Memory Growth Adaptive Learning Plugin

An Opencode plugin that monitors agent memory growth and implements adaptive learning through gradual skill weighting and pattern recognition.

## Features

- Track skill usage and maintain adaptive weight scores
- Identify successful learning patterns with confidence scoring
- Manual override capabilities for human oversight
- Time-decay algorithms prioritizing recent successful patterns
- Export/import learning state for backup and sharing

## Commands

- `/memory-status` - Quick health check of learning state
- `/memory-weights` - Display current skill weights with trends
- `/memory-patterns` - Show successful learning patterns
- `/memory-adjust-weight <skill> <value>` - Manual weight tuning
- `/memory-analyze` - Deep analytics and correlations
- `/memory-export` / `/memory-import` - Backup and restore learning state
- `/memory-reset` - Reset learning state

## Installation

```bash
npm install
npm run build
```

## Development

```bash
npm run dev    # Watch mode
npm test       # Run tests
npm run test:coverage  # Coverage report
```
