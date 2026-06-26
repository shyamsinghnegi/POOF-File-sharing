import { NextResponse } from "next/server";
import { uploadRatelimit } from "@/lib/ratelimit";
import { getPresignedUploadUrl } from "@/lib/r2";
import { getFileByHash, getTotalStorageUsed } from "@/lib/d1";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB LIMIT
const MAX_BATCH_SIZE = 2 * 1024 * 1024 * 1024; // 2GB total for multi-file batches
const STORAGE_BUDGET = 10 * 1024 * 1024 * 1024; // 10GB total budget
const KILL_SWITCH_THRESHOLD = STORAGE_BUDGET * 0.8; // 8GB — reject uploads past this

type IncomingFile = {
    filename: string;
    size: number;
    contentType: string;
    hash: string;
};

type InitResult = {
    filename: string;
    hash: string;
    needsUpload: boolean;
    presignedUrl?: string;
};

export async function POST(request: Request) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { remaining } = await uploadRatelimit.getRemaining(ip);
    if (remaining <= 0) {
        return NextResponse.json({ error: "Rate limit exceeded. Try again later" }, { status: 429 });
    }

    const body = await request.json();
    const files = body.files as IncomingFile[] | undefined;

    if (!files || files.length === 0) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (files.length === 1) {
        if (files[0].size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File exceeds 1GB limit" }, { status: 413 });
        }
    } else {
        const totalRequestedSize = files.reduce((sum, f) => sum + f.size, 0);
        if (totalRequestedSize > MAX_BATCH_SIZE) {
            return NextResponse.json({ error: "Batch exceeds 2GB total limit" }, { status: 413 });
        }
    }

    const totalStorageUsed = await getTotalStorageUsed();
    const totalRequestedSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalStorageUsed + totalRequestedSize > KILL_SWITCH_THRESHOLD) {
        return NextResponse.json({ error: "Storage limit reached. Try again later." }, { status: 503 });
    }

    const results: InitResult[] = [];

    for (const file of files) {
        const existingFile = await getFileByHash(file.hash);

        if (existingFile) {
            results.push({ filename: file.filename, hash: file.hash, needsUpload: false });
            continue;
        }

        const presignedUrl = await getPresignedUploadUrl(file.hash, file.contentType, file.size);
        results.push({ filename: file.filename, hash: file.hash, needsUpload: true, presignedUrl });
    }

    return NextResponse.json({ results });
}
