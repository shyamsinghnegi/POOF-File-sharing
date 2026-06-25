import { NextResponse } from "next/server";
import { getShareById, getCurrentTime } from "@/lib/d1";
import { getFromR2 } from "@/lib/r2";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const share = await getShareById(id);
    const now = getCurrentTime();

    if (!share || share.expires_at < now) {
        return NextResponse.json({ error: "This link is gone" }, { status: 404 });
    }

    const range = request.headers.get("range") ?? undefined;
    const { body, contentRange, contentLength } = await getFromR2(share.r2_key, range);

    const headers: Record<string, string> = {
        "Content-Type": share.content_type,
        "Content-Disposition": `attachment; filename="${share.filename}"`,
        "Accept-Ranges": "bytes",
    };

    if (range && contentRange) {
        headers["Content-Range"] = contentRange;
        headers["Content-Length"] = String(contentLength);
        return new NextResponse(body, { status: 206, headers });
    }

    headers["Content-Length"] = String(share.size);
    return new NextResponse(body, { status: 200, headers });
}
