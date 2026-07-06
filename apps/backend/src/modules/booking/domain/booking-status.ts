/**
 * Booking status state machine (Business Domain Model §7). Pure domain logic —
 * no framework/DB. Defines the permitted lifecycle transitions so state changes
 * are validated centrally (Requirements VR-003). Governed transitions only.
 */
export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminal(status: BookingStatus): boolean {
  return TRANSITIONS[status].length === 0;
}
