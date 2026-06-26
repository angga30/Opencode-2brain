import { SkillLibrary } from '../../../src/skills/library';
import { Solution, Skill } from '../../../src/types';

describe('SkillLibrary', () => {
  let library: SkillLibrary;

  beforeEach(() => {
    library = new SkillLibrary();
  });

  describe('skill extraction', () => {
    it('should extract skills from solution', () => {
      const solution: Solution = {
        id: 'test-1',
        timestamp: new Date(),
        problemType: 'api-error',
        skillsUsed: ['error-handling', 'retry-logic'],
        context: { language: 'typescript', api: 'REST' },
        result: 'success',
        executionTime: 2000
      };

      const skills = library.extractSkills(solution);

      expect(skills).toHaveLength(2);
      expect(skills[0].id).toBe('error-handling');
      expect(skills[1].id).toBe('retry-logic');
    });

    it('should load skills from configuration', async () => {
      await library.loadFromConfig('src/config/skills.json');
      const skills = library.getAllSkills();

      expect(skills.length).toBeGreaterThan(0);
      expect(skills[0]).toHaveProperty('id');
      expect(skills[0]).toHaveProperty('currentWeight');
    });
  });

  describe('skill management', () => {
    it('should update skill usage', async () => {
      await library.loadFromConfig('src/config/skills.json');
      const skill = library.getSkillById('error-handling');

      expect(skill).toBeDefined();

      library.updateUsage('error-handling', true);
      const updated = library.getSkillById('error-handling');

      expect(updated?.usageCount).toBe(1);
      expect(updated?.successCount).toBe(1);
    });
  });
});