import { getShareById, getCurrentTime } from "@/lib/d1";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    
    return `${(bytes/(1024*1024)).toFixed(1)} MB`;
}

function formatTimeRemaining(expiresAt: number, now: number): string {
    
    const msRemaining = expiresAt - now;
    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

export default async function SharePage({params}: {params: Promise<{id:string}>}){
    const {id} = await params;
    const share = await getShareById(id);
    const now = getCurrentTime();
    const isExpired = !share|| share.expires_at < now;

    if (isExpired) {
        return <div> This link is gone. </div>;
    }
    return (
        <div>
            <p>{share.filename}</p>
            <p>{formatBytes(share.size)}</p>
            <p>Expires in: {formatTimeRemaining(share.expires_at, now)}</p>
            <p>
                This file was shared with you by someone else. POOF scans for known
                threats, but can&apos;t guarantee every file is safe - only download
                if you trust the sender.
            </p>
            <a href={`/api/download/${id}`}>Download</a>
        </div>
    )
}