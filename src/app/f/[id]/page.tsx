import { getShareById, getCurrentTime } from "@/lib/d1";
import Header from "@/app/components/Header";
import CopyLinkButton from "@/app/components/CopyLinkButton";
import styles from "./page.module.css";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimeRemaining(expiresAt: number, now: number): string {

    const msRemaining = expiresAt - now;
    const hours = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
}

function formatUploadedDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-Us", { month: "short", day: "numeric", year: "numeric" });
}

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const share = await getShareById(id);
    const now = getCurrentTime();
    const isExpired = !share || share.expires_at < now;

    if (isExpired) {
        return (<div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <p className={styles.gone}>This link is gone.</p>
            </main>
        </div>
        );
    }
    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <h1 className={styles.title}>Download your file</h1>
                <p className={styles.subtitle}>Shared via poof.</p>

                <div className={styles.card}>
                    <div className={styles.row}>
                        <span className={styles.label}>Name:</span>
                        <span className={styles.value}>{share.filename}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Size:</span>
                        <span className={styles.value}>{formatBytes(share.size)}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Uploaded:</span>
                        <span className={styles.value}>{formatUploadedDate(share.created_at)}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Expires:</span>
                        <span className={styles.value}>{formatTimeRemaining(share.expires_at, now)}</span>
                    </div>
                </div>

                <p className={styles.warning}>
                    This file was shared with you by someone else. POOF scans for known
                    threats, but can&apos;t guarantee every file is safe - only download
                    if you trust the sender.
                </p>

                <a href={`/api/download/${id}`} className={styles.downloadButton}>Download</a>
                <CopyLinkButton shareId={id} />
            </main>
        </div>
    );
}