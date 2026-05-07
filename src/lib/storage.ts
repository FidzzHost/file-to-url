import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const META_FILE = path.join(UPLOADS_DIR, "metadata.json");

export interface FileMeta {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
  uploadedAt: string;
  url: string;
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function readMetadata(): FileMeta[] {
  ensureUploadsDir();
  if (!fs.existsSync(META_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(META_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeMetadata(data: FileMeta[]) {
  ensureUploadsDir();
  fs.writeFileSync(META_FILE, JSON.stringify(data, null, 2));
}

export function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): FileMeta {
  ensureUploadsDir();

  const id = uuidv4();
  const ext = path.extname(originalName) || "";
  const filename = `${id}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  const meta: FileMeta = {
    id,
    originalName,
    mimeType,
    size: buffer.length,
    extension: ext,
    uploadedAt: new Date().toISOString(),
    url: `/api/files/${id}`,
  };

  const allMeta = readMetadata();
  allMeta.push(meta);
  writeMetadata(allMeta);

  return meta;
}

export function getFileMeta(id: string): FileMeta | undefined {
  const allMeta = readMetadata();
  return allMeta.find((f) => f.id === id);
}

export function getAllFiles(): FileMeta[] {
  return readMetadata();
}

export function getFilePath(id: string): string | null {
  const meta = getFileMeta(id);
  if (!meta) return null;

  const filename = `${id}${meta.extension}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) return null;
  return filePath;
}

export function deleteFile(id: string): boolean {
  const filePath = getFilePath(id);
  if (!filePath) return false;

  fs.unlinkSync(filePath);

  const allMeta = readMetadata();
  const filtered = allMeta.filter((f) => f.id !== id);
  writeMetadata(filtered);

  return true;
}
