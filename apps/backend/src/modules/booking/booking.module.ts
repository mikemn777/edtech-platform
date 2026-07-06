import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './application/booking.service';
import { CalendarService } from './application/calendar.service';

/**
 * Booking module (Business Domain Model §7-9). Scheduling + availability engine +
 * workflow + status + calendar. Commercial and minor-consent rules remain
 * Pending Business Decisions and are gated, not invented.
 */
@Module({
  controllers: [BookingController],
  providers: [BookingService, CalendarService],
  exports: [BookingService, CalendarService],
})
export class BookingModule {}
