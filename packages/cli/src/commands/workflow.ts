/**
 * Workflow Command
 * Manage SDD workflow stages
 * @module @musuhi/cli/commands
 */

import { Command } from 'commander';
import { WorkflowEngine } from '@musuhi/core';
import type { WorkflowStage } from '@musuhi/core';

export const workflowCommand = new Command('workflow')
  .description('Manage SDD workflow stages');

// workflow status
workflowCommand
  .command('status')
  .description('Show current workflow status')
  .action(async () => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      const summary = engine.getSummary();

      console.log('\n=== Workflow Status ===');
      console.log(`Current Stage: ${summary.currentStage}`);
      console.log(`Progress: ${summary.progress.toFixed(1)}%`);
      console.log(`\nCompleted Stages: ${summary.completedStages.length}`);
      for (const stage of summary.completedStages) {
        console.log(`  ✓ ${stage}`);
      }

      if (summary.blockedStages.length > 0) {
        console.log(`\nBlocked Stages: ${summary.blockedStages.length}`);
        for (const stage of summary.blockedStages) {
          console.log(`  ✗ ${stage}`);
        }
      }

      console.log(`\nTotal Deliverables: ${summary.totalDeliverables}`);
    } catch (error) {
      console.error('Error getting workflow status:', error);
      process.exit(1);
    }
  });

// workflow start
workflowCommand
  .command('start')
  .description('Start a workflow stage')
  .argument('<stage>', 'Stage to start (research, requirements, design, tasks, implementation, testing, deployment, monitoring)')
  .action(async (stage: string) => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      await engine.startStage(stage as WorkflowStage);

      console.log(`✓ Started stage: ${stage}`);
      console.log('\nNext steps:');
      console.log(`  1. Complete ${stage} deliverables`);
      console.log(`  2. Run: musuhi workflow complete ${stage}`);
    } catch (error) {
      console.error(`Error starting stage ${stage}:`, error);
      process.exit(1);
    }
  });

// workflow complete
workflowCommand
  .command('complete')
  .description('Complete a workflow stage')
  .argument('<stage>', 'Stage to complete')
  .action(async (stage: string) => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      const result = await engine.completeStage(stage as WorkflowStage);

      if (result.passed) {
        console.log(`✓ Completed stage: ${stage}`);
        console.log(result.message);
      } else {
        console.log(`✗ Failed to complete stage: ${stage}`);
        console.log(result.message);

        if (result.suggestions && result.suggestions.length > 0) {
          console.log('\nSuggestions:');
          for (const suggestion of result.suggestions) {
            console.log(`  - ${suggestion}`);
          }
        }

        process.exit(1);
      }
    } catch (error) {
      console.error(`Error completing stage ${stage}:`, error);
      process.exit(1);
    }
  });

// workflow list
workflowCommand
  .command('list')
  .description('List all workflow stages')
  .action(async () => {
    const stages = [
      'research',
      'requirements',
      'design',
      'tasks',
      'implementation',
      'testing',
      'deployment',
      'monitoring',
    ];

    console.log('\n=== SDD Workflow Stages ===');
    for (let i = 0; i < stages.length; i++) {
      console.log(`${i + 1}. ${stages[i]}`);
    }
    console.log('\nUse "musuhi workflow start <stage>" to begin a stage');
  });
