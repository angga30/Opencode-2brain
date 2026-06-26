/**
 * /memory-patterns Command
 * Show successful learning patterns and when to use them
 */

import { PatternStore } from '../patterns/store';

export interface PatternOptions {
  category?: string;
  recent?: boolean;
  failing?: boolean;
}

export class PatternsCommand {
  private patternStore: PatternStore;

  constructor(patternStore: PatternStore) {
    this.patternStore = patternStore;
  }

  async execute(options: PatternOptions = {}): Promise<string> {
    let patterns = this.patternStore.getAllPatterns();

    // Apply filters
    if (options.category) {
      patterns = this.patternStore.getPatternsByCategory(options.category);
    } else if (options.recent) {
      patterns = this.patternStore.getRecentPatterns(7);
    } else if (options.failing) {
      patterns = this.patternStore.getFailingPatterns();
    } else {
      patterns = this.patternStore.getPatternsByConfidence(30);
    }

    return this.formatPatterns(patterns);
  }

  private formatPatterns(patterns: any[]): string {
    if (patterns.length === 0) {
      return 'No patterns found matching criteria.';
    }

    const lines = patterns.map(pattern => {
      return `├─ ${pattern.problemType} → ${pattern.successfulSkills.join(' + ')} (${pattern.confidenceScore}% confidence)`;
    });

    return `Successful Patterns\n${lines.join('\n')}`;
  }
}
