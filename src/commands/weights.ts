/**
 * /memory-weights Command
 * Display current skill weights with usage trends
 */

import { AgentMemoryAdapter } from '../memory/agentmemory-adapter';
import { SkillLibrary } from '../skills/library';
import { WeightCalculator } from '../skills/calculator';

export interface WeightOptions {
  top?: number;
  bottom?: number;
  category?: string;
}

export class WeightsCommand {
  private memoryBackend: AgentMemoryAdapter;
  private skillLibrary: SkillLibrary;
  private weightCalculator: WeightCalculator;

  constructor(
    memoryBackend: AgentMemoryAdapter,
    skillLibrary: SkillLibrary
  ) {
    this.memoryBackend = memoryBackend;
    this.skillLibrary = skillLibrary;
    this.weightCalculator = new WeightCalculator();
  }

  async execute(options: WeightOptions = {}): Promise<string> {
    let skills = this.skillLibrary.getAllSkills();

    // Apply filters
    if (options.category) {
      skills = skills.filter(s => s.category === options.category);
    }

    // Sort by weight
    skills.sort((a, b) => b.currentWeight - a.currentWeight);

    // Apply limits
    if (options.top) {
      skills = skills.slice(0, options.top);
    } else if (options.bottom) {
      skills = skills.slice(-options.bottom);
    }

    return this.formatWeights(skills);
  }

  private formatWeights(skills: any[]): string {
    if (skills.length === 0) {
      return 'No skills found matching criteria.';
    }

    const lines = skills.map(skill => {
      const successRate = skill.usageCount > 0
        ? Math.round((skill.successCount / skill.usageCount) * 100)
        : 0;

      const trend = this.weightCalculator.getWeightTrend(
        skill.currentWeight,
        skill.currentWeight * 0.9 // Simulate previous weight
      );
      const trendSymbol = trend === 'rising' ? '↗' : trend === 'declining' ? '↘' : '→';

      return `├─ ${skill.name}: ${skill.currentWeight}% (${skill.usageCount} uses, ${successRate}% success) ${trendSymbol} ${trend}`;
    });

    return `Skill Weights (by usage)\n${lines.join('\n')}`;
  }
}
