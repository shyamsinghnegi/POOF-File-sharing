'use client';

import { useState } from "react";
import styles from "./Header.module.css";
import Link from "next/link";

export default function Header({variant = "home"}: {variant?:"home"|"faq"}) {
    const [isDark, setIsDark] = useState(true);

    function toggleTheme() {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.dataset.theme = next ? "" : "light";
    }

        return (
        <header className={variant === "faq" ? styles.headerFaq : styles.header}>
            {variant === "faq" ? (
                <Link href="/" className={styles.wordmark}>POOF</Link>
            ) : (
                <span className={styles.wordmark}>POOF</span>
            )}
            <div className={styles.right}>
                <button onClick={toggleTheme} aria-label="Toggle theme" className={styles.toggle}>
                    {isDark ? "☾" : "☀"}
                </button>
                {variant === "faq" && (
                    <Link href="/" className={styles.backLink}>Back to app ›</Link>
                )}
            </div>
        </header>
    );

}