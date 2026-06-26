/**
 * AgentMemory Adapter
 * Implements MemoryBackend interface using agentmemory MCP tools
 */

import { MemoryBackend } from './backend';
import { Solution, UsageStats, WeightEntry, Pattern, Skill } from '../types';
import { McpClientManager } from './client';

export class AgentMemoryAdapter extends MemoryBackend {
  private clientManager: McpClientManager;
  private localQueue: Array<{ operation: string; data: unknown }> = [];
  private cache: Map<string, unknown> = new Map();

  constructor(serverUrl: string = 'http://localhost:3111') {
    super();
    this.clientManager = new McpClientManager(serverUrl);
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    const connected = await this.clientManager.connect();
    if (!connected) {
      console.warn('agentmemory unavailable - operating in degraded mode');
    }
  }

  isConnected(): boolean {
    return this.clientManager.isConnected();
  }

  async captureSolution(solution: Solution): Promise<string> {
    if (!this.isConnected()) {
      // Queue locally for later
      await this.queueUpdate('captureSolution', solution);
      return `queued-${solution.id}`;
    }

    try {
      const result = await this.clientManager.callTool('memory_save', {
        type: 'solution',
        content: JSON.stringify(solution),
        metadata: {
          problemType: solution.problemType,
          skills: solution.skillsUsed,
          result: solution.result
        }
      });

      this.cache.set(solution.id, solution);
      return solution.id;
    } catch (error) {
      console.error('Failed to capture solution:', error);
      // Fallback to local queue
      await this.queueUpdate('captureSolution', solution);
      return `queued-${solution.id}`;
    }
  }

  async getSkillUsage(skillId: string): Promise<UsageStats> {
    if (!this.isConnected()) {
      // Return cached data if available
      const cached = this.cache.get(`skill-${skillId}`) as UsageStats;
      if (cached) return cached;

      // Return default stats
      return {
        skillId,
        usageCount: 0,
        successCount: 0,
        successRate: 0,
        lastUsed: new Date(),
        averageTimeToSuccess: 0
      };
    }

    try {
      const result = await this.clientManager.callTool('memory_recall', {
        query: `skill usage ${skillId}`,
        limit: 100
      }) as any;

      // Process results and calculate statistics
      const usageCount = result?.results?.length || 0;
      const successCount = result?.results?.filter((r: any) => r.result === 'success').length || 0;

      const stats: UsageStats = {
        skillId,
        usageCount,
        successCount,
        successRate: usageCount > 0 ? successCount / usageCount : 0,
        lastUsed: new Date(),
        averageTimeToSuccess: 1500 // Default value
      };

      this.cache.set(`skill-${skillId}`, stats);
      return stats;
    } catch (error) {
      console.error('Failed to get skill usage:', error);
      throw error;
    }
  }

  async updateWeights(updates: WeightEntry[]): Promise<void> {
    if (!this.isConnected()) {
      await this.queueUpdate('updateWeights', updates);
      return;
    }

    try {
      for (const update of updates) {
        await this.clientManager.callTool('memory_save', {
          type: 'weight-update',
          content: JSON.stringify(update),
          metadata: {
            skillId: update.skillId,
            previousWeight: update.previousWeight,
            newWeight: update.newWeight
          }
        });
      }
    } catch (error) {
      console.error('Failed to update weights:', error);
      await this.queueUpdate('updateWeights', updates);
    }
  }

  async getLearningPatterns(patternType?: string): Promise<Pattern[]> {
    if (!this.isConnected()) {
      return [];
    }

    try {
      const query = patternType
        ? `learning pattern ${patternType}`
        : 'learning patterns';

      const result = await this.clientManager.callTool('memory_recall', {
        query,
        limit: 50
      }) as any;

      return result?.results?.map((r: any) => ({
        id: r.id,
        problemType: r.problemType,
        successfulSkills: r.successfulSkills || [],
        confidenceScore: r.confidenceScore || 0,
        lastSuccessfulUse: new Date(r.lastSuccessfulUse || Date.now()),
        contextTags: r.contextTags || []
      })) || [];
    } catch (error) {
      console.error('Failed to get learning patterns:', error);
      return [];
    }
  }

  async getAllSkills(): Promise<Skill[]> {
    if (!this.isConnected()) {
      return [];
    }

    try {
      const result = await this.clientManager.callTool('memory_recall', {
        query: 'all skills',
        limit: 1000
      }) as any;

      return result?.results?.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        difficulty: r.difficulty,
        typicalUseCases: r.typicalUseCases || [],
        prerequisites: r.prerequisites || [],
        alternatives: r.alternatives || [],
        currentWeight: r.currentWeight || 50,
        usageCount: r.usageCount || 0,
        successCount: r.successCount || 0,
        lastUsed: new Date(r.lastUsed || Date.now())
      })) || [];
    } catch (error) {
      console.error('Failed to get all skills:', error);
      return [];
    }
  }

  async updateSkill(skill: Skill): Promise<void> {
    if (!this.isConnected()) {
      await this.queueUpdate('updateSkill', skill);
      return;
    }

    try {
      await this.clientManager.callTool('memory_save', {
        type: 'skill',
        content: JSON.stringify(skill),
        metadata: {
          skillId: skill.id,
          category: skill.category,
          currentWeight: skill.currentWeight
        }
      });

      this.cache.set(`skill-${skill.id}`, skill);
    } catch (error) {
      console.error('Failed to update skill:', error);
      await this.queueUpdate('updateSkill', skill);
    }
  }

  async queueUpdate(operation: string, data: unknown): Promise<void> {
    this.localQueue.push({ operation, data });
  }

  async processQueue(): Promise<void> {
    if (!this.isConnected() || this.localQueue.length === 0) {
      return;
    }

    const queued = [...this.localQueue];
    this.localQueue = [];

    for (const item of queued) {
      try {
        switch (item.operation) {
          case 'captureSolution':
            await this.captureSolution(item.data as Solution);
            break;
          case 'updateWeights':
            await this.updateWeights(item.data as WeightEntry[]);
            break;
          case 'updateSkill':
            await this.updateSkill(item.data as Skill);
            break;
        }
      } catch (error) {
        console.error(`Failed to process queued ${item.operation}:`, error);
        // Re-queue if failed
        this.localQueue.push(item);
      }
    }
  }
}