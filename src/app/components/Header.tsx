'use client';

import { useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
    const [isDark, setIsDark] = useState(true);

    function toggleTheme() {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.dataset.theme = next ? "" : "light";
    }

    return (
        <header className={styles.header}>
            <span className={styles.wordmark}>POOF</span>
            <button onClick={toggleTheme} aria-label="Toggle theme" className={styles.toggle}>
                {isDark ? "☾" : "☀"}
            </button>
        </header>
    );

}