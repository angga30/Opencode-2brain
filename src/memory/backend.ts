/**
 * Memory Abstraction Layer
 * Clean interface between adaptive learning logic and memory backends
 */

import { Solution, UsageStats, WeightEntry, Pattern, Skill } from '../types';

/**
 * Abstract interface for memory backend operations
 * Enables switching between different memory storage systems
 */
export abstract class MemoryBackend {
  abstract captureSolution(solution: Solution): Promise<string>;
  abstract getSkillUsage(skillId: string): Promise<UsageStats>;
  abstract updateWeights(updates: WeightEntry[]): Promise<void>;
  abstract getLearningPatterns(patternType?: string): Promise<Pattern[]>;
  abstract getAllSkills(): Promise<Skill[]>;
  abstract updateSkill(skill: Skill): Promise<void>;
  abstract isConnected(): boolean;
  abstract queueUpdate(operation: string, data: unknown): Promise<void>;
}