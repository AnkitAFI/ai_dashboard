import styles from "./BlogLayout.module.css";

interface TOCItem {
  id: string;
  label: string;
}

interface TOCSidebarProps {
  items: TOCItem[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function TOCSidebar({
  items,
  activeSection,
  onNavigate,
}: TOCSidebarProps) {
  return (
    <aside className={styles.tocSidebar}>
      <h4>Table of Contents</h4>

      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            marginBottom: 8,
            color:
              activeSection === item.id
                ? "#7C3AED"
                : "#64748B",
          }}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}