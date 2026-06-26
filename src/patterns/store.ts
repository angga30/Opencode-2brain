/**
 * Pattern Store
 * Manages pattern database with filtering and retrieval
 */

import { LearningPattern, FailurePattern, Pattern } from '../types';
import { PatternScorer } from './scorer';

export class PatternStore {
  private patterns: Map<string, LearningPattern> = new Map();
  private failurePatterns: Map<string, FailurePattern> = new Map();
  private scorer: PatternScorer;

  constructor() {
    this.scorer = new PatternScorer();
  }

  addPattern(pattern: LearningPattern): void {
    this.patterns.set(pattern.id, pattern);
  }

  addPatterns(patterns: LearningPattern[]): void {
    for (const pattern of patterns) {
      this.addPattern(pattern);
    }
  }

  getPattern(patternId: string): LearningPattern | undefined {
    return this.patterns.get(patternId);
  }

  getAllPatterns(): LearningPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get patterns filtered by minimum confidence threshold
   * Default threshold: 30% (below this, patterns are hidden)
   */
  getPatternsByConfidence(minConfidence: number = 30): LearningPattern[] {
    return this.getAllPatterns()
      .filter(p => p.confidenceScore >= minConfidence)
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  getPatternsByCategory(category: string): LearningPattern[] {
    return this.getAllPatterns()
      .filter(p => p.problemType.includes(category))
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  getRecentPatterns(days: number = 7): LearningPattern[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.getAllPatterns()
      .filter(p => p.lastSuccessfulUse >= cutoff)
      .sort((a, b) => b.lastSuccessfulUse.getTime() - a.lastSuccessfulUse.getTime());
  }

  getFailingPatterns(): LearningPattern[] {
    return this.getAllPatterns()
      .filter(p => p.confidenceScore < 50)
      .sort((a, b) => a.confidenceScore - b.confidenceScore);
  }

  addFailurePattern(pattern: FailurePattern): void {
    this.failurePatterns.set(pattern.id, pattern);
  }

  getFailurePatterns(): FailurePattern[] {
    return Array.from(this.failurePatterns.values());
  }

  updatePatternScores(solutions: any[]): void {
    const patterns = this.getAllPatterns();
    const scored = this.scorer.scorePatterns(patterns, solutions);

    for (const pattern of scored) {
      this.patterns.set(pattern.id, pattern);
    }
  }

  clearOldPatterns(daysToKeep: number = 90): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    for (const [id, pattern] of this.patterns.entries()) {
      if (pattern.lastSuccessfulUse < cutoff) {
        this.patterns.delete(id);
      }
    }
  }

  export(): string {
    return JSON.stringify({
      patterns: this.getAllPatterns(),
      failurePatterns: this.getFailurePatterns()
    }, null, 2);
  }

  import(data: string): void {
    try {
      const parsed = JSON.parse(data);

      if (parsed.patterns) {
        for (const pattern of parsed.patterns) {
          this.addPattern(pattern);
        }
      }

      if (parsed.failurePatterns) {
        for (const pattern of parsed.failurePatterns) {
          this.addFailurePattern(pattern);
        }
      }
    } catch (error) {
      console.error('Failed to import pattern data:', error);
    }
  }
}