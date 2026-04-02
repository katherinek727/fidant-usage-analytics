import { UsageStats } from "@/components/UsageStats";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.content}>
        <UsageStats />
      </div>
    </main>
  );
}
