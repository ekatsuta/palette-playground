import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import sanzoWadaColors from "../../../data/sanzo-wada-colors.json";
import styles from "./RotatingPalette.module.css";

export const moodPaletteMappings = [
  { mood: "The quiet melancholy of rain on autumn leaves", paletteId: 182 },
  { mood: "Electric excitement and urban energy at night", paletteId: 144 },
  { mood: "Warm comfort of a sunlit afternoon", paletteId: 138 },
  { mood: "Birthday cake frosting", paletteId: 14 },
  { mood: "Cozy night by the fireplace", paletteId: 243 },
  { mood: "Fresh morning dew on spring flowers", paletteId: 150 },
  { mood: "Golden hour at the beach", paletteId: 151 },
  { mood: "Nostalgic warmth of childhood memories", paletteId: 300 },
  { mood: "Modern minimalist sophistication", paletteId: 139 },
];

export function RotatingPalette() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % moodPaletteMappings.length);
    }, 2500); // Change palette every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentMapping = moodPaletteMappings[currentIndex];
  const currentPalette = sanzoWadaColors.find((p) => p.id === currentMapping.paletteId);
  const currentMood = currentMapping.mood;

  if (!currentPalette) {
    return null;
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMapping.paletteId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className={styles.paletteWrapper}
        >
          {/* Color swatches */}
          <div className={styles.colorSwatches}>
            {currentPalette.colors.map((color, idx) => (
              <motion.div
                key={idx}
                className={styles.colorSwatch}
                style={{ backgroundColor: color.hex }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
              />
            ))}
          </div>

          {/* Sample mood/input */}
          <p className={styles.moodText}>"{currentMood}"</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
