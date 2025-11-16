#!/usr/bin/env node
/**
 * MUSUHI CLI Entry Point
 * @module @musuhi-ng/cli
 */

import { Command } from 'commander';

import { initCommand } from './commands/init.js';
import { validateCommand } from './commands/validate.js';
import { workflowCommand } from './commands/workflow.js';
import { version } from './version.js';

const program = new Command();

program
  .name('musuhi')
  .description('MUSUHI-NG - Specification Driven Development CLI')
  .version(version);

// Register commands
program.addCommand(initCommand);
program.addCommand(validateCommand);
program.addCommand(workflowCommand);

// Parse command-line arguments
program.parse(process.argv);
