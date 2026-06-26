import { WeightController } from '../../../src/weighting/controller';
import { Solution, AutomaticMetrics, ManualScore } from '../../../src/types';

describe('WeightController', () => {
  let controller: WeightController;

  beforeEach(() => {
    controller = new WeightController();
  });

  describe('automatic success detection', () => {
    it('should calculate automatic score from metrics', () => {
      const metrics: AutomaticMetrics = {
        compiles: true,
        testsPass: true,
        executionSuccess: true
      };

      const score = controller.calculateAutomaticScore(metrics);

      expect(score).toBe(100); // 25 + 35 + 40 = 100
    });

    it('should calculate partial score for partial success', () => {
      const metrics: AutomaticMetrics = {
        compiles: true,
        testsPass: false,
        executionSuccess: true
      };

      const score = controller.calculateAutomaticScore(metrics);

      expect(score).toBe(65); // 25 + 0 + 40 = 65
    });
  });

  describe('manual override', () => {
    it('should apply manual score correctly', () => {
      const manualScore: ManualScore = {
        score: 4,
        userId: 'user-1',
        timestamp: new Date()
      };

      const finalScore = controller.applyManualScore(manualScore);

      expect(finalScore).toBe(80); // 4 stars * 20 = 80
    });
  });

  describe('hybrid scoring', () => {
    it('should combine automatic and manual scores', () => {
      const automaticScore = 70;
      const manualScore: ManualScore = {
        score: 5,
        userId: 'user-1',
        timestamp: new Date()
      };

      const finalScore = controller.calculateFinalScore(automaticScore, manualScore);

      expect(finalScore).toBe(100); // Manual (5*20=100) takes precedence
    });
  });
});