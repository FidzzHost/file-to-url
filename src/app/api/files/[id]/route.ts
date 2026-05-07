import { NextRequest } from "next/server";
import { getFileMeta, getFilePath } from "@/lib/storage";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/files/[id]">
) {
  try {
    const { id } = await ctx.params;

    const meta = getFileMeta(id);
    if (!meta) {
      return Response.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const filePath = getFilePath(id);
    if (!filePath) {
      return Response.json(
        { success: false, error: "File data not found" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
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
    console.error("File serve error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
