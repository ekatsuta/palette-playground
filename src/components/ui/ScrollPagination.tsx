import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpToLine } from "lucide-react";
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

  const hasPrevious = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <>
      {/* Mobile: Page counter with arrows */}
      <div className={styles.mobileContainer}>
        <button
          type="button"
          className={styles.homeButton}
          onClick={() => onPageClick(0)}
          disabled={currentPage === 0}
          aria-label="Go to summary"
          title="Summary"
        >
          <ArrowUpToLine size={16} />
        </button>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => onPageClick(currentPage - 1)}
          disabled={!hasPrevious}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <div className={styles.pageCounter}>
          {currentPage + 1} / {totalPages}
        </div>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => onPageClick(currentPage + 1)}
          disabled={!hasNext}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Desktop: Dots */}
      <div
        className={styles.desktopContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onPageClick(index)}
            className={styles.pageButton}
          >
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
    </>
  );
}
