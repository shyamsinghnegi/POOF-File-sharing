const D1_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${process.env.D1_ACCOUNT_ID}/d1/database/${process.env.D1_DATABASE_ID}/query`;

type ShareFileRow = {
    created_at: number;
    expires_at: number;
    filename: string;
    size: number;
    content_type: string;
    r2_key: string;
    hash: string;
};

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

export async function getTotalStorageUsed() {
    const results = await queryD1("SELECT SUM(size) AS total FROM files");
    return results[0]?.total ?? 0;
}

export function getCurrentTime(): number {
    return Date.now();
}

export async function deleteExpiredShares(now :number){
    await queryD1("DELETE FROM shares WHERE expires_at < ?",[now]);
}


export async function deleteFileByHash(hash: string){
    await queryD1("DELETE FROM files WHERE hash = ?",[hash]);
}

export async function insertShare(shareId: string, createdAt: number, expiresAt: number) {
    await queryD1(
        "INSERT INTO shares (share_id, created_at, expires_at) VALUES (?, ?, ?)",
        [shareId, createdAt, expiresAt]
    );
}

export async function insertShareFile(shareId: string, fileHash: string, filename: string) {
    await queryD1(
        "INSERT INTO share_files (share_id, file_hash, filename) VALUES (?, ?, ?)",
        [shareId, fileHash, filename]
    );
}

export async function getShareById(shareId: string): Promise<ShareFileRow[]> {
    const results = await queryD1(
        `SELECT shares.created_at, shares.expires_at, share_files.filename, files.size, files.content_type, files.r2_key, files.hash
         FROM shares
         JOIN share_files ON shares.share_id = share_files.share_id
         JOIN files ON share_files.file_hash = files.hash
         WHERE shares.share_id = ?`,
        [shareId]
    );
    return results;
}

export async function getOrphanedFiles() {
    return await queryD1(
        `SELECT hash, r2_key FROM files WHERE hash NOT IN (SELECT file_hash FROM share_files)`
    );
}

export async function deleteExpiredShareFiles(now: number) {
    await queryD1(
        `DELETE FROM share_files WHERE share_id IN (SELECT share_id FROM shares WHERE expires_at < ?)`,
        [now]
    );
}
