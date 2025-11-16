/**
 * Workflow Command
 * Manage SDD workflow stages
 * @module @musuhi-ng/cli/commands
 */

import { WorkflowEngine } from '@musuhi-ng/core';
import type { WorkflowStage } from '@musuhi-ng/core';
import { Command } from 'commander';

export const workflowCommand = new Command('workflow').description('Manage SDD workflow stages');

// Direct stage commands (shortcuts)
// workflow research <topic>
workflowCommand
  .command('research')
  .description('Start research stage')
  .argument('<topic>', 'Research topic')
  .action((topic: string) => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      engine.startStage('research');

      // eslint-disable-next-line no-console
      console.log(`✓ Started research stage: ${topic}`);
      // eslint-disable-next-line no-console
      console.log('\nNext steps:');
      // eslint-disable-next-line no-console
      console.log(`  1. Document findings in docs/research/`);
      // eslint-disable-next-line no-console
      console.log(`  2. Complete: musuhi workflow complete research`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting research:', error);
      process.exit(1);
    }
  });

// workflow requirements
workflowCommand
  .command('requirements')
  .description('Start requirements stage')
  .action(() => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      engine.startStage('requirements');

      // eslint-disable-next-line no-console
      console.log('✓ Started requirements stage');
      // eslint-disable-next-line no-console
      console.log('\nNext steps:');
      // eslint-disable-next-line no-console
      console.log('  1. Write EARS-format requirements in docs/requirements/');
      // eslint-disable-next-line no-console
      console.log('  2. Complete: musuhi workflow complete requirements');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting requirements:', error);
      process.exit(1);
    }
  });

// workflow design
workflowCommand
  .command('design')
  .description('Start design stage')
  .action(() => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      engine.startStage('design');

      // eslint-disable-next-line no-console
      console.log('✓ Started design stage');
      // eslint-disable-next-line no-console
      console.log('\nNext steps:');
      // eslint-disable-next-line no-console
      console.log('  1. Create C4 diagrams and ADRs in docs/design/');
      // eslint-disable-next-line no-console
      console.log('  2. Complete: musuhi workflow complete design');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting design:', error);
      process.exit(1);
    }
  });

// workflow tasks
workflowCommand
  .command('tasks')
  .description('Start tasks stage')
  .action(() => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      engine.startStage('tasks');

      // eslint-disable-next-line no-console
      console.log('✓ Started tasks stage');
      // eslint-disable-next-line no-console
      console.log('\nNext steps:');
      // eslint-disable-next-line no-console
      console.log('  1. Create P-wave task plan in docs/tasks/');
      // eslint-disable-next-line no-console
      console.log('  2. Complete: musuhi workflow complete tasks');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting tasks:', error);
      process.exit(1);
    }
  });

// workflow execute (implementation + testing + deployment)
workflowCommand
  .command('execute')
  .description('Execute implementation, testing, and deployment')
  .action(() => {
    try {
      // eslint-disable-next-line no-console
      console.log('✓ Starting execution phases');
      // eslint-disable-next-line no-console
      console.log('\nStages:');
      // eslint-disable-next-line no-console
      console.log('  5. Implementation');
      // eslint-disable-next-line no-console
      console.log('  6. Testing');
      // eslint-disable-next-line no-console
      console.log('  7. Deployment');
      // eslint-disable-next-line no-console
      console.log('  8. Monitoring');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error starting execution:', error);
      process.exit(1);
    }
  });

// workflow status
workflowCommand
  .command('status')
  .description('Show current workflow status')
  .action(() => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      const summary = engine.getSummary();

      // eslint-disable-next-line no-console
      console.log('\n=== Workflow Status ===');
      // eslint-disable-next-line no-console
      console.log(`Current Stage: ${summary.currentStage}`);
      // eslint-disable-next-line no-console
      console.log(`Progress: ${summary.progress.toFixed(1)}%`);
      // eslint-disable-next-line no-console
      console.log(`\nCompleted Stages: ${summary.completedStages.length}`);
      for (const stage of summary.completedStages) {
        // eslint-disable-next-line no-console
        console.log(`  ✓ ${stage}`);
      }

      if (summary.blockedStages.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`\nBlocked Stages: ${summary.blockedStages.length}`);
        for (const stage of summary.blockedStages) {
          // eslint-disable-next-line no-console
          console.log(`  ✗ ${stage}`);
        }
      }

      // eslint-disable-next-line no-console
      console.log(`\nTotal Deliverables: ${summary.totalDeliverables}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting workflow status:', error);
      process.exit(1);
    }
  });

// workflow start
workflowCommand
  .command('start')
  .description('Start a workflow stage')
  .argument(
    '<stage>',
    'Stage to start (research, requirements, design, tasks, implementation, testing, deployment, monitoring)'
  )
  .action((stage: string) => {
    try {
      const engine = new WorkflowEngine(process.cwd());
      engine.startStage(stage as WorkflowStage);

      // eslint-disable-next-line no-console
      console.log(`✓ Started stage: ${stage}`);
      // eslint-disable-next-line no-console
      console.log('\nNext steps:');
      // eslint-disable-next-line no-console
      console.log(`  1. Complete ${stage} deliverables`);
      // eslint-disable-next-line no-console
      console.log(`  2. Run: musuhi workflow complete ${stage}`);
    } catch (error) {
      // eslint-disable-next-line no-console
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
  .action(() => {
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

    // eslint-disable-next-line no-console
    console.log('\n=== SDD Workflow Stages ===');
    for (let i = 0; i < stages.length; i++) {
      // eslint-disable-next-line no-console
      console.log(`${i + 1}. ${stages[i]}`);
    }
    // eslint-disable-next-line no-console
    console.log('\nUse "musuhi workflow start <stage>" to begin a stage');
  });
