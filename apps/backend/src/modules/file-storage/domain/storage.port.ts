/**
 * File storage PORT (System Architecture §13, Database Master Architecture §13).
 * The domain stores/retrieves opaque references; the concrete store (local, S3,
 * or other) is an adapter selected by configuration (STORAGE_DRIVER). Stored
 * objects are access-controlled and, for sensitive/minor data, encrypted.
 */
export interface StoredObjectRef {
  storageReference: string;
  contentType: string;
  sizeBytes: number;
}

export interface PutObjectInput {
  key: string;
  content: Buffer;
  contentType: string;
  classification?: 'personal' | 'financial' | 'minor_related' | 'operational';
}

export interface StoragePort {
  put(input: PutObjectInput): Promise<StoredObjectRef>;
  get(storageReference: string): Promise<Buffer>;
  remove(storageReference: string): Promise<void>;
  exists(storageReference: string): Promise<boolean>;
}

export const STORAGE_PORT = Symbol('STORAGE_PORT');
