import Header from "../components/Header";
import Accordion from "../components/Accordion";
import styles from "./page.module.css";
import Link from "next/link";

const faqs = [
    { q: "How does poof work?", a: "Drop a file, get a link, share it. Your file is encrypted, held for 24 hours, then permanently deleted — no account and no trace left behind." },
    { q: "Is there a limit to the file size I can upload?", a: "Yes — up to 1GB per transfer. Anything larger would need a premium tier, which is out of scope for this demo." },
    { q: "How do I upload a file?", a: "Hit \"Upload File\" on the home page, then drag a file in or pick one from your device. A shareable link appears the moment the upload finishes." },
    { q: "Are there any download limitations for users?", a: "No. Anyone holding the link can download the file as many times as they like — right up until it expires at the 24-hour mark." },
    { q: "How long are my files stored?", a: "Exactly 24 hours from the time of upload. After that the file is wiped from storage automatically. Poof." },
    { q: "Are there any restrictions on the types of files I can upload?", a: "Most everyday file types are welcome. Executables and anything flagged as malware are blocked to keep shared links safe." },
    { q: "Does poof support API or remote upload?", a: "Remote Upload lets you pull a file straight from a public URL without downloading it first. A small REST API is on the roadmap." },
    { q: "Can my files be found in search engine results?", a: "No. Every link is randomly generated, unguessable, and never indexed — so files stay private to exactly the people you send them to." },
];

export default function FaqPage() {
    return (
        <div className={styles.page}>
            <Header variant="faq" />
            <div className={styles.body}>
                <aside className={styles.sidebar}>
                    <p className={styles.sidebarLabel}>Introduction</p>
                    <Link href="/" className={styles.sidebarItem}>Welcome</Link>
                    <p className={styles.sidebarLabel}>Help</p>
                    <p className={styles.sidebarItemActive}>FAQ</p>
                </aside>
                <main className={styles.main}>
                    <p className={styles.eyebrow}>Support</p>
                    <h1 className={styles.title}>FAQ</h1>
                    <p className={styles.subtitle}>Everything you need to know about poof.</p>
                    <Accordion items={faqs} />
                    <div className={styles.backRow}>
                        <Link href="/">‹ Back <span className={styles.backHome}>Home</span></Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
