import { useState } from "react";
import styles from "./ScrollPagination.module.css";

interface ScrollPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageClick: (index: number) => void;
  pageLabels?: string[];
}

export function ScrollPagination({
  totalPages,
  currentPage,
  onPageClick,
  pageLabels,
}: ScrollPaginationProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {Array.from({ length: totalPages }).map((_, index) => (
        <button key={index} onClick={() => onPageClick(index)} className={styles.pageButton}>
          {/* Label - appears on hover */}
          {isHovered && pageLabels && pageLabels[index] && (
            <span className={styles.label}>{pageLabels[index]}</span>
          )}

          {/* Dot indicator */}
          <div className={styles.dotContainer}>
            {/* Active indicator - filled circle */}
            <div
              className={`${styles.dot} ${currentPage === index ? styles.dotActive : styles.dotInactive}`}
            />

            {/* Hover ring */}
            {currentPage === index && <div className={styles.ring} />}
          </div>

          {/* Page number - small text */}
          <span
            className={`${styles.pageNumber} ${currentPage === index ? styles.pageNumberActive : styles.pageNumberInactive}`}
          >
            {index + 1}
          </span>
        </button>
      ))}
    </div>
  );
}
