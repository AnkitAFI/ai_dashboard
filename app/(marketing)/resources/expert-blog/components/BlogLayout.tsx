import styles from "./BlogLayout.module.css";

interface BlogLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function BlogLayout({
  sidebar,
  children,
}: BlogLayoutProps) {
  return (
    <div className={styles.articleLayout}>
      {sidebar}

      <main className={styles.articleBody}>
        {children}
      </main>
    </div>
  );
}