/**
 * Availability Engine (Business Domain Model §8). Pure functions to reason about
 * whether a requested slot fits within a tutor's availability window and does not
 * collide with existing bookings. Time is absolute (UTC); callers pass Date
 * instances (DB Arch §13). No business rules (notice periods, buffers) are
 * invented here — those remain Pending Business Decisions.
 */
export interface TimeWindow {
  startAt: Date;
  endAt: Date;
}

export function isWithinWindow(slot: TimeWindow, window: TimeWindow): boolean {
  return slot.startAt >= window.startAt && slot.endAt <= window.endAt;
}

export function overlaps(a: TimeWindow, b: TimeWindow): boolean {
  return a.startAt < b.endAt && a.endAt > b.startAt;
}

export function isValidSlot(slot: TimeWindow): boolean {
  return slot.endAt > slot.startAt;
}

/** True if the slot fits an availability window and hits none of the busy slots. */
export function slotIsBookable(
  slot: TimeWindow,
  availability: TimeWindow[],
  busy: TimeWindow[],
): boolean {
  if (!isValidSlot(slot)) return false;
  const fits = availability.some((w) => isWithinWindow(slot, w));
  if (!fits) return false;
  return !busy.some((b) => overlaps(slot, b));
}
