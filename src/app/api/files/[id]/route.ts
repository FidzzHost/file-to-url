import { NextRequest } from "next/server";
import { getFileMeta, getFileBuffer, getRedirectUrl } from "@/lib/storage";

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

    const redirectUrl = await getRedirectUrl(id);
    if (redirectUrl) {
      return Response.redirect(redirectUrl, 302);
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
    console.error("File serve error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
