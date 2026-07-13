'use client';

import { authed } from './useApi';
import { apiFetch } from './api-client';

export interface CertificateRow {
  id: string;
  studentId: string;
  title: string;
  issuedForType: string;
  issuedForId: string | null;
  serialNumber: string;
  issuedAt: string;
  status: string; // ISSUED | REVOKED
}

export interface VerifyResult {
  valid: boolean;
  title?: string;
  issuedAt?: string;
  status?: string;
}

/** List a student's certificates (own profile, an active guardian, or staff). */
export function listCertificatesForStudent(studentId: string): Promise<CertificateRow[]> {
  return authed<CertificateRow[]>(`certificates/students/${studentId}`);
}

/** Tutor: issue a certificate. Student must already have a real enrollment in the target. */
export function issueCertificate(input: {
  studentId: string;
  title: string;
  issuedForType: 'COURSE' | 'PROGRAM' | 'PATH';
  issuedForId: string;
}): Promise<CertificateRow> {
  return authed<CertificateRow>('certificates', { method: 'POST', body: input });
}

/** Tutor (original issuer) or staff: revoke a certificate. */
export function revokeCertificate(id: string): Promise<CertificateRow> {
  return authed<CertificateRow>(`certificates/${id}/revoke`, { method: 'POST', body: {} });
}

/** Public verification by serial number — no auth required. */
export function verifyCertificate(serialNumber: string): Promise<VerifyResult> {
  return apiFetch<VerifyResult>(`certificates/verify/${encodeURIComponent(serialNumber)}`);
}
