import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { uploadRatelimit } from "@/lib/ratelimit";
import { checkHashWithVirusTotal, VirusTotalVerdict } from "@/lib/virustotal";
import { headObjectFromR2, deleteFromR2 } from "@/lib/r2";
import { getFileByHash, insertFile, insertShare, insertShareFile } from "@/lib/d1";

type IncomingFile = {
    filename: string;
    hash: string;
    contentType: string;
    needsUpload: boolean;
};

type FileResult = {
    filename: string;
    status: "ok" | "failed";
    reason?: string;
};

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";

    const body = await request.json();
    const files = body.files as IncomingFile[] | undefined;

    if (!files || files.length === 0) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const results: FileResult[] = [];
    const successfulFiles: { hash: string; filename: string }[] = [];

    for (const file of files) {
        const existingFile = await getFileByHash(file.hash);

        if (existingFile) {
            successfulFiles.push({ hash: file.hash, filename: file.filename });
            results.push({ filename: file.filename, status: "ok" });
            continue;
        }

        const { exists, size } = await headObjectFromR2(file.hash);
        if (!exists) {
            results.push({ filename: file.filename, status: "failed", reason: "Upload did not complete" });
            continue;
        }

        let verdict: VirusTotalVerdict = "Unknown";
        try {
            verdict = await checkHashWithVirusTotal(file.hash);
        } catch {
            verdict = "Unknown";
        }

        if (verdict === "malicious") {
            await deleteFromR2(file.hash);
            results.push({ filename: file.filename, status: "failed", reason: "Flagged as malicious" });
            continue;
        }

        await insertFile(file.hash, file.hash, size, file.contentType);
        successfulFiles.push({ hash: file.hash, filename: file.filename });
        results.push({ filename: file.filename, status: "ok" });
    }

    if (successfulFiles.length === 0) {
        return NextResponse.json({ results }, { status: 207 });
    }

    const shareId = randomUUID();
    const createdAt = Date.now();
    const expiresAt = createdAt + 24 * 60 * 60 * 1000;

    await insertShare(shareId, createdAt, expiresAt);
    for (const { hash, filename } of successfulFiles) {
        await insertShareFile(shareId, hash, filename);
    }

    await uploadRatelimit.limit(ip);

    return NextResponse.json({ shareId, results }, { status: 207 });
}
