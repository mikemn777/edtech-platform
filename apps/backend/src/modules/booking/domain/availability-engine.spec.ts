import { overlaps, slotIsBookable, isValidSlot } from './availability-engine';

const d = (iso: string) => new Date(iso);

describe('Availability engine (EC-004 conflict handling)', () => {
  it('rejects a zero/negative-length slot', () => {
    expect(isValidSlot({ startAt: d('2026-08-01T10:00:00Z'), endAt: d('2026-08-01T10:00:00Z') })).toBe(false);
  });
  it('detects overlaps correctly', () => {
    const a = { startAt: d('2026-08-01T10:00:00Z'), endAt: d('2026-08-01T11:00:00Z') };
    const b = { startAt: d('2026-08-01T10:30:00Z'), endAt: d('2026-08-01T11:30:00Z') };
    const c = { startAt: d('2026-08-01T11:00:00Z'), endAt: d('2026-08-01T12:00:00Z') };
    expect(overlaps(a, b)).toBe(true);
    expect(overlaps(a, c)).toBe(false); // touching edges do not overlap
  });
  it('is bookable only within availability and free of busy slots', () => {
    const slot = { startAt: d('2026-08-01T10:00:00Z'), endAt: d('2026-08-01T11:00:00Z') };
    const availability = [{ startAt: d('2026-08-01T09:00:00Z'), endAt: d('2026-08-01T12:00:00Z') }];
    expect(slotIsBookable(slot, availability, [])).toBe(true);
    expect(slotIsBookable(slot, availability, [slot])).toBe(false); // collision
    expect(slotIsBookable(slot, [], [])).toBe(false); // no availability
  });
});
