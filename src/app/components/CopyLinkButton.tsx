'use client';

import { useState } from "react";
import styles from "./CopyLinkButton.module.css";

export default function CopyLinkButton({ shareId }: { shareId: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        const url = `${window.location.origin}/f/${shareId}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button onClick={handleCopy} className={styles.copyButton}>
            {copied ? "Link copied" : "Copy link"}
        </button>
    );
}
