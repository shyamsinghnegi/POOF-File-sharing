'use client';

import { useState } from "react";
import styles from "./Accordion.module.css";

type FaqItem = { q: string; a: string };

export default function Accordion({ items }: { items: FaqItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    function toggle(index: number) {
        setOpenIndex(openIndex === index ? null : index);
    }

    return (
        <div className={styles.accordion}>
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                    <div key={item.q} className={styles.item}>
                        <button onClick={() => toggle(index)} className={styles.question}>
                            <span>{item.q}</span>
                            <span className={isOpen ? styles.chevronOpen : styles.chevron}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </span>
                        </button>
                        <div className={isOpen ? styles.panelOpen : styles.panel}>
                            <div className={styles.panelInner}>
                                <p className={styles.answer}>{item.a}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
