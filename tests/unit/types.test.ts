import { Skill, Solution, Pattern, UsageStats, WeightEntry, LearningPattern, FailurePattern } from '../../src/types';

describe('Type Definitions', () => {
  describe('Skill', () => {
    it('should create valid skill object', () => {
      const skill: Skill = {
        id: 'test-skill',
        name: 'Test Skill',
        category: 'testing',
        difficulty: 'intermediate',
        typicalUseCases: ['unit testing'],
        prerequisites: [],
        alternatives: [],
        currentWeight: 75,
        usageCount: 10,
        successCount: 8,
        lastUsed: new Date()
      };

      expect(skill.id).toBe('test-skill');
      expect(skill.currentWeight).toBeGreaterThanOrEqual(1);
      expect(skill.currentWeight).toBeLessThanOrEqual(100);
    });

    it('should enforce difficulty enum values', () => {
      const validDifficulties: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
      expect(validDifficulties).toContain('intermediate');
    });
  });

  describe('Solution', () => {
    it('should create valid solution object', () => {
      const solution: Solution = {
        id: 'solution-1',
        timestamp: new Date(),
        problemType: 'bug-fix',
        skillsUsed: ['debugging', 'testing'],
        context: { language: 'typescript', framework: 'jest' },
        result: 'success',
        executionTime: 1500
      };

      expect(solution.skillsUsed).toContain('debugging');
      expect(solution.result).toBe('success');
    });
  });

  describe('LearningPattern', () => {
    it('should create valid learning pattern', () => {
      const pattern: LearningPattern = {
        id: 'pattern-1',
        problemType: 'api-error',
        successfulSkills: ['retry-with-backoff', 'error-handling'],
        confidenceScore: 94,
        lastSuccessfulUse: new Date(),
        contextTags: ['rest-api', 'network-errors'],
        averageTimeToSolve: 2000,
        difficultyRating: 'intermediate'
      };

      expect(pattern.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(pattern.confidenceScore).toBeLessThanOrEqual(100);
    });
  });
});