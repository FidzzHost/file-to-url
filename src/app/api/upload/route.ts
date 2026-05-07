import { NextRequest } from "next/server";
import { saveFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        {
          success: false,
          error: "Content-Type must be multipart/form-data",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        {
          success: false,
          error: 'No file provided. Use field name "file"',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const meta = saveFile(buffer, file.name, file.type);

    const baseUrl =
      request.headers.get("x-forwarded-proto") &&
      request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : request.headers.get("host")
          ? `${request.url.startsWith("https") ? "https" : "http"}://${request.headers.get("host")}`
          : "";

    return Response.json(
      {
        success: true,
        data: {
          id: meta.id,
          originalName: meta.originalName,
          mimeType: meta.mimeType,
          size: meta.size,
          uploadedAt: meta.uploadedAt,
          url: `${baseUrl}${meta.url}`,
          directUrl: `${baseUrl}/api/files/${meta.id}`,
          noExpiration: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Upload error:", error);
    return Response.json(
      {
        success: false,
        error: `Upload failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
