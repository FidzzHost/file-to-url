import { NextRequest } from "next/server";
import { getFileMeta, getFileBuffer } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/files/[id]">
) {
  try {
    const { id } = await ctx.params;

    const meta = await getFileMeta(id);
    if (!meta) {
      return Response.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const fileBuffer = await getFileBuffer(id);
    if (!fileBuffer) {
      return Response.json(
        { success: false, error: "File data not found" },
        { status: 404 }
      );
    }

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": meta.mimeType || "application/octet-stream",
        "Content-Length": meta.size.toString(),
        "Content-Disposition": `inline; filename="${meta.originalName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-File-Id": meta.id,
        "X-Original-Name": meta.originalName,
        "X-Uploaded-At": meta.uploadedAt,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("File serve error:", error);
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
