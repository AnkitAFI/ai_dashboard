import styles from "./BlogLayout.module.css";

interface ContentBoxProps {
  variant?: "purple" | "warning";
  label: string;
  children: React.ReactNode;
}

export default function ContentBox({
  variant = "purple",
  label,
  children,
}: ContentBoxProps) {
  const variantClass =
    variant === "warning"
      ? styles.boxWarning
      : styles.boxPurple;

  return (
    <div className={`${styles.box} ${variantClass}`}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        {label}
      </div>

      {children}
    </div>
  );
}