'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./UploadForm.module.css";

type Stage = "idle" | "uploading" | "done" | "error";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadForm() {
    const [stage, setStage] = useState<Stage>("idle");
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState(0);
    const [shareId, setShareId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [fakeProgress, setFakeProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (stage !== "uploading") return;

        const assumedBytesPerSecond = 2 * 1024 * 1024; // rough assumption: ~2 MB/s
        const estimatedSeconds = Math.max(fileSize / assumedBytesPerSecond, 2);
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const fractionOfEstimate = elapsedSeconds / estimatedSeconds;

            setFakeProgress(90 * (1 - Math.exp(-fractionOfEstimate * 2)));
        }, 200);

        return () => clearInterval(interval);
    }, [stage, fileSize]);

    function handlePickClick() {
        fileInputRef.current?.click();
    }

    function reset() {
        setStage("idle");
        setShareId(null);
        setErrorMessage(null);
        setCopied(false);
        setFakeProgress(0);
    }

    async function handleCopy() {
        if (!shareId) return;
        const url = `${window.location.origin}/f/${shareId}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setFileSize(file.size);
        setFakeProgress(0);
        setStage("uploading");
        setErrorMessage(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error ?? "Upload failed.");
                setStage("error");
                return;
            }

            setFakeProgress(100);
            setShareId(data.shareId);
            setStage("done");
        } catch {
            setErrorMessage("Something went wrong. Please try again.");
            setStage("error");
        }
        event.target.value = "";
    }

    const fileInput = (
        <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className={styles.hiddenInput}
        />
    );

    if (stage === "uploading" || stage === "done" || stage === "error") {
        const barWidth = stage === "done" ? 100 : stage === "error" ? fakeProgress : fakeProgress;
        return (
            <>
                {fileInput}
                <div className={styles.fileRowWrapper}>
                    <div className={styles.fileRow}>
                        <div className={styles.fileInfo}>
                            <span className={styles.fileName}>{fileName}</span>
                            <span className={styles.fileSize}>{formatBytes(fileSize)}</span>
                        </div>
                        <div className={styles.progressTrack}>
                            <div
                                className={stage === "error" ? styles.progressBarError : styles.progressBarFill}
                                style={{ width: `${barWidth}%` }}
                            />
                        </div>
                        <div className={styles.fileStatus}>
                            {stage === "uploading" && <span className={styles.spinner} aria-label="Uploading" />}
                            {stage === "done" && <span className={styles.check} aria-label="Done">✓</span>}
                            {stage === "error" && <span className={styles.cross} aria-label="Failed">✕</span>}
                        </div>
                    </div>
                    {stage === "done" && (
                        <button onClick={handleCopy} aria-label="Copy link" className={styles.shareButton}>
                            {copied ? "✓" : "⇪"}
                        </button>
                    )}
                </div>

                {stage === "error" && <p className={styles.errorText}>{errorMessage}</p>}

                <button onClick={reset} className={styles.backButton}>
                    ← {stage === "done" ? "Upload another file" : "Back"}
                </button>
            </>
        );
    }

    return (
        <>
            {fileInput}
            <div className={styles.buttonRow}>
                <button onClick={handlePickClick} className={styles.primaryButton}>Upload File</button>
                <Link href="#" className={styles.secondaryButton}>Remote Upload</Link>
            </div>
        </>
    );
}
