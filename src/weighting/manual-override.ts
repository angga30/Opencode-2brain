/**
 * Manual Override System
 * Handles user-provided scoring and corrections
 */

import { ManualScore, Solution } from '../types';

export class ManualOverrideSystem {
  private manualScores: Map<string, ManualScore[]> = new Map();

  /**
   * Record manual score for a solution
   */
  recordManualScore(solutionId: string, score: ManualScore): void {
    const scores = this.manualScores.get(solutionId) || [];
    scores.push(score);
    this.manualScores.set(solutionId, scores);
  }

  /**
   * Get manual score for a solution
   */
  getManualScore(solutionId: string): ManualScore | undefined {
    const scores = this.manualScores.get(solutionId);
    return scores && scores.length > 0 ? scores[scores.length - 1] : undefined;
  }

  /**
   * Apply manual score to calculate final score
   * Formula: star rating (1-5) * 20 = final score (20-100)
   */
  applyManualScore(score: ManualScore): number {
    return score.score * 20;
  }

  /**
   * Check if manual override exists for solution
   */
  hasManualOverride(solutionId: string): boolean {
    return this.manualScores.has(solutionId);
  }

  /**
   * Get all manual scores for a solution
   */
  getManualScores(solutionId: string): ManualScore[] {
    return this.manualScores.get(solutionId) || [];
  }

  /**
   * Log disagreement between automatic and manual scores
   * Used to improve automatic detection
   */
  logDisagreement(
    solutionId: string,
    automaticScore: number,
    manualScore: number
  ): void {
    console.warn(`Score disagreement for ${solutionId}: automatic=${automaticScore}, manual=${manualScore}`);
    // This would be stored for analysis and improvement
  }
}
