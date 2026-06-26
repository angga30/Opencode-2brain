/**
 * Memory Growth Adaptive Learning Plugin
 * Entry point for Opencode plugin registration
 */

export const PLUGIN_NAME = 'memory-growth-plugin';
export const VERSION = '1.0.0';

export function initialize(): void {
  console.log(`${PLUGIN_NAME} v${VERSION} initialized`);
  // Command registration will be added in Task 8
}
