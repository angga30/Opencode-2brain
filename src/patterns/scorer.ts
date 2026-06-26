/**
 * Pattern Scorer
 * Calculates confidence scores for learning patterns
 */

import { LearningPattern, Solution } from '../types';

export class PatternScorer {
  /**
   * Calculate confidence score for a pattern
   * Formula: base confidence + recency boost + consistency bonus + context match
   */
  calculateConfidenceScore(
    pattern: LearningPattern,
    allSolutions: Solution[]
  ): number {
    let confidence = this.calculateBaseConfidence(pattern, allSolutions);

    confidence += this.calculateRecencyBoost(pattern);
    confidence += this.calculateConsistencyBonus(pattern);

    // Cap at 100
    return Math.min(100, Math.round(confidence));
  }

  /**
   * Calculate base confidence from success frequency
   */
  private calculateBaseConfidence(pattern: LearningPattern, solutions: Solution[]): number {
    const relevantSolutions = solutions.filter(s =>
      s.problemType === pattern.problemType &&
      s.result === 'success'
    );

    if (relevantSolutions.length === 0) return 0;

    const matchingSolutions = relevantSolutions.filter(s =>
      pattern.successfulSkills.every(skill => s.skillsUsed.includes(skill))
    );

    return (matchingSolutions.length / relevantSolutions.length) * 100;
  }

  /**
   * Calculate recency boost: +10% for patterns used successfully in last 7 days
   */
  private calculateRecencyBoost(pattern: LearningPattern): number {
    const now = new Date();
    const daysSinceLastUse = Math.floor(
      (now.getTime() - pattern.lastSuccessfulUse.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastUse <= 7 ? 10 : 0;
  }

  /**
   * Calculate consistency bonus: +15% for patterns with >80% success rate
   */
  private calculateConsistencyBonus(pattern: LearningPattern): number {
    // This would be calculated from historical success rate
    // For now, assume high consistency if average time to solve is reasonable
    const reasonableTimeThreshold = 5000; // 5 seconds

    if (pattern.averageTimeToSolve <= reasonableTimeThreshold) {
      return 15;
    }

    return 0;
  }

  /**
   * Batch score patterns for efficiency
   */
  scorePatterns(patterns: LearningPattern[], solutions: Solution[]): LearningPattern[] {
    return patterns.map(pattern => ({
      ...pattern,
      confidenceScore: this.calculateConfidenceScore(pattern, solutions)
    }));
  }
}