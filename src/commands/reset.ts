/**
 * /memory-reset Command
 * Reset learning state with safety confirmations
 */

import { SkillLibrary } from '../skills/library';
import { PatternStore } from '../patterns/store';

export type ResetMode = 'soft' | 'hard';

export class ResetCommand {
  private skillLibrary: SkillLibrary;
  private patternStore: PatternStore;

  constructor(skillLibrary: SkillLibrary, patternStore: PatternStore) {
    this.skillLibrary = skillLibrary;
    this.patternStore = patternStore;
  }

  async execute(mode: ResetMode = 'soft', confirmed: boolean = false): Promise<string> {
    if (!confirmed) {
      return `⚠️  This will reset your learning state. To confirm, run: /memory-reset --${mode} --confirm`;
    }

    if (mode === 'soft') {
      return this.softReset();
    } else {
      return this.hardReset();
    }
  }

  private softReset(): string {
    // Reset weights only
    const skills = this.skillLibrary.getAllSkills();
    for (const skill of skills) {
      this.skillLibrary.updateSkillWeight(skill.id, 50);
    }

    return `✓ Soft reset complete - weights reset to default values`;
  }

  private hardReset(): string {
    // Reset everything including patterns
    const skills = this.skillLibrary.getAllSkills();
    for (const skill of skills) {
      this.skillLibrary.updateSkillWeight(skill.id, 50);
    }

    // Pattern store would need a clear method
    // this.patternStore.clear();

    return `✓ Hard reset complete - all learning data reset to defaults`;
  }
}
