/**
 * Memory Growth Adaptive Learning Plugin
 * Entry point for Opencode plugin registration
 */

import { AgentMemoryAdapter } from './memory/agentmemory-adapter';
import { SkillLibrary } from './skills/library';
import { PatternStore } from './patterns/store';
import { StatusCommand } from './commands/status';
import { WeightsCommand } from './commands/weights';
import { PatternsCommand } from './commands/patterns';
import { AdjustCommand } from './commands/adjust';
import { AnalyzeCommand } from './commands/analyze';
import { ExportCommand, ImportCommand } from './commands/export';
import { ResetCommand } from './commands/reset';

export const PLUGIN_NAME = 'memory-growth-plugin';
export const VERSION = '1.0.0';

// Initialize components
let memoryBackend: AgentMemoryAdapter;
let skillLibrary: SkillLibrary;
let patternStore: PatternStore;

export async function initialize(): Promise<void> {
  console.log(`${PLUGIN_NAME} v${VERSION} initializing...`);

  // Initialize core components
  memoryBackend = new AgentMemoryAdapter('http://localhost:3111');
  skillLibrary = new SkillLibrary();
  patternStore = new PatternStore();

  // Load skill library
  await skillLibrary.loadFromConfig('src/config/skills.json');

  // Register commands (this would integrate with Opencode's command registry)
  registerCommands();

  console.log(`${PLUGIN_NAME} v${VERSION} initialized successfully`);
}

function registerCommands(): void {
  const commands = [
    {
      name: 'memory-status',
      description: 'Quick health check of learning state',
      handler: async () => {
        const command = new StatusCommand(memoryBackend, skillLibrary, patternStore);
        return await command.execute();
      }
    },
    {
      name: 'memory-weights',
      description: 'Display current skill weights with trends',
      handler: async (options?: any) => {
        const command = new WeightsCommand(memoryBackend, skillLibrary);
        return await command.execute(options);
      }
    },
    {
      name: 'memory-patterns',
      description: 'Show successful learning patterns',
      handler: async (options?: any) => {
        const command = new PatternsCommand(patternStore);
        return await command.execute(options);
      }
    },
    {
      name: 'memory-adjust-weight',
      description: 'Manual weight tuning for skills',
      handler: async (skill: string, value: string) => {
        const command = new AdjustCommand(skillLibrary);
        return await command.execute({ skill, value });
      }
    },
    {
      name: 'memory-analyze',
      description: 'Deep analytics and correlations',
      handler: async (options?: any) => {
        const command = new AnalyzeCommand(skillLibrary, patternStore);
        return await command.execute(options);
      }
    },
    {
      name: 'memory-export',
      description: 'Export learning state as JSON',
      handler: async (filename?: string) => {
        const command = new ExportCommand(skillLibrary, patternStore);
        return await command.execute(filename);
      }
    },
    {
      name: 'memory-import',
      description: 'Import learning state from JSON',
      handler: async (filename: string) => {
        const command = new ImportCommand(skillLibrary, patternStore);
        return await command.execute(filename);
      }
    },
    {
      name: 'memory-reset',
      description: 'Reset learning state',
      handler: async (mode: string = 'soft', confirmed: boolean = false) => {
        const command = new ResetCommand(skillLibrary, patternStore);
        return await command.execute(mode as any, confirmed);
      }
    }
  ];

  console.log(`Registered ${commands.length} commands:`);
  for (const cmd of commands) {
    console.log(`  /${cmd.name} - ${cmd.description}`);
  }
}

// Export for testing
export { memoryBackend, skillLibrary, patternStore };
