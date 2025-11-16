/**
 * AC-6.1: Dashboard TUI Main Orchestrator
 * WHEN user runs `musuhi view`, the system SHALL launch interactive dashboard
 *
 * Main TUI orchestrator that:
 * - Initializes blessed screen and grid layout
 * - Creates all view components
 * - Wires event bus for real-time updates
 * - Handles keyboard navigation and shortcuts
 * - Loads dashboard state from .musuhi directory
 */

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { EventBus } from './core/event-bus.js';
import { NavigationHandler } from './core/navigation-handler.js';
import { RefreshTimer } from './core/refresh-timer.js';
import {
  WorkflowStatusView,
  ActiveChangesView,
  CurrentSpecsView,
  ActiveAgentsView,
  PWaveView,
  LogView,
} from './views/index.js';
import type { DashboardState, DashboardView } from './types/index.js';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * DashboardTUI - Main Interactive Dashboard
 *
 * AC-6.1: Launch dashboard with `musuhi view` command
 *
 * Features:
 * - 12x12 grid layout with 6 view components
 * - Real-time updates (2s refresh, AC-6.7)
 * - Keyboard navigation (AC-6.8)
 * - Command shortcuts (AC-6.9)
 * - State loading from .musuhi directory
 */
export class DashboardTUI {
  private screen: blessed.Widgets.Screen;
  private grid: any; // blessed-contrib grid
  private eventBus: EventBus;
  private navigationHandler: NavigationHandler;
  private refreshTimer: RefreshTimer;
  private state: DashboardState;

  // View components
  private workflowView!: WorkflowStatusView;
  private changesView!: ActiveChangesView;
  private specsView!: CurrentSpecsView;
  private agentsView!: ActiveAgentsView;
  private pWaveView!: PWaveView;
  private logView!: LogView;

