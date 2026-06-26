/**
 * End-to-End Learning Session Test
 * Simulates complete agent learning workflow
 */

import { AgentMemoryAdapter } from '../../src/memory/agentmemory-adapter';
import { SkillLibrary } from '../../src/skills/library';
import { PatternStore } from '../../src/patterns/store';
import { PatternDetector } from '../../src/patterns/detector';
import { WeightCalculator } from '../../src/skills/calculator';
import { Solution } from '../../src/types';

describe('End-to-End Learning Session', () => {
  let memoryBackend: AgentMemoryAdapter;
  let skillLibrary: SkillLibrary;
  let patternStore: PatternStore;
  let patternDetector: PatternDetector;
  let weightCalculator: WeightCalculator;

  beforeEach(async () => {
    memoryBackend = new AgentMemoryAdapter('http://localhost:3111');
    skillLibrary = new SkillLibrary();
    patternStore = new PatternStore();
    patternDetector = new PatternDetector();
    weightCalculator = new WeightCalculator();

    await skillLibrary.loadFromConfig('src/config/skills.json');
  });

  it('should track learning progress across multiple solutions', async () => {
    // Simulate agent solving problems
    const solutions: Solution[] = [
      {
        id: 's1',
        timestamp: new Date(),
        problemType: 'api-error',
        skillsUsed: ['error-handling', 'retry-logic'],
        context: { api: 'REST' },
        result: 'success',
        executionTime: 2000
      },
      {
        id: 's2',
        timestamp: new Date(),
        problemType: 'api-error',
        skillsUsed: ['error-handling', 'retry-logic'],
        context: { api: 'GraphQL' },
        result: 'success',
        executionTime: 2500
      },
      {
        id: 's3',
        timestamp: new Date(),
        problemType: 'performance-issue',
        skillsUsed: ['optimization', 'profiling'],
        context: { language: 'typescript' },
        result: 'failure',
        executionTime: 5000
      }
    ];

    // Process solutions
    for (const solution of solutions) {
      await memoryBackend.captureSolution(solution);

      const skills = skillLibrary.extractSkills(solution);
      for (const skill of skills) {
        skillLibrary.updateUsage(skill.id, solution.result === 'success');
      }
    }

    // Verify skill tracking
    const errorHandlingSkill = skillLibrary.getSkillById('error-handling');
    expect(errorHandlingSkill?.usageCount).toBe(2);
    expect(errorHandlingSkill?.successCount).toBe(2);

    // Verify pattern detection
    const patterns = patternDetector.detectPatterns(solutions);
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].problemType).toBe('api-error');

    // Verify weight calculation
    const weights = weightCalculator.calculateWeights(skillLibrary.getAllSkills());
    expect(weights.size).toBeGreaterThan(0);

    // Verify patterns stored
    patternStore.addPatterns(patterns);
    patternStore.updatePatternScores(solutions);
    const storedPatterns = patternStore.getPatternsByConfidence(30);
    expect(storedPatterns.length).toBeGreaterThan(0);
  });

  it('should apply time-decay correctly over time', async () => {
    const skill = skillLibrary.getSkillById('error-handling');
    expect(skill).toBeDefined();

    if (skill) {
      // Set initial values
      skill.usageCount = 10;
      skill.successCount = 8;
      skill.lastUsed = new Date();

      // Calculate weight for recent usage
      const recentWeight = weightCalculator.calculateWeight(skill);
      expect(recentWeight).toBeGreaterThan(80); // Should be high due to recent success

      // Set old usage date
      skill.lastUsed = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000); // 45 days ago

      // Calculate weight for old usage
      const oldWeight = weightCalculator.calculateWeight(skill);
      expect(oldWeight).toBeLessThan(recentWeight); // Should be lower due to time-decay
    }
  });
});