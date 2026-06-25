const D1_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.D1_ACCOUNT_ID}/d1/database/${process.env.D1_DATABASE_ID}/query`;

export async function queryD1(sql: string, params: unknown[] = []) {
    const response = await fetch(D1_BASE_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.D1_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
    });

    if (!response.ok) {
        throw new Error(`D1 query failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.result[0].results;
}

export async function getFileByHash(hash: string) {
    const results = await queryD1("SELECT * FROM files WHERE hash = ?", [hash]);
    return results[0] ?? null;
}

export async function insertFile(hash: string, r2Key: string, size: number, contentType: string) {
    await queryD1(
        "INSERT INTO files (hash, r2_key, size, content_type) VALUES (?, ?, ?, ?)",
        [hash, r2Key, size, contentType]
    );
}

export async function insertShare(shareId: string, fileHash: string, filename: string, createdAt: number, expiresAt: number) {
    await queryD1(
        "INSERT INTO shares (share_id, file_hash, filename, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
        [shareId, fileHash, filename, createdAt, expiresAt]
    );
}

export async function getTotalStorageUsed() {
    const results = await queryD1("SELECT SUM(size) AS total FROM files");
    return results[0]?.total ?? 0;
}

export async function getShareById(shareId: string) {
    const results = await queryD1(
        `SELECT shares.filename, shares.created_at, shares.expires_at, files.size, files.content_type, files.r2_key
         FROM shares
         JOIN files ON shares.file_hash = files.hash
         WHERE shares.share_id = ?`,
        [shareId]
    );
    return results[0] ?? null;
}

export function getCurrentTime(): number {
    return Date.now();
}

export async function deleteExpiredShares(now :number){
    await queryD1("DELETE FROM shares WHERE expires_at < ?",[now]);
}

export async function getOrphanedFiles() {
    return await queryD1(
        `SELECT hash, r2_key FROM files WHERE hash NOT IN (SELECT file_hash FROM shares)`
    );
}

export async function deleteFileByHash(hash: string){
    await queryD1("DELETE FROM files WHERE hash = ?",[hash]);
}