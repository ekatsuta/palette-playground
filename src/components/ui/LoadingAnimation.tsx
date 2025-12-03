import { motion } from "motion/react";
import styles from "./LoadingAnimation.module.css";

// Mini icon versions of the composition components - outline only
function RuleOfThirdsIcon() {
  return (
    <svg viewBox="0 0 60 60" className={styles.icon}>
      {/* Complete grid using only lines to avoid overlaps */}
      {/* Horizontal lines */}
      <line x1="0" y1="0" x2="60" y2="0" stroke="currentColor" strokeWidth="0.75" />
      <line x1="0" y1="20" x2="60" y2="20" stroke="currentColor" strokeWidth="0.75" />
      <line x1="0" y1="40" x2="60" y2="40" stroke="currentColor" strokeWidth="0.75" />
      <line x1="0" y1="60" x2="60" y2="60" stroke="currentColor" strokeWidth="0.75" />
      {/* Vertical lines */}
      <line x1="0" y1="0" x2="0" y2="60" stroke="currentColor" strokeWidth="0.75" />
      <line x1="20" y1="0" x2="20" y2="60" stroke="currentColor" strokeWidth="0.75" />
      <line x1="40" y1="0" x2="40" y2="60" stroke="currentColor" strokeWidth="0.75" />
      <line x1="60" y1="0" x2="60" y2="60" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

function RadialBloomIcon() {
  return (
    <svg viewBox="0 0 60 60" className={styles.icon}>
      {/* Outer circle */}
      <circle cx="30" cy="30" r="30" fill="none" stroke="currentColor" strokeWidth="0.75" />
      {/* Radial lines creating 8 segments */}
      <line x1="30" y1="30" x2="30" y2="0" stroke="currentColor" strokeWidth="0.75" />
      <line x1="30" y1="30" x2="51.2" y2="8.8" stroke="currentColor" strokeWidth="0.75" />
      <line x1="30" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="0.75" />
      <line x1="30" y1="30" x2="51.2" y2="51.2" stroke="currentColor" strokeWidth="0.75" />
      <line x1="30" y1="30" x2="30" y2="60" stroke="currentColor" strokeWidth="0.75" />
      <line x1="30" y1="30" x2="8.8" y2="51.2" stroke="currentColor" strokeWidth="0.75" />
      <line x1="30" y1="30" x2="0" y2="30" stroke="currentColor" strokeWidth="0.75" />
      <line x1="30" y1="30" x2="8.8" y2="8.8" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

function GoldenSectionIcon() {
  return (
    <svg viewBox="0 0 60 60" className={styles.icon}>
      {/* Outer border using lines */}
      <line x1="0" y1="0" x2="60" y2="0" stroke="currentColor" strokeWidth="0.75" />
      <line x1="60" y1="0" x2="60" y2="60" stroke="currentColor" strokeWidth="0.75" />
      <line x1="60" y1="60" x2="0" y2="60" stroke="currentColor" strokeWidth="0.75" />
      <line x1="0" y1="60" x2="0" y2="0" stroke="currentColor" strokeWidth="0.75" />
      {/* Dividing line at golden ratio */}
      <line x1="37" y1="0" x2="37" y2="60" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

export function LoadingAnimation() {
  // Each icon shows for ~1.5s, with total cycle of 4.5s
  const cycleDuration = 4.5; // Total duration for all 3 icons

  return (
    <div className={styles.container}>
      <div className={styles.iconsContainer}>
        {/* Icon 1: Rule of Thirds - shows first */}
        <motion.div
          className={styles.iconWrapper}
          animate={{
            opacity: [1, 1, 0, 0, 0, 0],
          }}
          transition={{
            opacity: {
              duration: cycleDuration,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.3, 0.33, 0.63, 0.97, 1],
            },
          }}
        >
          <RuleOfThirdsIcon />
        </motion.div>

        {/* Icon 2: Radial Bloom - shows second */}
        <motion.div
          className={styles.iconWrapper}
          animate={{
            opacity: [0, 0, 1, 1, 0, 0],
          }}
          transition={{
            opacity: {
              duration: cycleDuration,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.33, 0.36, 0.63, 0.66, 1],
            },
          }}
        >
          <RadialBloomIcon />
        </motion.div>

        {/* Icon 3: Golden Section - shows third */}
        <motion.div
          className={styles.iconWrapper}
          animate={{
            opacity: [0, 0, 1, 1, 0],
          }}
          transition={{
            opacity: {
              duration: cycleDuration,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.66, 0.69, 0.97, 1],
            },
          }}
        >
          <GoldenSectionIcon />
        </motion.div>
      </div>

      <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className={styles.loadingText}>Generating your perfect palette...</p>
        <p className={styles.loadingSubtext}>
          Analyzing your mood and selecting the best color combination.
        </p>
      </motion.div>
    </div>
  );
}
