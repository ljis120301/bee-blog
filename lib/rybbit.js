'use client';

/**
 * Rybbit Analytics utility functions.
 * The base script is loaded in app/layout.js and handles automatic page view tracking.
 * These helpers provide access to custom event tracking, manual pageviews, and user identification.
 */

function getRybbit() {
  if (typeof window !== 'undefined' && window.rybbit) {
    return window.rybbit;
  }
  return null;
}

/**
 * Track a custom event.
 * @param {string} eventName - Name of the event (e.g. 'button_click', 'form_submit')
 * @param {Record<string, any>} [eventData] - Optional key-value data to attach to the event
 */
export function trackEvent(eventName, eventData) {
  const rybbit = getRybbit();
  if (rybbit && typeof rybbit.event === 'function') {
    rybbit.event(eventName, eventData);
  }
}

/**
 * Manually trigger a page view. Normally not needed as Rybbit auto-detects
 * route changes with Next.js <Link> and router.push().
 */
export function trackPageview() {
  const rybbit = getRybbit();
  if (rybbit && typeof rybbit.pageview === 'function') {
    rybbit.pageview();
  }
}

/**
 * Identify a user for tracking.
 * @param {string} userId - Unique user identifier
 * @param {Record<string, any>} [traits] - Optional user traits
 */
export function identify(userId, traits) {
  const rybbit = getRybbit();
  if (rybbit && typeof rybbit.identify === 'function') {
    rybbit.identify(userId, traits);
  }
}

/**
 * Set user traits without changing the user ID.
 * @param {Record<string, any>} traits - User traits to set
 */
export function setTraits(traits) {
  const rybbit = getRybbit();
  if (rybbit && typeof rybbit.setTraits === 'function') {
    rybbit.setTraits(traits);
  }
}

/**
 * Clear the current user ID and traits.
 */
export function clearUserId() {
  const rybbit = getRybbit();
  if (rybbit && typeof rybbit.clearUserId === 'function') {
    rybbit.clearUserId();
  }
}
