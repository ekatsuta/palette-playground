import { useState } from "react";
import styles from "./PageHeader.module.css";

export default function PaletteHeader({
  onSubmit,
  isLoading,
  onReset,
}: {
  onSubmit: (mood: string) => void;
  isLoading: boolean;
  onReset?: () => void;
}) {
  const [mood, setMood] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      onSubmit(mood);
      setMood("");
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerInner}>
          <button
            type="button"
            onClick={onReset}
            className={styles.headerTitle}
            disabled={!onReset}
          >
            Palette Playground
          </button>
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <input
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
