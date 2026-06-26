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
    }
  ];

  console.log(`Registered ${commands.length} commands: /memory-status, /memory-weights, /memory-patterns`);
}

// Export for testing
export { memoryBackend, skillLibrary, patternStore };