import { PatternDetector } from '../../../src/patterns/detector';
import { Solution, LearningPattern } from '../../../src/types';

describe('PatternDetector', () => {
  let detector: PatternDetector;

  beforeEach(() => {
    detector = new PatternDetector();
  });

  describe('pattern detection', () => {
    it('should identify successful patterns from solutions', () => {
      const solutions: Solution[] = [
        {
          id: 's1',
          timestamp: new Date(),
          problemType: 'api-error',
          skillsUsed: ['retry-with-backoff', 'error-handling'],
          context: { api: 'REST' },
          result: 'success',
          executionTime: 2000
        },
        {
          id: 's2',
          timestamp: new Date(),
          problemType: 'api-error',
          skillsUsed: ['retry-with-backoff', 'error-handling'],
          context: { api: 'GraphQL' },
          result: 'success',
          executionTime: 2500
        }
      ];

      const patterns = detector.detectPatterns(solutions);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].problemType).toBe('api-error');
      expect(patterns[0].successfulSkills).toContain('retry-with-backoff');
    });
  });

  describe('pattern analysis', () => {
    it('should calculate pattern frequency', () => {
      const frequency = detector.calculatePatternFrequency('api-error', ['retry-with-backoff'], 10, 8);

      expect(frequency).toBe(0.8); // 8 successes out of 10 attempts
    });
  });
});