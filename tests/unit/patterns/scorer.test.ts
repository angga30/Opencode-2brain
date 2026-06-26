import { PatternScorer } from '../../../src/patterns/scorer';
import { LearningPattern, Solution } from '../../../src/types';

describe('PatternScorer', () => {
  let scorer: PatternScorer;

  beforeEach(() => {
    scorer = new PatternScorer();
  });

  describe('confidence calculation', () => {
    it('should calculate base confidence from success frequency', () => {
      const pattern: LearningPattern = {
        id: 'pattern-1',
        problemType: 'api-error',
        successfulSkills: ['retry-with-backoff'],
        confidenceScore: 0,
        lastSuccessfulUse: new Date(),
        contextTags: [],
        averageTimeToSolve: 2000,
        difficultyRating: 'intermediate'
      };

      const solutions: Solution[] = [
        {
          id: 's1',
          timestamp: new Date(),
          problemType: 'api-error',
          skillsUsed: ['retry-with-backoff'],
          context: { api: 'REST' },
          result: 'success',
          executionTime: 2000
        },
        {
          id: 's2',
          timestamp: new Date(),
          problemType: 'api-error',
          skillsUsed: ['different-approach'],
          context: { api: 'REST' },
          result: 'success',
          executionTime: 3000
        }
      ];

      const confidence = scorer.calculateConfidenceScore(pattern, solutions);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('recency boost', () => {
    it('should apply +10% boost for recent patterns', () => {
      const recentPattern: LearningPattern = {
        id: 'pattern-1',
        problemType: 'api-error',
        successfulSkills: ['retry'],
        confidenceScore: 0,
        lastSuccessfulUse: new Date(), // Today
        contextTags: [],
        averageTimeToSolve: 2000,
        difficultyRating: 'intermediate'
      };

      const confidence = scorer.calculateConfidenceScore(recentPattern, []);

      // Should include 10% recency boost
      expect(confidence).toBeGreaterThanOrEqual(10);
    });
  });

  describe('consistency bonus', () => {
    it('should apply +15% bonus for consistent patterns', () => {
      const consistentPattern: LearningPattern = {
        id: 'pattern-1',
        problemType: 'api-error',
        successfulSkills: ['retry'],
        confidenceScore: 0,
        lastSuccessfulUse: new Date(),
        contextTags: [],
        averageTimeToSolve: 2000, // Under 5 second threshold
        difficultyRating: 'intermediate'
      };

      const confidence = scorer.calculateConfidenceScore(consistentPattern, []);

      // Should include 15% consistency bonus
      expect(confidence).toBeGreaterThanOrEqual(15);
    });
  });
});