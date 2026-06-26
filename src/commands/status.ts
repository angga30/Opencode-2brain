/**
 * /memory-status Command
 * Quick health check of agent's learning state
 */

import { AgentMemoryAdapter } from '../memory/agentmemory-adapter';
import { SkillLibrary } from '../skills/library';
import { PatternStore } from '../patterns/store';

export interface MemoryStatus {
  skillsTracked: number;
  activePatterns: number;
  recentSuccessRate: number;
  learningVelocity: number;
  topSkills: Array<{ name: string; weight: number }>;
}

export class StatusCommand {
  private memoryBackend: AgentMemoryAdapter;
  private skillLibrary: SkillLibrary;
  private patternStore: PatternStore;

  constructor(
    memoryBackend: AgentMemoryAdapter,
    skillLibrary: SkillLibrary,
    patternStore: PatternStore
  ) {
    this.memoryBackend = memoryBackend;
    this.skillLibrary = skillLibrary;
    this.patternStore = patternStore;
  }

  async execute(): Promise<string> {
    const skills = this.skillLibrary.getAllSkills();
    const patterns = this.patternStore.getPatternsByConfidence(30);

    const status: MemoryStatus = {
      skillsTracked: skills.length,
      activePatterns: patterns.length,
      recentSuccessRate: this.calculateRecentSuccessRate(skills),
      learningVelocity: this.calculateLearningVelocity(skills),
      topSkills: this.getTopSkills(skills, 3)
    };

    return this.formatStatus(status);
  }

  private calculateRecentSuccessRate(skills: any[]): number {
    if (skills.length === 0) return 0;

    const totalSuccess = skills.reduce((sum, skill) => {
      const successRate = skill.usageCount > 0
        ? skill.successCount / skill.usageCount
        : 0;
      return sum + successRate;
    }, 0);

    return Math.round((totalSuccess / skills.length) * 100);
  }

  private calculateLearningVelocity(skills: any[]): number {
    // Count skills used in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentSkills = skills.filter(skill => skill.lastUsed >= weekAgo);
    return recentSkills.length;
  }

  private getTopSkills(skills: any[], count: number): Array<{ name: string; weight: number }> {
    return skills
      .sort((a, b) => b.currentWeight - a.currentWeight)
      .slice(0, count)
      .map(skill => ({
        name: skill.name,
        weight: skill.currentWeight
      }));
  }

  private formatStatus(status: MemoryStatus): string {
    return `🧠 Memory Status
├─ Skills Tracked: ${status.skillsTracked}
├─ Active Patterns: ${status.activePatterns}
├─ Recent Success Rate: ${status.recentSuccessRate}%
├─ Learning Velocity: +${status.learningVelocity} skills this week
└─ Top Skills: [${status.topSkills.map(s => `${s.name}: ${s.weight}%`).join(', ')}]`;
  }
}
