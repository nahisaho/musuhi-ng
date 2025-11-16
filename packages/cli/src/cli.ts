#!/usr/bin/env node
/**
 * MUSUHI CLI Entry Point
 * @module @musuhi/cli
 */

import { Command } from 'commander';
import { version } from './version.js';
import { initCommand } from './commands/init.js';
import { validateCommand } from './commands/validate.js';
import { workflowCommand } from './commands/workflow.js';

const program = new Command();

program
  .name('musuhi')
  .description('MUSUHI 2.0 - Specification Driven Development CLI')
  .version(version);

// Register commands
program.addCommand(initCommand);
program.addCommand(validateCommand);
program.addCommand(workflowCommand);

// Parse command-line arguments
program.parse(process.argv);
