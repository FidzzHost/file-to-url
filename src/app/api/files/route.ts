import { NextRequest } from "next/server";
import { getAllFiles } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const files = await getAllFiles();

    const baseUrl =
      request.headers.get("x-forwarded-proto") &&
      request.headers.get("x-forwarded-host")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : request.headers.get("host")
          ? `${request.url.startsWith("https") ? "https" : "http"}://${request.headers.get("host")}`
          : "";

    const filesWithFullUrl = files.map((f) => ({
      ...f,
      url: `${baseUrl}${f.url}`,
      directUrl: `${baseUrl}/api/files/${f.id}`,
      noExpiration: true,
    }));

    return Response.json({
      success: true,
      count: files.length,
      data: filesWithFullUrl,
    });
  } catch (error) {
    console.error("List files error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
