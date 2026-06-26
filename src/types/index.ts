/**
 * Core type definitions for Memory Growth Plugin
 */

/**
 * Represents a trackable skill with usage statistics and adaptive weight
 */
export interface Skill {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  typicalUseCases: string[];
  prerequisites: string[];
  alternatives: string[];
  currentWeight: number;  // 1-100
  usageCount: number;
  successCount: number;
  lastUsed: Date;
}

/**
 * Represents an agent solution with execution context and results
 */
export interface Solution {
  id: string;
  timestamp: Date;
  problemType: string;
  skillsUsed: string[];
  context: Record<string, unknown>;
  result: 'success' | 'failure' | 'partial';
  executionTime: number;
  automaticScore?: number;  // 0-100 from automatic detection
  manualScore?: number;     // 0-100 from manual override
}

/**
 * Usage statistics for a specific skill
 */
export interface UsageStats {
  skillId: string;
  usageCount: number;
  successCount: number;
  successRate: number;
  lastUsed: Date;
  averageTimeToSuccess: number;
}

/**
 * Weight update entry for tracking changes
 */
export interface WeightEntry {
  skillId: string;
  previousWeight: number;
  newWeight: number;
  timestamp: Date;
  reason: string;
  automatic?: boolean;
}

/**
 * Learning pattern identified from successful solutions
 */
export interface LearningPattern {
  id: string;
  problemType: string;
  successfulSkills: string[];
  confidenceScore: number;  // 0-100
  lastSuccessfulUse: Date;
  contextTags: string[];
  averageTimeToSolve: number;
  difficultyRating: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Failure pattern for avoidance learning
 */
export interface FailurePattern {
  id: string;
  problemType: string;
  failedApproaches: string[];
  avoidanceScore: number;
  lastFailure: Date;
  commonFailureReasons: string[];
}

/**
 * Pattern database entry
 */
export interface Pattern {
  id: string;
  problemType: string;
  successfulSkills: string[];
  confidenceScore: number;
  lastSuccessfulUse: Date;
  contextTags: string[];
}

/**
 * Automatic success detection metrics
 */
export interface AutomaticMetrics {
  compiles: boolean;
  testsPass: boolean;
  executionSuccess: boolean;
  buildTime?: number;
  testCoverage?: number;
}

/**
 * Manual scoring from user oversight
 */
export interface ManualScore {
  score: number;  // 1-5 stars
  userId: string;
  timestamp: Date;
  reason?: string;
}

/**
 * Combined success score calculation
 */
export interface SuccessScore {
  finalScore: number;  // 0-100
  automaticScore: number;
  manualScore?: number;
  calculationMethod: 'automatic' | 'manual' | 'hybrid';
  timestamp: Date;
}

/**
 * Memory backend interface for abstraction layer
 */
export interface MemoryBackend {
  captureSolution(solution: Solution): Promise<string>;
  getSkillUsage(skillId: string): Promise<UsageStats>;
  updateWeights(updates: WeightEntry[]): Promise<void>;
  getLearningPatterns(patternType?: string): Promise<Pattern[]>;
  getAllSkills(): Promise<Skill[]>;
  updateSkill(skill: Skill): Promise<void>;
}

/**
 * Skill library configuration
 */
export interface SkillConfig {
  id: string;
  name: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  typicalUseCases: string[];
  prerequisites: string[];
  alternatives: string[];
  initialWeight: number;
}