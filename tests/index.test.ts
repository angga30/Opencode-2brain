import { PLUGIN_NAME, VERSION, initialize } from '../src/index';

describe('Plugin Entry Point', () => {
  it('should export correct plugin metadata', () => {
    expect(PLUGIN_NAME).toBe('memory-growth-plugin');
    expect(VERSION).toBe('1.0.0');
  });

  it('should have initialize function', () => {
    expect(typeof initialize).toBe('function');
    expect(() => initialize()).not.toThrow();
  });
});
