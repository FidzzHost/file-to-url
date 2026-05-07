import { createClient } from "@libsql/client/http";
import { v4 as uuidv4 } from "uuid";

export interface FileMeta {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
  uploadedAt: string;
  url: string;
}

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Please add it to your environment variables."
    );
  }

  return createClient({
    url,
    authToken: authToken || undefined,
  });
}

async function ensureTable() {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      extension TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      data BLOB NOT NULL
    )
  `);
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<FileMeta> {
  await ensureTable();
  const db = getDb();

  const id = uuidv4();
  const ext = originalName.includes(".")
    ? "." + originalName.split(".").pop()
    : "";

  await db.execute({
    sql: `INSERT INTO files (id, original_name, mime_type, size, extension, uploaded_at, data)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      originalName,
      mimeType,
      buffer.length,
      ext,
      new Date().toISOString(),
      buffer,
    ],
  });

  return {
    id,
    originalName,
    mimeType,
    size: buffer.length,
    extension: ext,
    uploadedAt: new Date().toISOString(),
    url: `/api/files/${id}`,
  };
}

export async function getFileMeta(
  id: string
): Promise<FileMeta | undefined> {
  await ensureTable();
  const db = getDb();

  const result = await db.execute({
    sql: `SELECT id, original_name, mime_type, size, extension, uploaded_at
          FROM files WHERE id = ?`,
    args: [id],
  });

  if (result.rows.length === 0) return undefined;

  const row = result.rows[0];
  return {
    id: row.id as string,
    originalName: row.original_name as string,
    mimeType: row.mime_type as string,
    size: row.size as number,
    extension: row.extension as string,
    uploadedAt: row.uploaded_at as string,
    url: `/api/files/${row.id}`,
  };
}

export async function getAllFiles(): Promise<FileMeta[]> {
  await ensureTable();
  const db = getDb();

  const result = await db.execute(
    `SELECT id, original_name, mime_type, size, extension, uploaded_at
     FROM files ORDER BY uploaded_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id as string,
    originalName: row.original_name as string,
    mimeType: row.mime_type as string,
    size: row.size as number,
    extension: row.extension as string,
    uploadedAt: row.uploaded_at as string,
    url: `/api/files/${row.id}`,
  }));
}

export async function getFileBuffer(
  id: string
): Promise<Buffer | null> {
  await ensureTable();
  const db = getDb();

  const result = await db.execute({
    sql: `SELECT data FROM files WHERE id = ?`,
    args: [id],
  });

  if (result.rows.length === 0) return null;

  const data = result.rows[0].data;
  if (data === null || data === undefined) return null;
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }
  if (typeof data === "string") {
    return Buffer.from(data, "base64");
  }
  return Buffer.from(data as unknown as Uint8Array);
}

export async function deleteFile(id: string): Promise<boolean> {
  await ensureTable();
  const db = getDb();

  const result = await db.execute({
    sql: `DELETE FROM files WHERE id = ?`,
    args: [id],
  });

  return result.rowsAffected > 0;
}
