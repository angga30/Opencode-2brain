/**
 * Pattern Detector
 * Identifies successful problem-solving patterns from solution history
 */

import { Solution, LearningPattern } from '../types';

interface PatternCandidate {
  problemType: string;
  successfulSkills: string[];
  successCount: number;
  totalCount: number;
  lastSuccessfulUse: Date;
  contextTags: string[];
  averageTimeToSolve: number;
}

export class PatternDetector {
  /**
   * Detect successful patterns from solution history
   */
  detectPatterns(solutions: Solution[]): LearningPattern[] {
    const patternMap = new Map<string, PatternCandidate>();

    for (const solution of solutions) {
      if (solution.result !== 'success') continue;

      const key = this.createPatternKey(solution.problemType, solution.skillsUsed);
      let candidate = patternMap.get(key);

      if (!candidate) {
        candidate = {
          problemType: solution.problemType,
          successfulSkills: [...solution.skillsUsed],
          successCount: 0,
          totalCount: 0,
          lastSuccessfulUse: solution.timestamp,
          contextTags: this.extractContextTags(solution),
          averageTimeToSolve: solution.executionTime
        };
        patternMap.set(key, candidate);
      }

      candidate.successCount++;
      candidate.totalCount++;
      candidate.lastSuccessfulUse = solution.timestamp;

      // Update average time
      const totalTime = candidate.averageTimeToSolve * (candidate.successCount - 1) + solution.executionTime;
      candidate.averageTimeToSolve = totalTime / candidate.successCount;
    }

    return this.convertToLearningPatterns(patternMap);
  }

  /**
   * Calculate pattern frequency for specific problem type and skills
   */
  calculatePatternFrequency(
    problemType: string,
    skills: string[],
    totalAttempts: number,
    successfulAttempts: number
  ): number {
    if (totalAttempts === 0) return 0;
    return successfulAttempts / totalAttempts;
  }

  /**
   * Detect failure patterns for avoidance learning
   */
  detectFailurePatterns(solutions: Solution[]): any[] {
    const failureMap = new Map<string, any>();

    for (const solution of solutions) {
      if (solution.result !== 'failure') continue;

      const key = solution.problemType;
      let failurePattern = failureMap.get(key);

      if (!failurePattern) {
        failurePattern = {
          problemType: key,
          failedApproaches: [],
          avoidanceScore: 0,
          lastFailure: solution.timestamp,
          commonFailureReasons: []
        };
        failureMap.set(key, failurePattern);
      }

      for (const skill of solution.skillsUsed) {
        if (!failurePattern.failedApproaches.includes(skill)) {
          failurePattern.failedApproaches.push(skill);
        }
      }

      failurePattern.lastFailure = solution.timestamp;
      failurePattern.avoidanceScore++;
    }

    return Array.from(failureMap.values());
  }

  private createPatternKey(problemType: string, skills: string[]): string {
    const sortedSkills = [...skills].sort().join(',');
    return `${problemType}:${sortedSkills}`;
  }

  private extractContextTags(solution: Solution): string[] {
    const tags: string[] = [];

    for (const [key, value] of Object.entries(solution.context)) {
      tags.push(`${key}:${value}`);
    }

    return tags;
  }

  private convertToLearningPatterns(candidates: Map<string, PatternCandidate>): LearningPattern[] {
    return Array.from(candidates.values()).map((candidate, index) => ({
      id: `pattern-${index}`,
      problemType: candidate.problemType,
      successfulSkills: candidate.successfulSkills,
      confidenceScore: 0, // Will be calculated by PatternScorer
      lastSuccessfulUse: candidate.lastSuccessfulUse,
      contextTags: candidate.contextTags,
      averageTimeToSolve: Math.round(candidate.averageTimeToSolve),
      difficultyRating: this.assessDifficulty(candidate)
    }));
  }

  private assessDifficulty(candidate: PatternCandidate): 'beginner' | 'intermediate' | 'advanced' {
    const successRate = candidate.successCount / candidate.totalCount;

    if (successRate >= 0.9 && candidate.averageTimeToSolve < 3000) {
      return 'beginner';
    } else if (successRate >= 0.7) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }
}