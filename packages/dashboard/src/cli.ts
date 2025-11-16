#!/usr/bin/env node

/**
 * Dashboard CLI Entry Point
 *
 * AC-6.1: musuhi view command launches interactive dashboard
 *
 * Usage:
 *   musuhi view [options]
 *   musuhi dashboard [options]
 *
 * Options:
 *   --project <path>  Project root directory (default: current directory)
 *   --help            Display help information
 */

import { launchDashboard } from './dashboard-tui.js';

/**
 * Parse command line arguments
 */
function parseArgs(): { projectRoot?: string; help?: boolean } {
  const args = process.argv.slice(2);
  const options: { projectRoot?: string; help?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--project' || arg === '-p') {
      options.projectRoot = args[i + 1];
      i++; // Skip next argument
    }
  }

  return options;
}

/**
 * Display help information
 */
function displayHelp(): void {
  console.log(`
MUSUHI 2.0 Dashboard

Usage:
  musuhi view [options]
  musuhi dashboard [options]

Options:
  --project, -p <path>  Project root directory (default: current directory)
  --help, -h            Display this help information

Description:
  Launch the interactive TUI dashboard to visualize:
  - 8-stage SDD workflow progress
  - Active changes and specifications
  - Agent status and current tasks
  - Parallel execution (P-wave) visualization

Keyboard Shortcuts:
  V     View main dashboard
  L     View activity logs
  S     Show specs view
  A     Show agents view
  Q     Quit dashboard
  R     Manual refresh
  ↑↓←→  Navigate widgets
  Esc   Return to main view

Examples:
  musuhi view                    # Launch dashboard in current directory
  musuhi view --project ~/myapp  # Launch dashboard for specific project
  `);
}

/**
 * Main CLI execution
 */
async function main(): Promise<void> {
  const options = parseArgs();

  // Display help if requested
  if (options.help) {
    displayHelp();
    process.exit(0);
  }

  // AC-6.1: Launch dashboard
  try {
    await launchDashboard(options.projectRoot);
  } catch (error) {
    console.error('Failed to launch dashboard:', error);
    process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
