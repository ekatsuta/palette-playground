import { useParams, useNavigate } from "react-router-dom";
import sanzoWadaColors from "../../../data/sanzo-wada-colors.json";
import styles from "./PaletteDetail.module.css";

export function PaletteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const palette = sanzoWadaColors.find((p) => p.id === Number(id));

  if (!palette) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Palette not found</h1>
        <button onClick={() => navigate("/palettes")}>← Back to All Palettes</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={() => navigate("/palettes")} className={styles.backButton}>
        ← Back to All Palettes
      </button>

      <div className={styles.paletteId}>#{palette.id}</div>

      {palette.colors.map((color, idx) => (
        <div key={idx} className={styles.colorSection} style={{ backgroundColor: color.hex }}>
          <div className={styles.colorInfo}>
            <div className={styles.colorName}>{color.name}</div>
            <div className={styles.colorHex}>{color.hex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
