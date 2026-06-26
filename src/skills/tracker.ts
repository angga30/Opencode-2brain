/**
 * Usage Tracker
 * Records and aggregates skill usage patterns
 */

import { Solution, Skill, UsageStats } from '../types';

export interface UsageRecord {
  skillId: string;
  timestamp: Date;
  success: boolean;
  executionTime: number;
  context: Record<string, unknown>;
}

export class UsageTracker {
  private records: Map<string, UsageRecord[]> = new Map();

  recordUsage(solution: Solution): void {
    for (const skillId of solution.skillsUsed) {
      const records = this.records.get(skillId) || [];
      records.push({
        skillId,
        timestamp: solution.timestamp,
        success: solution.result === 'success',
        executionTime: solution.executionTime,
        context: solution.context
      });
      this.records.set(skillId, records);
    }
  }

  getUsageStats(skillId: string): UsageStats {
    const records = this.records.get(skillId) || [];

    if (records.length === 0) {
      return {
        skillId,
        usageCount: 0,
        successCount: 0,
        successRate: 0,
        lastUsed: new Date(),
        averageTimeToSuccess: 0
      };
    }

    const successCount = records.filter(r => r.success).length;
    const successRecords = records.filter(r => r.success);
    const avgTime = successRecords.length > 0
      ? successRecords.reduce((sum, r) => sum + r.executionTime, 0) / successRecords.length
      : 0;

    return {
      skillId,
      usageCount: records.length,
      successCount,
      successRate: successCount / records.length,
      lastUsed: records[records.length - 1].timestamp,
      averageTimeToSuccess: avgTime
    };
  }

  getRecentUsage(skillId: string, days: number = 7): UsageRecord[] {
    const records = this.records.get(skillId) || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return records.filter(r => r.timestamp >= cutoff);
  }

  clearOldRecords(daysToKeep: number = 90): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    for (const [skillId, records] of this.records.entries()) {
      const filtered = records.filter(r => r.timestamp >= cutoff);
      this.records.set(skillId, filtered);
    }
  }
}