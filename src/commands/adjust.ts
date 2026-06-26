/**
 * /memory-adjust-weight Command
 * Manual weight tuning for skills
 */

import { SkillLibrary } from '../skills/library';

export interface AdjustOptions {
  skill: string;
  value: string; // Can be absolute (75) or relative (+10, -5)
}

export class AdjustCommand {
  private skillLibrary: SkillLibrary;

  constructor(skillLibrary: SkillLibrary) {
    this.skillLibrary = skillLibrary;
  }

  async execute(options: AdjustOptions): Promise<string> {
    const skill = this.skillLibrary.getSkillById(options.skill);

    if (!skill) {
      return `Error: Skill '${options.skill}' not found`;
    }

    const previousWeight = skill.currentWeight;
    let newWeight: number;

    if (options.value.startsWith('+') || options.value.startsWith('-')) {
      // Relative adjustment
      const adjustment = parseInt(options.value);
      newWeight = previousWeight + adjustment;
    } else {
      // Absolute value
      newWeight = parseInt(options.value);
    }

    // Validate range
    newWeight = Math.max(1, Math.min(100, newWeight));

    // Update weight
    this.skillLibrary.updateSkillWeight(options.skill, newWeight);

    return `Updated ${skill.name} weight: ${previousWeight} → ${newWeight}`;
  }
}
