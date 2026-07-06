import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './application/favorites.service';
import { AddFavoriteDto } from './contracts/favorite.dto';
import { CurrentUser } from '../../shared/authz/authz.decorators';
import { RequirePermissionKeys } from '../../shared/authz/require-permission-keys.decorator';
import { PHASE2B_PERMISSIONS } from '../../shared/permission/permission-keys.phase2b';
import type { AuthenticatedPrincipal } from '../../shared/identity/request-context';

/** Favorites — scoped to the caller's own account (self-scope by construction). */
@ApiTags('favorites')
@ApiBearerAuth('access-token')
@Controller({ path: 'favorites', version: '1' })
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.FAVORITE_MANAGE)
  @ApiOperation({ summary: 'List my favorite tutors' })
  list(@CurrentUser() actor: AuthenticatedPrincipal) {
    return this.favorites.list(actor.accountId);
  }

  @Post()
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.FAVORITE_MANAGE)
  @ApiOperation({ summary: 'Add a tutor to favorites' })
  add(@Body() dto: AddFavoriteDto, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.favorites.add(actor.accountId, dto.tutorId);
  }

  @Delete(':tutorId')
  @RequirePermissionKeys(PHASE2B_PERMISSIONS.FAVORITE_MANAGE)
  @ApiOperation({ summary: 'Remove a tutor from favorites' })
  remove(@Param('tutorId') tutorId: string, @CurrentUser() actor: AuthenticatedPrincipal) {
    return this.favorites.remove(actor.accountId, tutorId);
  }
}
