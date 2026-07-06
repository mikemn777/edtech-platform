import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { BookingService } from './application/booking.service';
import { CalendarService } from './application/calendar.service';
import { CancelBookingDto, CreateBookingDto } from './contracts/booking.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2B_PERMISSIONS } from '../../shared/permission/permission-keys.phase2b';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';
import type { BookingStatus } from './domain/booking-status';

/** Booking System endpoints — workflow, status, calendar (Business Domain Model §7-9). */
@ApiTags('booking')
@ApiBearerAuth('access-token')
@Controller({ path: 'bookings', version: '1' })
export class BookingController {
  constructor(
    private readonly bookings: BookingService,
    private readonly calendar: CalendarService,
  ) {}

  @Post()
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.BOOKING_CREATE)
  @ApiOperation({ summary: 'Request a booking (structural; no payment — rules PBD)' })
  request(
    @Body() dto: CreateBookingDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.bookings.request(dto, actor.accountId, req.correlationId);
  }

  @Get(':id')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.BOOKING_READ)
  @ApiOperation({ summary: 'Get a booking with its status history' })
  get(@Param('id') id: string) {
    return this.bookings.getById(id);
  }

  @Post(':id/confirm')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.BOOKING_DECIDE)
  @ApiOperation({ summary: 'Confirm a requested booking (tutor/admin)' })
  confirm(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.bookings.transition(id, 'CONFIRMED', actor.accountId, undefined, req.correlationId);
  }

  @Post(':id/reject')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.BOOKING_DECIDE)
  @ApiOperation({ summary: 'Reject a requested booking (tutor/admin)' })
  reject(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.bookings.transition(id, 'REJECTED', actor.accountId, dto.reason, req.correlationId);
  }

  @Post(':id/cancel')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.BOOKING_CANCEL)
  @ApiOperation({ summary: 'Cancel a booking (no penalty applied — policy PBD)' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.bookings.transition(id, 'CANCELLED', actor.accountId, dto.reason, req.correlationId);
  }

  @Post(':id/complete')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.BOOKING_DECIDE)
  @ApiOperation({ summary: 'Mark a confirmed booking completed' })
  complete(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedPrincipal,
    @Req() req: Request & { correlationId?: string },
  ) {
    return this.bookings.transition(id, 'COMPLETED', actor.accountId, undefined, req.correlationId);
  }

  @Get('tutors/:tutorId/list')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.BOOKING_READ)
  @ApiOperation({ summary: 'List a tutor’s bookings (optional status filter)' })
  @ApiQuery({ name: 'status', required: false })
  listForTutor(@Param('tutorId') tutorId: string, @Query('status') status?: BookingStatus) {
    return this.bookings.listForTutor(tutorId, status);
  }

  @Get('tutors/:tutorId/calendar')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.BOOKING_READ)
  @ApiOperation({ summary: 'Tutor calendar (availability + bookings) for a date range' })
  @ApiQuery({ name: 'from', required: true, example: '2026-08-01T00:00:00Z' })
  @ApiQuery({ name: 'to', required: true, example: '2026-08-31T23:59:59Z' })
  calendarView(
    @Param('tutorId') tutorId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.calendar.tutorCalendar(tutorId, new Date(from), new Date(to));
  }
}
