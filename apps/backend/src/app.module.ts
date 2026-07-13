import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './platform/config/config.module';
import { AppLoggingModule } from './platform/logging/logging.module';
import { SecurityModule } from './platform/security/security.module';
import { HealthModule } from './platform/health/health.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';
import { CorrelationMiddleware } from './platform/http/correlation.middleware';

// Domain modules (Implementation Blueprint §20 — dependency order)
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { CountriesModule } from './modules/countries/countries.module';
import { LocalizationModule } from './modules/localization/localization.module';
import { SettingsModule } from './modules/settings/settings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';

// Phase 2 — Core Marketplace Foundation (actor domains). Additive registration
// only; no Phase 1 module is modified.
import { StudentModule } from './modules/student/student.module';
import { ParentModule } from './modules/parent/parent.module';
import { TutorModule } from './modules/tutor/tutor.module';
import { TutorVerificationModule } from './modules/tutor-verification/tutor-verification.module';
import { TutorAvailabilityModule } from './modules/tutor-availability/tutor-availability.module';
import { RelationshipModule } from './modules/relationships/relationship.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';

// Phase 2b — Core Business Platform (catalog, learning, favorites, booking).
// Additive registration only.
import { TutorCatalogModule } from './modules/tutor-catalog/tutor-catalog.module';
import { TutorDashboardModule } from './modules/tutor-dashboard/tutor-dashboard.module';
import { LearningModule } from './modules/learning/learning.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ChildMonitoringModule } from './modules/child-monitoring/child-monitoring.module';
import { BookingModule } from './modules/booking/booking.module';

// Phase 3 — Learning Delivery, Communication, Intelligence. Additive only.
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { LiveSessionsModule } from './modules/live-sessions/live-sessions.module';
import { NotificationChannelsModule } from './modules/notification-channels/notification-channels.module';
import { AIModule } from './modules/ai/ai.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { NotesModule } from './modules/notes/notes.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { StudentProgressModule } from './modules/student-progress/student-progress.module';

/**
 * Root module. Composes the platform foundation and the Phase 1 domain modules
 * in dependency order (Blueprint §20): platform/config first, then identity &
 * authorization, then user management and the configurable-reference modules,
 * with audit/notifications/storage as cross-cutting infrastructure.
 *
 * Global authentication + RBAC guards are registered by AuthorizationModule, so
 * the entire API is deny-by-default unless a route is explicitly @Public.
 */
@Module({
  imports: [
    // ---- Platform foundation ----
    AppConfigModule,
    AppLoggingModule,
    PrismaModule,
    RedisModule,
    SecurityModule,
    HealthModule,
    // ---- Cross-cutting infrastructure ----
    AuditModule,
    NotificationsModule,
    FileStorageModule,
    LocalizationModule,
    SettingsModule,
    // ---- Identity & authorization ----
    AuthModule,
    AuthorizationModule,
    // ---- Domain modules (Phase 1) ----
    UserManagementModule,
    CountriesModule,
    // ---- Domain modules (Phase 2 — Core Marketplace Foundation) ----
    StudentModule,
    ParentModule,
    TutorModule,
    TutorVerificationModule,
    TutorAvailabilityModule,
    RelationshipModule,
    MarketplaceModule,
    // ---- Domain modules (Phase 2b — Core Business Platform) ----
    TutorCatalogModule,
    TutorDashboardModule,
    LearningModule,
    AssignmentsModule,
    AssessmentsModule,
    FavoritesModule,
    ChildMonitoringModule,
    BookingModule,
    // ---- Domain modules (Phase 3 — Learning Delivery, Communication, Intelligence) ----
    CurriculumModule,
    LiveSessionsModule,
    NotificationChannelsModule,
    AIModule,
    ResourcesModule,
    NotesModule,
    CertificatesModule,
    StudentProgressModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Correlation + language resolution runs first for every route (§12, §14).
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
