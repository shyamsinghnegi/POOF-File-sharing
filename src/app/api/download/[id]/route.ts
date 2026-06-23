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

    const body = await getFromR2(share.r2_key);

    return new NextResponse(body, {
        headers: {
            "Content-Type": share.content_type,
            "Content-Disposition": `attachment; filename="${share.filename}"`,
        },
    });
}
