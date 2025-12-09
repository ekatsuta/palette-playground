import { sanzoWadaData } from "../../../data/dummy-data";
import type { PaletteWithReasoning, SanzoWadaCombination } from "../../types/palette";
import styles from "./PaletteEditor.module.css";

interface BrowseTabProps {
  currentPalette: PaletteWithReasoning;
  onPaletteSelect: (palette: SanzoWadaCombination) => void;
}

export function BrowseTab({ currentPalette, onPaletteSelect }: BrowseTabProps) {
  // Group palettes by number of colors
  const palettesByCount = {
    2: sanzoWadaData.filter((p) => p.colors.length === 2),
    3: sanzoWadaData.filter((p) => p.colors.length === 3),
    4: sanzoWadaData.filter((p) => p.colors.length === 4),
  };

  return (
    <div className={styles.browseTab}>
      {Object.entries(palettesByCount).map(([count, palettes]) => (
        <div key={count} className={styles.category}>
          <h3 className={styles.categoryTitle}>
            {count} Colors ({palettes.length} palettes)
          </h3>
          <div className={styles.paletteGrid}>
            {palettes.map((palette) => (
              <button
                key={palette.id}
                className={`${styles.paletteCard} ${
                  palette.id === currentPalette.id ? styles.paletteCardActive : ""
                }`}
                onClick={() => onPaletteSelect(palette)}
                title={`Palette ${palette.id}`}
              >
                <div className={styles.paletteColors}>
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      className={styles.colorSwatch}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className={styles.paletteId}>#{palette.id}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
