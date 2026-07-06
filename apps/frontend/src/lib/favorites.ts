'use client';

import { authed } from './useApi';

export interface FavoriteRow { id: string; tutorId: string; createdAt: string }

export function listFavorites(): Promise<FavoriteRow[]> {
  return authed<FavoriteRow[]>('favorites');
}

export function addFavorite(tutorId: string): Promise<unknown> {
  return authed('favorites', { method: 'POST', body: { tutorId } });
}

export function removeFavorite(tutorId: string): Promise<unknown> {
  return authed(`favorites/${tutorId}`, { method: 'DELETE' });
}