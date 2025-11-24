import { useNavigate } from "react-router-dom";
import sanzoWadaColors from "../../../data/sanzo-wada-colors.json";
import styles from "./AllPalettes.module.css";

export function AllPalettes() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          ← Back to Home
        </button>
        <h1 className={styles.title}>All Color Combinations</h1>
        <p className={styles.subtitle}>
          Showing all {sanzoWadaColors.length} palettes from the Sanzo Wada Dictionary
        </p>
      </div>

      <div className={styles.grid}>
        {sanzoWadaColors.map((palette) => (
          <div
            key={palette.id}
            className={styles.paletteCard}
            onClick={() => navigate(`/palettes/${palette.id}`)}
          >
            <div className={styles.paletteId}>#{palette.id}</div>
            <div className={styles.colorSwatches}>
              {palette.colors.map((color, idx) => (
                <div
                  key={idx}
                  className={styles.colorSwatch}
                  style={{ backgroundColor: color.hex }}
                  title={`${color.name} (${color.hex})`}
                />
              ))}
            </div>
            <div className={styles.colorNames}>
              {palette.colors.map((color, idx) => (
                <div key={idx} className={styles.colorName}>
                  {color.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
