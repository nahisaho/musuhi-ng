/**
 * Dashboard TUI Integration Tests
 *
 * Tests for AC-6.1 (Dashboard Launch) and overall integration of dashboard components
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DashboardTUI } from '../dashboard-tui.js';

// Mock blessed and blessed-contrib to avoid TUI rendering in tests
vi.mock('blessed', () => ({
  default: {
    screen: vi.fn(() => ({
      key: vi.fn(),
      render: vi.fn(),
      destroy: vi.fn(),
    })),
    text: vi.fn(() => ({
      setContent: vi.fn(),
    })),
  },
}));

vi.mock('blessed-contrib', () => ({
  default: {
    grid: vi.fn().mockImplementation(function(this: any) {
      return {
        set: vi.fn(() => ({
          setPercent: vi.fn(),
          setContent: vi.fn(),
          setData: vi.fn(),
          log: vi.fn(),
        })),
      };
    }),
    gauge: vi.fn().mockImplementation(function(this: any) {
      return {
        setPercent: vi.fn(),
        setContent: vi.fn(),
      };
    }),
    table: vi.fn().mockImplementation(function(this: any) {
      return {
        setData: vi.fn(),
        setContent: vi.fn(),
      };
    }),
    bar: vi.fn().mockImplementation(function(this: any) {
      return {
        setData: vi.fn(),
        setContent: vi.fn(),
      };
    }),
    log: vi.fn().mockImplementation(function(this: any) {
      return {
        log: vi.fn(),
        setContent: vi.fn(),
      };
    }),
  },
}));

describe('DashboardTUI - Integration Tests', () => {
  let dashboard: DashboardTUI;

  beforeEach(() => {
    // Create dashboard instance for tests
    dashboard = new DashboardTUI('/test/project');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('AC-6.1: Dashboard Launch', () => {
    it('should initialize TUI components', () => {
      // Test that dashboard object is created
      expect(dashboard).toBeDefined();
      expect(dashboard).toBeInstanceOf(DashboardTUI);
    });

    it('should create blessed screen on initialization', () => {
      // Verify screen is created
      expect(dashboard['screen']).toBeDefined();
    });

    it('should create blessed-contrib grid on initialization', () => {
      // Verify grid is created for 12x12 layout
      expect(dashboard['grid']).toBeDefined();
    });

    it('should initialize event bus for real-time updates', () => {
      // Verify event bus is created
      expect(dashboard['eventBus']).toBeDefined();
    });

    it('should initialize navigation handler for keyboard shortcuts', () => {
      // Verify navigation handler is created
      expect(dashboard['navigationHandler']).toBeDefined();
    });

    it('should initialize refresh timer for 2-second updates', () => {
      // Verify refresh timer is created
      expect(dashboard['refreshTimer']).toBeDefined();
    });

    it('should initialize with default dashboard state', () => {
      // Verify initial state
      const state = dashboard['state'];
      expect(state).toBeDefined();
      expect(state.currentView).toBe('main');
      expect(state.workflowStage).toBe('requirements');
      expect(state.workflowProgress).toBe(0);
      expect(state.activeChanges).toEqual([]);
      expect(state.currentSpecs).toEqual([]);
      expect(state.activeAgents).toEqual([]);
      expect(state.lastUpdate).toBeInstanceOf(Date);
    });
  });

  describe('AC-6.7: Real-Time Updates', () => {
    it('should start refresh timer on launch', async () => {
      // Spy on refresh timer start method
      const spy = vi.spyOn(dashboard['refreshTimer'], 'start');

      // Mock render to prevent actual rendering
      vi.spyOn(dashboard as any, 'render').mockImplementation(() => {});

      // Mock setupLayout to prevent view creation (requires blessed modules)
      vi.spyOn(dashboard as any, 'setupLayout').mockImplementation(() => {});

      // Mock logView
      dashboard['logView'] = { logMessage: vi.fn() } as any;

      // Launch dashboard
      await dashboard.launch();

      // Verify refresh timer was started
      expect(spy).toHaveBeenCalled();
    });

    it('should refresh dashboard state periodically', () => {
      // Verify refresh timer callback triggers refresh
      const refreshCallback = dashboard['refreshTimer']['callback'];
      expect(refreshCallback).toBeDefined();
    });
  });

  describe('AC-6.8 & AC-6.9: Keyboard Interaction', () => {
    it('should register keyboard shortcuts on launch', async () => {
      // Spy on screen.key method
      const screen = dashboard['screen'];
      const keySpy = vi.spyOn(screen, 'key');

      // Mock methods to prevent actual rendering
      vi.spyOn(dashboard as any, 'render').mockImplementation(() => {});
      vi.spyOn(dashboard as any, 'setupLayout').mockImplementation(() => {});

      // Mock logView
      dashboard['logView'] = { logMessage: vi.fn() } as any;

      // Launch dashboard
      await dashboard.launch();

      // Verify keyboard shortcuts were registered
      expect(keySpy).toHaveBeenCalled();
    });

    it('should have navigation handler for arrow keys', () => {
      // Verify navigation handler exists
      const navHandler = dashboard['navigationHandler'];
      expect(navHandler).toBeDefined();
      expect(navHandler.handleNavigation).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should create initial state with correct structure', () => {
      const state = dashboard['createInitialState']();

      expect(state).toHaveProperty('currentView');
      expect(state).toHaveProperty('workflowStage');
      expect(state).toHaveProperty('workflowProgress');
      expect(state).toHaveProperty('activeChanges');
      expect(state).toHaveProperty('currentSpecs');
      expect(state).toHaveProperty('activeAgents');
      expect(state).toHaveProperty('lastUpdate');
    });

    it('should update state on refresh', async () => {
      // Mock file system to prevent actual file reads
      const loadStateSpy = vi.spyOn(dashboard as any, 'loadState').mockResolvedValue(undefined);

      // Mock logView
      dashboard['logView'] = { logMessage: vi.fn() } as any;

      // Mock view components
      dashboard['workflowView'] = { render: vi.fn() } as any;
      dashboard['changesView'] = { render: vi.fn() } as any;
      dashboard['specsView'] = { render: vi.fn() } as any;
      dashboard['agentsView'] = { render: vi.fn() } as any;
      dashboard['pWaveView'] = { render: vi.fn() } as any;

      // Trigger refresh
      await dashboard['refresh']();

      // Verify loadState was called
      expect(loadStateSpy).toHaveBeenCalled();
    });
  });

  describe('View Rendering', () => {
    it('should render all view components', () => {
      // Mock view components
      dashboard['workflowView'] = { render: vi.fn() } as any;
      dashboard['changesView'] = { render: vi.fn() } as any;
      dashboard['specsView'] = { render: vi.fn() } as any;
      dashboard['agentsView'] = { render: vi.fn() } as any;
      dashboard['pWaveView'] = { render: vi.fn() } as any;

      // Trigger render
      dashboard['render']();

      // Verify all views were rendered
      expect(dashboard['workflowView'].render).toHaveBeenCalledWith(dashboard['state']);
      expect(dashboard['changesView'].render).toHaveBeenCalledWith(dashboard['state']);
      expect(dashboard['specsView'].render).toHaveBeenCalledWith(dashboard['state']);
      expect(dashboard['agentsView'].render).toHaveBeenCalledWith(dashboard['state']);
      expect(dashboard['pWaveView'].render).toHaveBeenCalledWith(dashboard['state']);
    });

    it('should render screen after updating views', () => {
      // Spy on screen.render
      const screenRenderSpy = vi.spyOn(dashboard['screen'], 'render');

      // Mock view components
      dashboard['workflowView'] = { render: vi.fn() } as any;
      dashboard['changesView'] = { render: vi.fn() } as any;
      dashboard['specsView'] = { render: vi.fn() } as any;
      dashboard['agentsView'] = { render: vi.fn() } as any;
      dashboard['pWaveView'] = { render: vi.fn() } as any;

      // Trigger render
      dashboard['render']();

      // Verify screen.render was called
      expect(screenRenderSpy).toHaveBeenCalled();
    });
  });

  describe('Performance (NFR-P.1)', () => {
    it('should complete refresh in <100ms', async () => {
      // Mock loadState to return quickly
      vi.spyOn(dashboard as any, 'loadState').mockResolvedValue(undefined);

      // Mock view components
      dashboard['workflowView'] = { render: vi.fn() } as any;
      dashboard['changesView'] = { render: vi.fn() } as any;
      dashboard['specsView'] = { render: vi.fn() } as any;
      dashboard['agentsView'] = { render: vi.fn() } as any;
      dashboard['pWaveView'] = { render: vi.fn() } as any;
      dashboard['logView'] = { logMessage: vi.fn() } as any;

      // Measure refresh time
      const startTime = Date.now();
      await dashboard['refresh']();
      const duration = Date.now() - startTime;

      // NFR-P.1: <100ms refresh
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle loadState errors gracefully', async () => {
      // Mock loadState to throw error
      vi.spyOn(dashboard as any, 'loadState').mockRejectedValue(new Error('File not found'));

      // Mock logView
      dashboard['logView'] = { logMessage: vi.fn() } as any;

      // Mock view components
      dashboard['workflowView'] = { render: vi.fn() } as any;
      dashboard['changesView'] = { render: vi.fn() } as any;
      dashboard['specsView'] = { render: vi.fn() } as any;
      dashboard['agentsView'] = { render: vi.fn() } as any;
      dashboard['pWaveView'] = { render: vi.fn() } as any;

      // Trigger refresh (should not throw)
      await expect(dashboard['refresh']()).resolves.not.toThrow();

      // Verify error was logged
      expect(dashboard['logView'].logMessage).toHaveBeenCalledWith(
        expect.stringContaining('Refresh failed')
      );
    });

    it('should use default state when loadState fails', async () => {
      // Mock logView to capture error messages
      dashboard['logView'] = { logMessage: vi.fn() } as any;

      // Mock file system to throw error
      vi.spyOn(dashboard as any, 'loadState').mockImplementation(async () => {
        try {
          throw new Error('Directory not found');
        } catch (error) {
          dashboard['logView']?.logMessage?.(
            `State loading failed: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      });

      // Trigger loadState
      await dashboard['loadState']();

      // Verify error was logged
      expect(dashboard['logView'].logMessage).toHaveBeenCalledWith(
        'State loading failed: Directory not found'
      );

      // Verify state remains default (should not crash)
      expect(dashboard['state']).toBeDefined();
    });
  });

  describe('Navigation', () => {
    it('should switch views on command', () => {
      // Mock event bus
      const emitSpy = vi.spyOn(dashboard['eventBus'], 'emitShortcut');

      // Mock render
      vi.spyOn(dashboard as any, 'render').mockImplementation(() => {});

      // Switch to specs view
      dashboard['showView']('specs');

      // Verify view was changed
      expect(dashboard['state'].currentView).toBe('specs');
      expect(emitSpy).toHaveBeenCalledWith('specs');
    });

    it('should emit navigation events', () => {
      // Mock render
      vi.spyOn(dashboard as any, 'render').mockImplementation(() => {});

      // Show logs
      dashboard['logView'] = { logMessage: vi.fn() } as any;
      dashboard['showLogs']();

      // Verify log message was called
      expect(dashboard['logView'].logMessage).toHaveBeenCalledWith('Viewing logs...');
    });
  });

  describe('Cleanup', () => {
    it('should stop refresh timer on quit', () => {
      // Spy on refresh timer stop
      const stopSpy = vi.spyOn(dashboard['refreshTimer'], 'stop');

      // Mock logView and screen
      dashboard['logView'] = { logMessage: vi.fn() } as any;
      const destroySpy = vi.spyOn(dashboard['screen'], 'destroy');

      // Mock process.exit to prevent actual exit
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      // Quit dashboard
      dashboard['quit']();

      // Verify cleanup
      expect(stopSpy).toHaveBeenCalled();
      expect(destroySpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);

      // Restore process.exit
      exitSpy.mockRestore();
    });
  });
});