  /**
   * Initialize Dashboard TUI
   * AC-6.1: Initialize TUI components
   *
   * @param projectRoot - Project root directory (defaults to cwd)
   */
  constructor(private projectRoot: string = process.cwd()) {
    // AC-6.1: Initialize blessed screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'MUSUHI 2.0 Dashboard',
      fullUnicode: true,
    });

    // Create 12x12 grid layout
    this.grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen });

    // Initialize core infrastructure
    this.eventBus = new EventBus();
    this.navigationHandler = new NavigationHandler();
    this.refreshTimer = new RefreshTimer(2000, () => this.refresh()); // AC-6.7: 2s refresh

    // Initialize default state
    this.state = this.createInitialState();
  }

  /**
   * Launch dashboard
   * AC-6.1: Launch interactive dashboard
   */
  async launch(): Promise<void> {
    try {
      // Load initial state from project directory
      await this.loadState();

      // Setup view components
      this.setupLayout();

      // Setup keyboard bindings (AC-6.8, AC-6.9)
      this.setupKeyBindings();

      // Setup event listeners
      this.setupEventListeners();

      // Initial render
      this.render();

      // Start refresh timer (AC-6.7: 2s automatic refresh)
      this.refreshTimer.start();

      // Render screen
      this.screen.render();

      this.logView.logMessage('Dashboard launched successfully');
    } catch (error) {
      console.error('Failed to launch dashboard:', error);
      process.exit(1);
    }
  }

  /**
   * Setup grid layout and view components
   * AC-6.2 through AC-6.6: Create all view components
   */
  private setupLayout(): void {
    // Row 0-1: Workflow Status (AC-6.2)
    this.workflowView = new WorkflowStatusView(this.grid, 0, 0);

    // Row 2-5: Active Changes (AC-6.3) + Current Specs (AC-6.4)
    this.changesView = new ActiveChangesView(this.grid, 2, 0);
    this.specsView = new CurrentSpecsView(this.grid, 2, 6);

    // Row 6-8: Active Agents (AC-6.5)
    this.agentsView = new ActiveAgentsView(this.grid, 6, 0);

    // Row 9-11: P-Wave Visualization (AC-6.6)
    this.pWaveView = new PWaveView(this.grid, 9, 0);

    // Activity log view
    this.logView = new LogView(this.grid, 0, 0);
  }

  /**
   * Setup keyboard bindings
   * AC-6.8: Interactive navigation with arrow keys
   * AC-6.9: Command shortcuts (V/L/S/A/Q)
   */
  private setupKeyBindings(): void {
    // AC-6.9: Command shortcuts
    this.screen.key(['v', 'V'], () => this.showView('main'));
    this.screen.key(['l', 'L'], () => this.showLogs());
    this.screen.key(['s', 'S'], () => this.showView('specs'));
    this.screen.key(['a', 'A'], () => this.showView('agents'));
    this.screen.key(['q', 'Q', 'C-c'], () => this.quit());

    // AC-6.8: Interactive navigation with arrow keys
    this.screen.key(['up', 'down', 'left', 'right'], (_ch, key) => {
      this.navigationHandler.handleNavigation(key.name as 'up' | 'down' | 'left' | 'right');
    });

    // Manual refresh on 'r' or 'R'
    this.screen.key(['r', 'R'], () => {
      this.logView.logMessage('Manual refresh triggered');
      this.refresh();
    });
  }

  /**
   * Setup event listeners for event bus
   * AC-6.7: Real-time updates via event bus
   */
  private setupEventListeners(): void {
    // Listen to navigation events
    this.eventBus.onNavigate((direction) => {
      this.logView.logMessage(`Navigated ${direction}`);
    });

    // Listen to shortcut events
    this.eventBus.onShortcut((key) => {
      this.logView.logMessage(`Shortcut pressed: ${key}`);
    });

    // Listen to state change events
    this.eventBus.onStateChange((state: DashboardState) => {
      this.state = state;
      this.render();
    });
  }

  /**
   * Refresh dashboard state
   * AC-6.7: Real-time updates with <100ms performance (NFR-P.1)
   */
  private async refresh(): Promise<void> {
    const startTime = Date.now();

    try {
      // Fetch latest state
      await this.loadState();

      // Re-render views
      this.render();

      const duration = Date.now() - startTime;

      // NFR-P.1: <100ms refresh
      if (duration > 100) {
        this.logView.logMessage(`Slow refresh: ${duration}ms (>100ms target)`);
      }
    } catch (error) {
      this.logView.logMessage(
        `Refresh failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Render all view components
   * AC-6.2 through AC-6.6: Render workflow, changes, specs, agents, P-wave
   */
  private render(): void {
    this.workflowView.render(this.state);
    this.changesView.render(this.state);
    this.specsView.render(this.state);
    this.agentsView.render(this.state);
    this.pWaveView.render(this.state);

    this.screen.render();
  }

  /**
   * Load dashboard state from .musuhi directory
   * Reads workflow status, changes, specs from file system
   */
  private async loadState(): Promise<void> {
    try {
      // Load state from .musuhi directory
      const musuhiDir = path.join(this.projectRoot, '.musuhi');

      // Load workflow status
      const workflowPath = path.join(musuhiDir, 'workflow-status.json');
      if (await this.fileExists(workflowPath)) {
        const workflowData = JSON.parse(await fs.readFile(workflowPath, 'utf-8'));
        this.state.workflowStage = workflowData.stage || 'requirements';
        this.state.workflowProgress = workflowData.progress || 0;
      }

      // Load changes from changes/ directory
      const changesDir = path.join(musuhiDir, 'changes');
      if (await this.fileExists(changesDir)) {
        const files = await fs.readdir(changesDir);
        this.state.activeChanges = await Promise.all(
          files
            .filter((f) => f.endsWith('.json'))
            .map(async (f) => {
              const content = await fs.readFile(path.join(changesDir, f), 'utf-8');
              return JSON.parse(content);
            })
        );
      }

      // Load specs from specs/ directory
      const specsDir = path.join(musuhiDir, 'specs');
      if (await this.fileExists(specsDir)) {
        const files = await fs.readdir(specsDir);
        this.state.currentSpecs = await Promise.all(
          files
            .filter((f) => f.endsWith('.md'))
            .map(async (f) => {
              const filePath = path.join(specsDir, f);
              const content = await fs.readFile(filePath, 'utf-8');
              const stats = await fs.stat(filePath);
              const reqCount = (content.match(/AC-\d+\.\d+/g) || []).length;

              return {
                id: f,
                fileName: f,
                requirementCount: reqCount,
                lastModified: stats.mtime,
              };
            })
        );
      }

      this.state.lastUpdate = new Date();
    } catch (error) {
      // Use default state if loading fails
      this.logView?.logMessage(
        `State loading failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create initial dashboard state
   */
  private createInitialState(): DashboardState {
    return {
      currentView: 'main',
      workflowStage: 'requirements',
      workflowProgress: 0,
      activeChanges: [],
      currentSpecs: [],
      activeAgents: [],
      logs: [],
      lastUpdate: new Date(),
    };
  }

  /**
   * Check if file exists
   */
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Show specified view
   * AC-6.9: Command shortcuts to switch views
   */
  private showView(view: DashboardView): void {
    this.state.currentView = view;
    this.eventBus.emitShortcut(view);
    this.render();
  }

  /**
   * Show activity logs
   * AC-6.9: 'L' shortcut to view logs
   */
  private showLogs(): void {
    this.logView.logMessage('Viewing logs...');
    this.render();
  }

  /**
   * Quit dashboard
   * AC-6.9: 'Q' shortcut to quit
   */
  private quit(): void {
    this.refreshTimer.stop();
    this.logView.logMessage('Dashboard shutting down...');
    this.screen.destroy();
    process.exit(0);
  }

  /**
   * Navigate to previous view (for NavigationHandler)
   */
  previousView(): void {
    this.logView.logMessage('Navigate previous');
  }

  /**
   * Navigate to next view (for NavigationHandler)
   */
  nextView(): void {
    this.logView.logMessage('Navigate next');
  }
}

/**
 * Launch dashboard function for CLI integration
 * AC-6.1: musuhi view command
 *
 * @param projectRoot - Optional project root directory
 */
export async function launchDashboard(projectRoot?: string): Promise<void> {
  const dashboard = new DashboardTUI(projectRoot);
  await dashboard.launch();
}
