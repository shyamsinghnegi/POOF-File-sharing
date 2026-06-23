import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
            Body: body,
            ContentType: contentType,
        })
    );
}

export async function getFromR2(key: string): Promise<ReadableStream> {
    const response = await r2Client.send(
        new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
        })
    );
    return response.Body!.transformToWebStream();
}

export async function deleteFromR2(key: string) {
    await r2Client.send(
        new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
        })
    );
}