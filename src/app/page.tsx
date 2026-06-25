import Link from "next/link";
import Header from "./components/Header";
import styles from "./page.module.css";
import UploadForm from "./components/UploadForm";
export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.rule} />
        <p className={styles.eyebrow}>Established 2026</p>
        <h1 className={styles.wordmark}>poof</h1>
        <p className={styles.tagline}>
          Fast, secure file sharing that&apos;s{" "}
          <span className={styles.highlight}>gone in 24h</span>
        </p>
        {/* <div className={styles.buttonRow}>
          <button className={styles.primaryButton}>Upload Files</button>
          <button className={styles.secondaryButton}>Remote Upload</button>
        </div> */}
        <UploadForm />
        <p className={styles.meta}>NO SIGN-UP · ENCRYPTED · UP TO 1GB </p>
        <div className={styles.rule} />
      </main>
      <footer className={styles.footer}>
        <Link href="/faq" className={styles.faqLink}>FAQ →</Link>
      </footer>
    </div>
  )
}