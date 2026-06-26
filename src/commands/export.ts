/**
 * /memory-export and /memory-import Commands
 * Backup and restore learning state
 */

import { SkillLibrary } from '../skills/library';
import { PatternStore } from '../patterns/store';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

export class ExportCommand {
  private skillLibrary: SkillLibrary;
  private patternStore: PatternStore;

  constructor(skillLibrary: SkillLibrary, patternStore: PatternStore) {
    this.skillLibrary = skillLibrary;
    this.patternStore = patternStore;
  }

  async execute(filename?: string): Promise<string> {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      skills: this.skillLibrary.getAllSkills(),
      patterns: this.patternStore.getAllPatterns()
    };

    const defaultFilename = `memory-export-${Date.now()}.json`;
    const filepath = resolve(filename || defaultFilename);

    writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    return `Exported learning state to ${filepath}`;
  }
}

export class ImportCommand {
  private skillLibrary: SkillLibrary;
  private patternStore: PatternStore;

  constructor(skillLibrary: SkillLibrary, patternStore: PatternStore) {
    this.skillLibrary = skillLibrary;
    this.patternStore = patternStore;
  }

  async execute(filename: string): Promise<string> {
    try {
      const filepath = resolve(filename);
      const data = readFileSync(filepath, 'utf-8');
      const importData = JSON.parse(data);

      // Import skills
      for (const skill of importData.skills || []) {
        this.skillLibrary.updateSkillWeight(skill.id, skill.currentWeight);
      }

      // Import patterns
      this.patternStore.import(JSON.stringify(importData.patterns || []));

      return `Imported learning state from ${filepath}`;
    } catch (error) {
      return `Error importing from ${filename}: ${error}`;
    }
  }
}
