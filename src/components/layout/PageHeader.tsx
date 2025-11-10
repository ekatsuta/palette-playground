import { useState, useRef } from "react";
import styles from "./PageHeader.module.css";

export default function PaletteHeader({
  onSubmit,
  isLoading,
}: {
  onSubmit: (mood: string) => void;
  isLoading: boolean;
}) {
  const [mood, setMood] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      onSubmit(mood);
      // Blur input to dismiss keyboard and zoom out on mobile
      inputRef.current?.blur();
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerInner}>
          <h1 className={styles.headerTitle}>Palette Playground</h1>
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <input
              ref={inputRef}
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Describe a mood or feeling..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.exploreButton} disabled={isLoading}>
              {isLoading ? "Generating..." : "Explore"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
