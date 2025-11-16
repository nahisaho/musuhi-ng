/**
 * Dashboard core components export barrel
 *
 * Re-exports event bus, refresh timer, and navigation handler.
 *
 * @packageDocumentation
 */

export { EventBus } from './event-bus.js';
export { RefreshTimer } from './refresh-timer.js';
export { NavigationHandler } from './navigation-handler.js';
export type { NavigationKey, ShortcutKey } from './navigation-handler.js';
