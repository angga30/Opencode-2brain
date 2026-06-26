import { initialize } from '../../src/index';
import { StatusCommand } from '../../src/commands/status';
import { AgentMemoryAdapter } from '../../src/memory/agentmemory-adapter';
import { SkillLibrary } from '../../src/skills/library';
import { PatternStore } from '../../src/patterns/store';

describe('Command Integration', () => {
  let memoryBackend: AgentMemoryAdapter;
  let skillLibrary: SkillLibrary;
  let patternStore: PatternStore;

  beforeEach(async () => {
    memoryBackend = new AgentMemoryAdapter('http://localhost:3111');
    skillLibrary = new SkillLibrary();
    patternStore = new PatternStore();
    await skillLibrary.loadFromConfig('src/config/skills.json');
  });

  describe('/memory-status', () => {
    it('should return formatted status', async () => {
      const command = new StatusCommand(memoryBackend, skillLibrary, patternStore);
      const status = await command.execute();

      expect(status).toContain('🧠 Memory Status');
      expect(status).toContain('Skills Tracked');
    });
  });

  describe('command registration', () => {
    it('should initialize plugin', async () => {
      const init = await initialize();
      expect(init).toBeUndefined();
    });
  });
});