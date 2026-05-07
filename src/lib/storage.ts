import { put, list, del } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const IS_VERCEL = !!process.env.BLOB_READ_WRITE_TOKEN;

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "uploads");
const LOCAL_META_FILE = path.join(LOCAL_UPLOADS_DIR, "metadata.json");

export interface FileMeta {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
  uploadedAt: string;
  url: string;
  blobUrl?: string;
}

// ── Local filesystem storage ────────────────────────────────────────

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
    fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
  }
}

function readLocalMeta(): FileMeta[] {
  ensureLocalDir();
  if (!fs.existsSync(LOCAL_META_FILE)) return [];
  return JSON.parse(fs.readFileSync(LOCAL_META_FILE, "utf-8"));
}

function writeLocalMeta(data: FileMeta[]) {
  ensureLocalDir();
  fs.writeFileSync(LOCAL_META_FILE, JSON.stringify(data, null, 2));
}

function localSaveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): FileMeta {
  ensureLocalDir();
  const id = uuidv4();
  const ext = path.extname(originalName) || "";
  const filename = `${id}${ext}`;
  fs.writeFileSync(path.join(LOCAL_UPLOADS_DIR, filename), buffer);

  const meta: FileMeta = {
    id,
    originalName,
    mimeType,
    size: buffer.length,
    extension: ext,
    uploadedAt: new Date().toISOString(),
    url: `/api/files/${id}`,
  };

  const all = readLocalMeta();
  all.push(meta);
  writeLocalMeta(all);
  return meta;
}

function localGetFileMeta(id: string): FileMeta | undefined {
  return readLocalMeta().find((f) => f.id === id);
}

function localGetAllFiles(): FileMeta[] {
  return readLocalMeta();
}

function localGetFilePath(id: string): string | null {
  const meta = localGetFileMeta(id);
  if (!meta) return null;
  const fp = path.join(LOCAL_UPLOADS_DIR, `${id}${meta.extension}`);
  return fs.existsSync(fp) ? fp : null;
}

function localGetFileBuffer(id: string): Buffer | null {
  const fp = localGetFilePath(id);
  return fp ? fs.readFileSync(fp) : null;
}

function localDeleteFile(id: string): boolean {
  const fp = localGetFilePath(id);
  if (!fp) return false;
  fs.unlinkSync(fp);
  writeLocalMeta(readLocalMeta().filter((f) => f.id !== id));
  return true;
}

// ── Vercel Blob storage ─────────────────────────────────────────────

async function blobSaveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<FileMeta> {
  const id = uuidv4();
  const ext = path.extname(originalName) || "";
  const blobPath = `uploads/${id}${ext}`;

  const blob = await put(blobPath, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: false,
  });

  return {
    id,
    originalName,
    mimeType,
    size: buffer.length,
    extension: ext,
    uploadedAt: new Date().toISOString(),
    url: `/api/files/${id}`,
    blobUrl: blob.url,
  };
}

async function blobGetAllFiles(): Promise<FileMeta[]> {
  const result = await list({ prefix: "uploads/" });
  return result.blobs.map((blob) => {
    const filename = blob.pathname.replace("uploads/", "");
    const dotIndex = filename.indexOf(".");
    const id = dotIndex > -1 ? filename.substring(0, dotIndex) : filename;
    const ext = dotIndex > -1 ? filename.substring(dotIndex) : "";
    return {
      id,
      originalName: filename,
      mimeType: getMimeFromExt(ext),
      size: blob.size,
      extension: ext,
      uploadedAt: blob.uploadedAt.toISOString(),
      url: `/api/files/${id}`,
      blobUrl: blob.url,
    };
  });
}

async function blobGetFileMeta(id: string): Promise<FileMeta | undefined> {
  const allFiles = await blobGetAllFiles();
  return allFiles.find((f) => f.id === id);
}

async function blobGetFileBuffer(id: string): Promise<Buffer | null> {
  const meta = await blobGetFileMeta(id);
  if (!meta?.blobUrl) return null;
  const res = await fetch(meta.blobUrl);
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function blobGetRedirectUrl(id: string): Promise<string | null> {
  const meta = await blobGetFileMeta(id);
  return meta?.blobUrl || null;
}

async function blobDeleteFile(id: string): Promise<boolean> {
  const meta = await blobGetFileMeta(id);
  if (!meta?.blobUrl) return false;
  await del(meta.blobUrl);
  return true;
}

// ── Public API (auto-selects storage backend) ───────────────────────

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<FileMeta> {
  if (IS_VERCEL) {
    return blobSaveFile(buffer, originalName, mimeType);
  }
  return localSaveFile(buffer, originalName, mimeType);
}

export async function getFileMeta(
  id: string
): Promise<FileMeta | undefined> {
  if (IS_VERCEL) {
    return blobGetFileMeta(id);
  }
  return localGetFileMeta(id);
}

export async function getAllFiles(): Promise<FileMeta[]> {
  if (IS_VERCEL) {
    return blobGetAllFiles();
  }
  return localGetAllFiles();
}

export async function getFileBuffer(id: string): Promise<Buffer | null> {
  if (IS_VERCEL) {
    return blobGetFileBuffer(id);
  }
  return localGetFileBuffer(id);
}

export async function getRedirectUrl(
  id: string
): Promise<string | null> {
  if (IS_VERCEL) {
    return blobGetRedirectUrl(id);
  }
  return null;
}

export async function deleteFile(id: string): Promise<boolean> {
  if (IS_VERCEL) {
    return blobDeleteFile(id);
  }
  return localDeleteFile(id);
}

function getMimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".pdf": "application/pdf",
    ".json": "application/json",
    ".txt": "text/plain",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".zip": "application/zip",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}
