export interface FileSearchStore {
  name: string;           // e.g. "fileSearchStores/abc123"
  displayName?: string;
  createTime: string;
  updateTime: string;
  activeDocumentsCount: number;
  pendingDocumentsCount: number;
  failedDocumentsCount: number;
  sizeBytes: number;
}

export interface Operation {
  name: string;
  done: boolean;
  error?: { code: number; message: string };
  response?: unknown;
  metadata?: unknown;
}

export interface ChunkingConfig {
  chunkSize?: number;
  chunkOverlap?: number;
}

export interface ListStoresResponse {
  fileSearchStores: FileSearchStore[];
  nextPageToken?: string;
}

export type DocumentState = 'STATE_UNSPECIFIED' | 'PENDING' | 'ACTIVE' | 'FAILED';

export interface CustomMetadata {
  key: string;
  stringValue?: string;
  numericValue?: number;
}

export interface Document {
  name: string;
  displayName?: string;
  customMetadata?: CustomMetadata[];
  state: DocumentState;
  sizeBytes: number;
  mimeType: string;
  createTime: string;
  updateTime: string;
}

export interface ListDocumentsResponse {
  documents: Document[];
  nextPageToken?: string;
}
