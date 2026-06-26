/**
 * Weight Controller
 * Orchestrates weight updates with hybrid scoring
 */

import { Solution, AutomaticMetrics, ManualScore, SuccessScore, WeightEntry } from '../types';
import { SuccessDetector } from './success-detector';
import { ManualOverrideSystem } from './manual-override';
import { WeightCalculator } from '../skills/calculator';

export class WeightController {
  private successDetector: SuccessDetector;
  private manualOverride: ManualOverrideSystem;
  private weightCalculator: WeightCalculator;

  constructor() {
    this.successDetector = new SuccessDetector();
    this.manualOverride = new ManualOverrideSystem();
    this.weightCalculator = new WeightCalculator();
  }

  /**
   * Calculate automatic success score from metrics
   */
  calculateAutomaticScore(metrics: AutomaticMetrics): number {
    return this.successDetector.calculateAutomaticScore(metrics);
  }

  /**
   * Apply manual override score
   */
  applyManualScore(score: ManualScore): number {
    return this.manualOverride.applyManualScore(score);
  }

  /**
   * Calculate final score combining automatic and manual
   * Manual takes precedence if provided
   */
  calculateFinalScore(
    automaticScore: number,
    manualScore?: ManualScore
  ): number {
    if (manualScore) {
      return this.applyManualScore(manualScore);
    }
    return automaticScore;
  }

  /**
   * Process solution and calculate weight updates
   */
  async processSolution(
    solution: Solution,
    metrics: AutomaticMetrics,
    manualScore?: ManualScore
  ): Promise<WeightEntry[]> {
    const updates: WeightEntry[] = [];

    // Calculate success score
    const automaticScore = this.calculateAutomaticScore(metrics);
    const finalScore = this.calculateFinalScore(automaticScore, manualScore);

    // Determine if successful
    const isSuccess = finalScore >= 70; // 70% threshold for success

    // Update weights for each skill used
    for (const skillId of solution.skillsUsed) {
      const update: WeightEntry = {
        skillId,
        previousWeight: 50, // Would fetch from skill library
        newWeight: this.calculateNewWeight(skillId, isSuccess, solution),
        timestamp: new Date(),
        reason: manualScore ? 'manual-override' : 'automatic',
        automatic: !manualScore
      };
      updates.push(update);
    }

    return updates;
  }

  /**
   * Calculate new weight for a skill based on success
   */
  private calculateNewWeight(
    skillId: string,
    success: boolean,
    solution: Solution
  ): number {
    // This would integrate with the skill library and weight calculator
    // For now, return a simple calculation
    if (success) {
      return 75; // Increased weight for success
    } else {
      return 25; // Decreased weight for failure
    }
  }

  /**
   * Record manual score for a solution
   */
  recordManualScore(solutionId: string, score: ManualScore): void {
    this.manualOverride.recordManualScore(solutionId, score);
  }

  /**
   * Check if solution has manual override
   */
  hasManualOverride(solutionId: string): boolean {
    return this.manualOverride.hasManualOverride(solutionId);
  }
}
