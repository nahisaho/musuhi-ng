/**
 * Navigation Handler for keyboard interactions
 *
 * AC-6.8: Interactive Navigation
 * AC-6.9: Command Shortcuts
 *
 * @packageDocumentation
 */

import type { DashboardView } from '../types/dashboard.js';

/**
 * Navigation key names
 */
export type NavigationKey = 'up' | 'down' | 'left' | 'right' | 'enter' | 'escape';

/**
 * Command shortcut keys
 */
export type ShortcutKey = 'v' | 'l' | 's' | 'a' | 'q';

/**
 * NavigationHandler manages keyboard interactions
 *
 * AC-6.8: WHEN user presses navigation keys, Dashboard SHALL allow navigation
 * AC-6.9: WHEN user presses shortcuts (V/L/S/A/Q), Dashboard SHALL execute command
 */
export class NavigationHandler {
  private currentView: DashboardView = 'main';
  private focusedWidgetIndex: number = 0;
  private totalWidgets: number = 0;

  /**
   * Handles navigation key press
   *
   * @param key - Navigation key pressed
   * @returns True if navigation handled, false otherwise
   *
   * AC-6.8: Interactive navigation with arrow keys
   */
  handleNavigation(key: NavigationKey): boolean {
    switch (key) {
      case 'up':
        return this.navigateUp();
      case 'down':
        return this.navigateDown();
      case 'left':
        return this.navigateLeft();
      case 'right':
        return this.navigateRight();
      case 'enter':
        return this.handleEnter();
      case 'escape':
        return this.handleEscape();
      default:
        return false;
    }
  }

  /**
   * Handles command shortcut key press
   *
   * @param key - Shortcut key pressed
   * @returns Corresponding command or null
   *
   * AC-6.9: Command shortcuts (V/L/S/A/Q)
   */
  handleShortcut(key: string): string | null {
    const normalized = key.toLowerCase();

    switch (normalized) {
      case 'v':
        return 'view-logs';
      case 'l':
        return 'list-changes';
      case 's':
        return 'show-specs';
      case 'a':
        return 'show-agents';
      case 'q':
        return 'quit';
      default:
        return null;
    }
  }

  /**
   * Sets the current view
   *
   * @param view - New view to display
   */
  setView(view: DashboardView): void {
    this.currentView = view;
    this.focusedWidgetIndex = 0; // Reset focus when view changes
  }

  /**
   * Gets the current view
   *
   * @returns Current dashboard view
   */
  getView(): DashboardView {
    return this.currentView;
  }

  /**
   * Sets the total number of focusable widgets
   *
   * @param count - Total widget count
   */
  setWidgetCount(count: number): void {
    this.totalWidgets = count;
  }

  /**
   * Gets the currently focused widget index
   *
   * @returns Focused widget index (0-based)
   */
  getFocusedWidget(): number {
    return this.focusedWidgetIndex;
  }

  /**
   * Navigates focus to previous widget (up)
   *
   * @returns True if navigation occurred
   */
  private navigateUp(): boolean {
    if (this.focusedWidgetIndex > 0) {
      this.focusedWidgetIndex--;
      return true;
    }
    return false;
  }

  /**
   * Navigates focus to next widget (down)
   *
   * @returns True if navigation occurred
   */
  private navigateDown(): boolean {
    if (this.focusedWidgetIndex < this.totalWidgets - 1) {
      this.focusedWidgetIndex++;
      return true;
    }
    return false;
  }

  /**
   * Navigates to previous view (left)
   *
   * @returns True if navigation occurred
   */
  private navigateLeft(): boolean {
    const views: DashboardView[] = ['main', 'changes', 'specs', 'agents', 'logs'];
    const currentIndex = views.indexOf(this.currentView);

    if (currentIndex > 0) {
      const nextView = views[currentIndex - 1];
      if (nextView) {
        this.currentView = nextView;
        this.focusedWidgetIndex = 0;
        return true;
      }
    }
    return false;
  }

  /**
   * Navigates to next view (right)
   *
   * @returns True if navigation occurred
   */
  private navigateRight(): boolean {
    const views: DashboardView[] = ['main', 'changes', 'specs', 'agents', 'logs'];
    const currentIndex = views.indexOf(this.currentView);

    if (currentIndex < views.length - 1) {
      const nextView = views[currentIndex + 1];
      if (nextView) {
        this.currentView = nextView;
        this.focusedWidgetIndex = 0;
        return true;
      }
    }
    return false;
  }

  /**
   * Handles enter key press (select focused widget)
   *
   * @returns True if action occurred
   */
  private handleEnter(): boolean {
    // To be implemented: Trigger action on focused widget
    return true;
  }

  /**
   * Handles escape key press (return to main view)
   *
   * @returns True if action occurred
   */
  private handleEscape(): boolean {
    if (this.currentView !== 'main') {
      this.currentView = 'main';
      this.focusedWidgetIndex = 0;
      return true;
    }
    return false;
  }
}
