/**
 * Tests for NavigationHandler
 *
 * AC-6.8: Interactive Navigation
 * AC-6.9: Command Shortcuts
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NavigationHandler } from '../core/navigation-handler.js';

describe('NavigationHandler', () => {
  let handler: NavigationHandler;

  beforeEach(() => {
    handler = new NavigationHandler();
    handler.setWidgetCount(5); // 5 focusable widgets
  });

  describe('AC-6.8: Interactive Navigation', () => {
    it('should navigate up within widgets', () => {
      handler.handleNavigation('down'); // Focus widget 1
      handler.handleNavigation('down'); // Focus widget 2

      expect(handler.getFocusedWidget()).toBe(2);

      const navigated = handler.handleNavigation('up');
      expect(navigated).toBe(true);
      expect(handler.getFocusedWidget()).toBe(1);
    });

    it('should navigate down within widgets', () => {
      expect(handler.getFocusedWidget()).toBe(0);

      const navigated = handler.handleNavigation('down');
      expect(navigated).toBe(true);
      expect(handler.getFocusedWidget()).toBe(1);
    });

    it('should not navigate up past first widget', () => {
      expect(handler.getFocusedWidget()).toBe(0);

      const navigated = handler.handleNavigation('up');
      expect(navigated).toBe(false);
      expect(handler.getFocusedWidget()).toBe(0);
    });

    it('should not navigate down past last widget', () => {
      // Navigate to last widget
      for (let i = 0; i < 4; i++) {
        handler.handleNavigation('down');
      }

      expect(handler.getFocusedWidget()).toBe(4);

      const navigated = handler.handleNavigation('down');
      expect(navigated).toBe(false);
      expect(handler.getFocusedWidget()).toBe(4);
    });

    it('should navigate left to previous view', () => {
      handler.setView('changes');

      const navigated = handler.handleNavigation('left');
      expect(navigated).toBe(true);
      expect(handler.getView()).toBe('main');
    });

    it('should navigate right to next view', () => {
      handler.setView('main');

      const navigated = handler.handleNavigation('right');
      expect(navigated).toBe(true);
      expect(handler.getView()).toBe('changes');
    });

    it('should not navigate left past first view', () => {
      handler.setView('main');

      const navigated = handler.handleNavigation('left');
      expect(navigated).toBe(false);
      expect(handler.getView()).toBe('main');
    });

    it('should not navigate right past last view', () => {
      handler.setView('logs');

      const navigated = handler.handleNavigation('right');
      expect(navigated).toBe(false);
      expect(handler.getView()).toBe('logs');
    });

    it('should handle enter key', () => {
      const handled = handler.handleNavigation('enter');
      expect(handled).toBe(true);
    });

    it('should handle escape key to return to main view', () => {
      handler.setView('agents');

      const navigated = handler.handleNavigation('escape');
      expect(navigated).toBe(true);
      expect(handler.getView()).toBe('main');
    });

    it('should not escape from main view', () => {
      handler.setView('main');

      const navigated = handler.handleNavigation('escape');
      expect(navigated).toBe(false);
      expect(handler.getView()).toBe('main');
    });

    it('should reset focus when changing views', () => {
      handler.handleNavigation('down'); // Focus widget 1
      handler.handleNavigation('down'); // Focus widget 2

      expect(handler.getFocusedWidget()).toBe(2);

      handler.setView('changes');
      expect(handler.getFocusedWidget()).toBe(0); // Reset to first widget
    });
  });

  describe('AC-6.9: Command Shortcuts', () => {
    it('should handle "V" shortcut for view logs', () => {
      const command = handler.handleShortcut('v');
      expect(command).toBe('view-logs');
    });

    it('should handle "L" shortcut for list changes', () => {
      const command = handler.handleShortcut('l');
      expect(command).toBe('list-changes');
    });

    it('should handle "S" shortcut for show specs', () => {
      const command = handler.handleShortcut('s');
      expect(command).toBe('show-specs');
    });

    it('should handle "A" shortcut for show agents', () => {
      const command = handler.handleShortcut('a');
      expect(command).toBe('show-agents');
    });

    it('should handle "Q" shortcut for quit', () => {
      const command = handler.handleShortcut('q');
      expect(command).toBe('quit');
    });

    it('should be case-insensitive', () => {
      expect(handler.handleShortcut('V')).toBe('view-logs');
      expect(handler.handleShortcut('v')).toBe('view-logs');
      expect(handler.handleShortcut('L')).toBe('list-changes');
      expect(handler.handleShortcut('l')).toBe('list-changes');
    });

    it('should return null for unknown shortcuts', () => {
      const command = handler.handleShortcut('x');
      expect(command).toBeNull();
    });
  });

  describe('View Management', () => {
    it('should get and set current view', () => {
      expect(handler.getView()).toBe('main');

      handler.setView('agents');
      expect(handler.getView()).toBe('agents');
    });

    it('should update widget count', () => {
      handler.setWidgetCount(10);

      // Should be able to navigate to widget 9 (0-indexed)
      for (let i = 0; i < 9; i++) {
        handler.handleNavigation('down');
      }

      expect(handler.getFocusedWidget()).toBe(9);

      // Should not navigate past last widget
      const navigated = handler.handleNavigation('down');
      expect(navigated).toBe(false);
    });
  });
});
