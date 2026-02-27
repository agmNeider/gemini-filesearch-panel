import type {
  FileSearchStore,
  Operation,
  ListStoresResponse,
  ChunkingConfig,
  Document,
  ListDocumentsResponse,
} from '../types';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set('key', API_KEY);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errMsg = (body as { error?: { message?: string } })?.error?.message;
    throw new Error(errMsg || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listStores(pageToken?: string): Promise<ListStoresResponse> {
  const params: Record<string, string> = {};
  if (pageToken) params.pageToken = pageToken;
  const res = await fetch(buildUrl('fileSearchStores', params));
  return handleResponse<ListStoresResponse>(res);
}

export async function createStore(displayName?: string): Promise<FileSearchStore> {
  const body = displayName ? { displayName } : {};
  const res = await fetch(buildUrl('fileSearchStores'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<FileSearchStore>(res);
}

export async function getStore(name: string): Promise<FileSearchStore> {
  const res = await fetch(buildUrl(name));
  return handleResponse<FileSearchStore>(res);
}

export async function deleteStore(name: string, force?: boolean): Promise<void> {
  const params: Record<string, string> = {};
  if (force) params.force = 'true';
  const res = await fetch(buildUrl(name, params), { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errMsg = (body as { error?: { message?: string } })?.error?.message;
    throw new Error(errMsg || `HTTP ${res.status}`);
  }
}

export async function uploadFile(
  storeName: string,
  file: File,
  displayName?: string,
  chunkingConfig?: ChunkingConfig,
): Promise<Operation> {
  const uploadUrl = new URL(
    `https://generativelanguage.googleapis.com/upload/v1beta/${storeName}:uploadToFileSearchStore`,
  );
  uploadUrl.searchParams.set('key', API_KEY);
  uploadUrl.searchParams.set('uploadType', 'multipart');

  const metadata: Record<string, unknown> = {};
  if (displayName) metadata.displayName = displayName;
  if (chunkingConfig) metadata.chunkingConfig = chunkingConfig;

  const boundary = `----MultipartBoundary${Math.random().toString(36).slice(2)}`;
  const metadataJson = JSON.stringify(metadata);
  const fileBuffer = await file.arrayBuffer();
  const mimeType = file.type || 'application/octet-stream';

  const encoder = new TextEncoder();
  const header = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${metadataJson}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
  );
  const footer = encoder.encode(`\r\n--${boundary}--`);

  const body = new Uint8Array(header.byteLength + fileBuffer.byteLength + footer.byteLength);
  body.set(header, 0);
  body.set(new Uint8Array(fileBuffer), header.byteLength);
  body.set(footer, header.byteLength + fileBuffer.byteLength);

  const res = await fetch(uploadUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  return handleResponse<Operation>(res);
}

export async function getOperation(opName: string): Promise<Operation> {
  const res = await fetch(buildUrl(opName));
  return handleResponse<Operation>(res);
}

// Documents

export async function listDocuments(
  storeName: string,
  pageToken?: string,
): Promise<ListDocumentsResponse> {
  const params: Record<string, string> = { pageSize: '20' };
  if (pageToken) params.pageToken = pageToken;
  const res = await fetch(buildUrl(`${storeName}/documents`, params));
  return handleResponse<ListDocumentsResponse>(res);
}

export async function getDocument(name: string): Promise<Document> {
  const res = await fetch(buildUrl(name));
  return handleResponse<Document>(res);
}

export async function deleteDocument(name: string, force?: boolean): Promise<void> {
  const params: Record<string, string> = {};
  if (force) params.force = 'true';
  const res = await fetch(buildUrl(name, params), { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errMsg = (body as { error?: { message?: string } })?.error?.message;
    throw new Error(errMsg || `HTTP ${res.status}`);
  }
}
