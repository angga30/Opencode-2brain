/**
 * /memory-analyze Command
 * Deep analytics and correlations
 */

import { SkillLibrary } from '../skills/library';
import { PatternStore } from '../patterns/store';

export interface AnalyzeOptions {
  category?: string;
}

export class AnalyzeCommand {
  private skillLibrary: SkillLibrary;
  private patternStore: PatternStore;

  constructor(skillLibrary: SkillLibrary, patternStore: PatternStore) {
    this.skillLibrary = skillLibrary;
    this.patternStore = patternStore;
  }

  async execute(options: AnalyzeOptions = {}): Promise<string> {
    const skills = this.skillLibrary.getAllSkills();
    const patterns = this.patternStore.getAllPatterns();

    let analysis = `📊 Learning Analytics\n\n`;

    // Skill correlations
    analysis += `**Skill Correlations:**\n`;
    const highWeightSkills = skills.filter(s => s.currentWeight >= 80);
    analysis += `├─ High-weight skills: ${highWeightSkills.length}\n`;

    const lowWeightSkills = skills.filter(s => s.currentWeight <= 30);
    analysis += `├─ Low-weight skills: ${lowWeightSkills.length}\n`;
    analysis += `├─ Average success rate: ${this.calculateAverageSuccessRate(skills)}%\n`;
    analysis += `└─ Learning velocity: +${this.calculateLearningVelocity(skills)} skills/week\n\n`;

    // Pattern analysis
    analysis += `**Pattern Analysis:**\n`;
    const highConfidencePatterns = patterns.filter(p => p.confidenceScore >= 80);
    analysis += `├─ High-confidence patterns: ${highConfidencePatterns.length}\n`;
    analysis += `├─ Average pattern confidence: ${this.calculateAverageConfidence(patterns)}%\n`;
    analysis += `└─ Most common problem type: ${this.getMostCommonProblemType(patterns)}\n\n`;

    // Recommendations
    analysis += `**Recommendations:**\n`;
    analysis += this.generateRecommendations(skills, patterns);

    return analysis;
  }

  private calculateAverageSuccessRate(skills: any[]): number {
    if (skills.length === 0) return 0;

    const totalRate = skills.reduce((sum, skill) => {
      return sum + (skill.usageCount > 0 ? (skill.successCount / skill.usageCount) * 100 : 0);
    }, 0);

    return Math.round(totalRate / skills.length);
  }

  private calculateLearningVelocity(skills: any[]): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return skills.filter(s => s.lastUsed >= weekAgo).length;
  }

  private calculateAverageConfidence(patterns: any[]): number {
    if (patterns.length === 0) return 0;

    const totalConfidence = patterns.reduce((sum, p) => sum + p.confidenceScore, 0);
    return Math.round(totalConfidence / patterns.length);
  }

  private getMostCommonProblemType(patterns: any[]): string {
    const counts = new Map<string, number>();

    for (const pattern of patterns) {
      const count = counts.get(pattern.problemType) || 0;
      counts.set(pattern.problemType, count + 1);
    }

    let maxCount = 0;
    let mostCommon = 'none';

    for (const [type, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type;
      }
    }

    return mostCommon;
  }

  private generateRecommendations(skills: any[], patterns: any[]): string {
    const recommendations: string[] = [];

    const underutilizedSkills = skills.filter(s => s.usageCount < 5 && s.currentWeight > 70);
    if (underutilizedSkills.length > 0) {
      recommendations.push(`├─ Consider using underutilized high-weight skills: ${underutilizedSkills.map(s => s.name).join(', ')}`);
    }

    const lowSuccessSkills = skills.filter(s => s.usageCount >= 5 && (s.successCount / s.usageCount) < 0.6);
    if (lowSuccessSkills.length > 0) {
      recommendations.push(`├─ Review low-success rate skills: ${lowSuccessSkills.map(s => s.name).join(', ')}`);
    }

    const highConfidencePatterns = patterns.filter(p => p.confidenceScore >= 80);
    if (highConfidencePatterns.length > 0) {
      recommendations.push(`└─ Leverage ${highConfidencePatterns.length} high-confidence patterns for common problems`);
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '└─ No specific recommendations at this time.';
  }
}
