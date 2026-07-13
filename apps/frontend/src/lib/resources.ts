'use client';

import { authed } from './useApi';
import { buildApiUrl, ApiError } from './api-client';
import { getAccessToken } from './auth';

export interface ResourceRow {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  courseId: string | null;
  sizeBytes?: number;
  createdAt: string;
}

/** Tutor: list resources I uploaded. */
export function listMyResources(): Promise<ResourceRow[]> {
  return authed<ResourceRow[]>('resources/mine');
}

/** Tutor: upload a resource. Content travels as base64 (no multipart upload wired yet). */
export function uploadResource(input: {
  title: string;
  description?: string;
  contentBase64: string;
  contentType: string;
  courseId?: string;
}): Promise<ResourceRow> {
  return authed<ResourceRow>('resources', { method: 'POST', body: input });
}

export function deleteResource(id: string): Promise<unknown> {
  return authed(`resources/${id}`, { method: 'DELETE' });
}

/** Fetch a resource's binary content (authenticated) and trigger a browser download. */
export async function downloadResource(id: string, filename: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(buildApiUrl(`resources/${id}/content`), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, body ?? { error: { message: 'Download failed.' } });
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Read a File as a base64 string (without the data: URL prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
