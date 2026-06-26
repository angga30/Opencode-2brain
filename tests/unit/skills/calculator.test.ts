import { WeightCalculator } from '../../../src/skills/calculator';
import { Skill, UsageStats } from '../../../src/types';

describe('WeightCalculator', () => {
  let calculator: WeightCalculator;

  beforeEach(() => {
    calculator = new WeightCalculator();
  });

  describe('base weight calculation', () => {
    it('should calculate base weight from success rate', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test Skill',
        category: 'testing',
        difficulty: 'intermediate',
        typicalUseCases: [],
        prerequisites: [],
        alternatives: [],
        usageCount: 10,
        successCount: 8,
        lastUsed: new Date(),
        currentWeight: 50
      };

      const baseWeight = calculator.calculateBaseWeight(skill);
      expect(baseWeight).toBe(80); // 80% success rate = 80 weight
    });
  });

  describe('time-decay calculation', () => {
    it('should apply 2.0x multiplier for recent usage (0-7 days)', () => {
      const recentDate = new Date();
      const timeDecay = calculator.calculateTimeDecay(recentDate);
      expect(timeDecay).toBe(2.0);
    });

    it('should apply 1.5x multiplier for moderate usage (8-30 days)', () => {
      const moderateDate = new Date();
      moderateDate.setDate(moderateDate.getDate() - 15);
      const timeDecay = calculator.calculateTimeDecay(moderateDate);
      expect(timeDecay).toBe(1.5);
    });

    it('should apply 1.0x multiplier for historical usage (30+ days)', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 45);
      const timeDecay = calculator.calculateTimeDecay(oldDate);
      expect(timeDecay).toBe(1.0);
    });
  });

  describe('final weight calculation', () => {
    it('should combine base weight and time-decay', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test Skill',
        category: 'testing',
        difficulty: 'intermediate',
        typicalUseCases: [],
        prerequisites: [],
        alternatives: [],
        usageCount: 10,
        successCount: 9,
        lastUsed: new Date(), // Recent - 2.0x multiplier
        currentWeight: 50
      };

      const finalWeight = calculator.calculateWeight(skill);
      expect(finalWeight).toBe(100); // 90 * 2.0 = 180, capped at 100
    });

    it('should enforce minimum weight floor of 10 for active skills', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test Skill',
        category: 'testing',
        difficulty: 'intermediate',
        typicalUseCases: [],
        prerequisites: [],
        alternatives: [],
        usageCount: 1,
        successCount: 0,
        lastUsed: new Date(),
        currentWeight: 50
      };

      const finalWeight = calculator.calculateWeight(skill);
      expect(finalWeight).toBeGreaterThanOrEqual(10);
    });

    it('should enforce maximum weight cap of 100', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test Skill',
        category: 'testing',
        difficulty: 'intermediate',
        typicalUseCases: [],
        prerequisites: [],
        alternatives: [],
        usageCount: 100,
        successCount: 100,
        lastUsed: new Date(),
        currentWeight: 50
      };

      const finalWeight = calculator.calculateWeight(skill);
      expect(finalWeight).toBeLessThanOrEqual(100);
    });
  });

  describe('failure penalty', () => {
    it('should apply 0.5x multiplier for recent failures', () => {
      const skill: Skill = {
        id: 'test',
        name: 'Test Skill',
        category: 'testing',
        difficulty: 'intermediate',
        typicalUseCases: [],
        prerequisites: [],
        alternatives: [],
        usageCount: 10,
        successCount: 5,
        lastUsed: new Date(),
        currentWeight: 50
      };

      const finalWeight = calculator.calculateWeight(skill, true);
      expect(finalWeight).toBe(50); // Base 50% * recent 2.0x * failure 0.5x = 50
    });
  });
});