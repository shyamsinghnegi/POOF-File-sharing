import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function uploadToR2(key: string, body: Buffer, contentType: string) {
    await r2Client.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            Body: Readable.from(body),
            ContentType: contentType,
            ContentLength: body.length,
        })
    );
}

export async function getFromR2(key: string, range?: string) {
    const response = await r2Client.send(
        new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            Range: range,
        })
    );
    return {
        body: response.Body!.transformToWebStream(),
        contentRange: response.ContentRange,
        contentLength: response.ContentLength,
    };
}


export async function deleteFromR2(key: string) {
    await r2Client.send(
        new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
        })
    );
}

export async function getPresignedUploadUrl(key: string, contentType: string, contentLength: number) {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
        ContentLength: contentLength,
    });
    return await getSignedUrl(r2Client, command, { expiresIn: 600 });
}

export async function headObjectFromR2(key: string) {
    try {
        const response = await r2Client.send(
            new HeadObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
            })
        );
        return { exists: true, size: response.ContentLength ?? 0 };
    } catch {
        return { exists: false, size: 0 };
    }
}

