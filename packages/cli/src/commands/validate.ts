/**
 * Validate Command
 * Validate code against constitutional principles
 * @module @musuhi-ng/cli/commands
 */

import { Command } from 'commander';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PhaseGateValidator, ConstitutionLoader } from '@musuhi-ng/constitutional-governance';
import { NodeFileSystem } from '@musuhi-ng/core';
import type { ValidationContext, Article } from '@musuhi-ng/constitutional-governance';

export const validateCommand = new Command('validate')
  .description('Validate code against constitutional principles')
  .argument('<file>', 'File to validate')
  .option('-a, --articles <articles>', 'Specific articles to validate (comma-separated)', 'all')
  .action(async (file: string, options) => {
    try {
      // Read file content
      const content = await fs.readFile(file, 'utf-8');

      // Determine which articles to validate
      let articlesToValidate: Article[] | undefined;
      if (options.articles !== 'all') {
        articlesToValidate = options.articles
          .split(',')
          .map((a: string) => parseInt(a.trim()))
          .filter((a: number) => a >= 1 && a <= 9) as Article[];
      }

      // Load constitution
      const projectRoot = process.cwd();
      const constitutionPath = path.join(projectRoot, 'steering', 'constitution.md');
      const fsManager = new NodeFileSystem();

      console.log(`Loading constitution from ${constitutionPath}...`);
      const loader = new ConstitutionLoader(fsManager, constitutionPath);
      const articles = await loader.load();

      console.log(`Loaded ${articles.length} articles`);

      // Create validation context
      const context: ValidationContext = {
        filePath: file,
        content,
        projectRoot,
        metadata: {
          timestamp: new Date(),
          author: 'cli-user',
        },
      };

      // Initialize validator with loaded articles
      const validator = new PhaseGateValidator(articles);

      // Validate
      console.log(`\nValidating ${file}...`);
      const result = await validator.validate(context, articlesToValidate);

      // Display results
      console.log(`\nValidation Result: ${result.status}`);
      console.log(`Articles checked: ${result.articles.join(', ')}`);

      if (result.validations.length > 0) {
        console.log('\nDetails:');
        for (const validation of result.validations) {
          const icon = validation.valid ? '✓' : '✗';
          console.log(`  ${icon} ${validation.message || 'No message'}`);

          if (validation.details && validation.details.length > 0) {
            console.log('    Issues:');
            for (const detail of validation.details) {
              console.log(`      - ${detail}`);
            }
          }

          if (validation.suggestions && validation.suggestions.length > 0) {
            console.log('    Suggestions:');
            for (const suggestion of validation.suggestions) {
              console.log(`      - ${suggestion}`);
            }
          }
        }
      }

      if (result.status === 'rejected') {
        process.exit(1);
      }
    } catch (error) {
      console.error('Error during validation:', error);
      process.exit(1);
    }
  });
