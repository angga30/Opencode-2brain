/**
 * Success Detector
 * Automatic success detection from build and test results
 */

import { AutomaticMetrics } from '../types';

export class SuccessDetector {
  /**
   * Detect automatic success from execution metrics
   */
  detectSuccess(metrics: AutomaticMetrics): boolean {
    // All three must be true for full success
    return metrics.compiles && metrics.testsPass && metrics.executionSuccess;
  }

  /**
   * Detect partial success (some aspects succeeded)
   */
  detectPartialSuccess(metrics: AutomaticMetrics): boolean {
    const trueCount = [
      metrics.compiles,
      metrics.testsPass,
      metrics.executionSuccess
    ].filter(Boolean).length;

    return trueCount >= 2; // At least 2 out of 3 succeeded
  }

  /**
   * Calculate automatic success score (0-100)
   * Formula: compiles (25) + testsPass (35) + executionSuccess (40)
   */
  calculateAutomaticScore(metrics: AutomaticMetrics): number {
    let score = 0;

    if (metrics.compiles) score += 25;
    if (metrics.testsPass) score += 35;
    if (metrics.executionSuccess) score += 40;

    return score;
  }

  /**
   * Extract metrics from execution result
   * This would integrate with build tools and test frameworks
   */
  extractMetrics(executionResult: any): AutomaticMetrics {
    return {
      compiles: executionResult.compileSuccess || false,
      testsPass: executionResult.testResults?.passed === executionResult.testResults?.total,
      executionSuccess: executionResult.exitCode === 0,
      buildTime: executionResult.buildTime,
      testCoverage: executionResult.testResults?.coverage
    };
  }
}
