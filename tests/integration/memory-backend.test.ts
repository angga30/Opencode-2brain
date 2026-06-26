import { AgentMemoryAdapter } from '../../src/memory/agentmemory-adapter';
import { Solution } from '../../src/types';

describe('Memory Backend Integration', () => {
  let backend: AgentMemoryAdapter;

  beforeEach(() => {
    backend = new AgentMemoryAdapter('http://localhost:3111');
  });

  afterEach(async () => {
    // Cleanup if needed
  });

  describe('captureSolution', () => {
    it('should capture solution and return ID', async () => {
      const solution: Solution = {
        id: 'test-solution-1',
        timestamp: new Date(),
        problemType: 'bug-fix',
        skillsUsed: ['debugging', 'testing'],
        context: { language: 'typescript' },
        result: 'success',
        executionTime: 1500
      };

      const solutionId = await backend.captureSolution(solution);

      expect(solutionId).toBeDefined();
      expect(typeof solutionId).toBe('string');
    });

    it('should handle connection failure gracefully', async () => {
      const badBackend = new AgentMemoryAdapter('http://invalid-host:3111');
      const solution: Solution = {
        id: 'test-solution-2',
        timestamp: new Date(),
        problemType: 'bug-fix',
        skillsUsed: ['debugging'],
        context: {},
        result: 'success',
        executionTime: 1000
      };

      // Should queue locally when backend unavailable
      const solutionId = await badBackend.captureSolution(solution);
      expect(solutionId).toBeDefined();
      expect(solutionId).toContain('queued');
    });
  });

  describe('getSkillUsage', () => {
    it('should return usage statistics for skill', async () => {
      const stats = await backend.getSkillUsage('debugging');

      expect(stats.skillId).toBe('debugging');
      expect(stats.usageCount).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(1);
    });
  });

  describe('connection status', () => {
    it('should report connection status', () => {
      const connected = backend.isConnected();
      expect(typeof connected).toBe('boolean');
    });
  });
});