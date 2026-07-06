import { canTransition, isTerminal } from './booking-status';

describe('Booking status machine (VR-003 governed transitions)', () => {
  it('allows REQUESTED -> CONFIRMED/REJECTED/CANCELLED', () => {
    expect(canTransition('REQUESTED', 'CONFIRMED')).toBe(true);
    expect(canTransition('REQUESTED', 'REJECTED')).toBe(true);
    expect(canTransition('REQUESTED', 'CANCELLED')).toBe(true);
  });
  it('allows CONFIRMED -> COMPLETED/CANCELLED only', () => {
    expect(canTransition('CONFIRMED', 'COMPLETED')).toBe(true);
    expect(canTransition('CONFIRMED', 'CANCELLED')).toBe(true);
    expect(canTransition('CONFIRMED', 'REQUESTED')).toBe(false);
  });
  it('forbids transitions out of terminal states', () => {
    expect(canTransition('COMPLETED', 'CANCELLED')).toBe(false);
    expect(canTransition('CANCELLED', 'CONFIRMED')).toBe(false);
    expect(canTransition('REJECTED', 'CONFIRMED')).toBe(false);
    expect(isTerminal('COMPLETED')).toBe(true);
    expect(isTerminal('REQUESTED')).toBe(false);
  });
});
