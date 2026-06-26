/**
 * Weight Calculator
 * Calculates adaptive skill weights with time-decay algorithms
 */

import { Skill } from '../types';

export class WeightCalculator {
  /**
   * Calculate base weight from success rate
   * Formula: (successCount / usageCount) * 100
   */
  calculateBaseWeight(skill: Skill): number {
    if (skill.usageCount === 0) {
      return 50; // Default weight for unused skills
    }

    const successRate = skill.successCount / skill.usageCount;
    return Math.round(successRate * 100);
  }

  /**
   * Calculate time-decay multiplier based on last usage
   * - Recent (0-7 days): 2.0x
   * - Moderate (8-30 days): 1.5x
   * - Historical (30+ days): 1.0x
   */
  calculateTimeDecay(lastUsed: Date): number {
    const now = new Date();
    const daysSinceUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUse <= 7) {
      return 2.0; // Recent successful usage
    } else if (daysSinceUse <= 30) {
      return 1.5; // Moderate recent usage
    } else {
      return 1.0; // Historical usage
    }
  }

  /**
   * Calculate final weight combining base weight and time-decay
   * Applies weight floor of 10 and cap of 100
   */
  calculateWeight(skill: Skill, recentFailure: boolean = false): number {
    const baseWeight = this.calculateBaseWeight(skill);
    const timeDecay = this.calculateTimeDecay(skill.lastUsed);

    let finalWeight = baseWeight * timeDecay;

    // Apply failure penalty if recent failure occurred
    if (recentFailure) {
      finalWeight *= 0.5;
    }

    // Enforce weight range constraints
    finalWeight = Math.max(10, Math.min(100, finalWeight));

    return Math.round(finalWeight);
  }

  /**
   * Batch calculate weights for multiple skills
   * Optimized for performance with large skill sets
   */
  calculateWeights(skills: Skill[]): Map<string, number> {
    const weights = new Map<string, number>();

    for (const skill of skills) {
      weights.set(skill.id, this.calculateWeight(skill));
    }

    return weights;
  }

  /**
   * Get weight trend (rising, stable, declining)
   */
  getWeightTrend(currentWeight: number, previousWeight: number): 'rising' | 'stable' | 'declining' {
    const threshold = 5; // 5% change threshold

    if (currentWeight > previousWeight * (1 + threshold / 100)) {
      return 'rising';
    } else if (currentWeight < previousWeight * (1 - threshold / 100)) {
      return 'declining';
    } else {
      return 'stable';
    }
  }
}