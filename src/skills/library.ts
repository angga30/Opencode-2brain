/**
 * Skill Library
 * Manages skill definitions, extraction, and basic operations
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Skill, SkillConfig, Solution } from '../types';

export class SkillLibrary {
  private skills: Map<string, Skill> = new Map();

  async loadFromConfig(configPath: string = 'src/config/skills.json'): Promise<void> {
    try {
      const config = JSON.parse(readFileSync(resolve(configPath), 'utf-8'));
      const skillConfigs: SkillConfig[] = config.skills || [];

      for (const config of skillConfigs) {
        const skill: Skill = {
          id: config.id,
          name: config.name,
          category: config.category,
          difficulty: config.difficulty,
          typicalUseCases: config.typicalUseCases,
          prerequisites: config.prerequisites,
          alternatives: config.alternatives,
          currentWeight: config.initialWeight,
          usageCount: 0,
          successCount: 0,
          lastUsed: new Date()
        };
        this.skills.set(config.id, skill);
      }
    } catch (error) {
      console.error('Failed to load skill config:', error);
    }
  }

  extractSkills(solution: Solution): Skill[] {
    const skills: Skill[] = [];

    for (const skillId of solution.skillsUsed) {
      const skill = this.getSkillById(skillId);
      if (skill) {
        skills.push(skill);
      } else {
        // Create new skill from context if not found
        const newSkill: Skill = {
          id: skillId,
          name: this.formatSkillName(skillId),
          category: 'unknown',
          difficulty: 'intermediate',
          typicalUseCases: [],
          prerequisites: [],
          alternatives: [],
          currentWeight: 50,
          usageCount: 0,
          successCount: 0,
          lastUsed: new Date()
        };
        this.skills.set(skillId, newSkill);
        skills.push(newSkill);
      }
    }

    return skills;
  }

  updateUsage(skillId: string, success: boolean): void {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.usageCount++;
      if (success) {
        skill.successCount++;
      }
      skill.lastUsed = new Date();
    }
  }

  getSkillById(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  updateSkillWeight(skillId: string, newWeight: number): void {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.currentWeight = Math.max(1, Math.min(100, newWeight));
    }
  }

  private formatSkillName(skillId: string): string {
    return skillId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}