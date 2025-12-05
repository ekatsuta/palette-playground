import { useState } from "react";
import { X } from "lucide-react";
import { SketchPicker } from "react-color";
import type { ColorResult } from "react-color";
import { sanzoWadaData } from "../../../data/dummy-data";
import type { PaletteWithReasoning, SanzoWadaCombination } from "../../types/palette";
import styles from "./PaletteEditor.module.css";

interface PaletteEditorProps {
  currentPalette: PaletteWithReasoning;
  onClose: () => void;
  onApply: (palette: PaletteWithReasoning) => void;
}

export function PaletteEditor({ currentPalette, onClose, onApply }: PaletteEditorProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "edit">("browse");
  const [editedColors, setEditedColors] = useState(currentPalette.colors.map((c) => c.hex));
  const [openPickerIndex, setOpenPickerIndex] = useState<number | null>(null);

  // Group palettes by number of colors
  const palettesByCount = {
    2: sanzoWadaData.filter((p) => p.colors.length === 2),
    3: sanzoWadaData.filter((p) => p.colors.length === 3),
    4: sanzoWadaData.filter((p) => p.colors.length === 4),
  };

  const handlePaletteSelect = (palette: SanzoWadaCombination) => {
    const newPalette: PaletteWithReasoning = {
      ...palette,
      inspirations: currentPalette.inspirations,
    };
    onApply(newPalette);
    onClose();
  };

  const handleColorChange = (index: number, color: ColorResult) => {
    const updated = [...editedColors];
    updated[index] = color.hex;
    setEditedColors(updated);
  };

  const handleHexInputChange = (index: number, newHex: string) => {
    const updated = [...editedColors];
    updated[index] = newHex;
    setEditedColors(updated);
  };

  const handleApplyEdits = () => {
    const updatedPalette: PaletteWithReasoning = {
      ...currentPalette,
      colors: editedColors.map((hex, i) => {
        // If the color was edited, remove the original name
        const wasEdited = hex !== currentPalette.colors[i].hex;
        return {
          name: wasEdited ? `Color ${i + 1}` : currentPalette.colors[i].name,
          hex: hex,
        };
      }),
    };
    onApply(updatedPalette);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Palette</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "browse" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            Browse Palettes
          </button>
          <button
            className={`${styles.tab} ${activeTab === "edit" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit Colors
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === "browse" && (
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
                        onClick={() => handlePaletteSelect(palette)}
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
          )}

          {activeTab === "edit" && (
            <div className={styles.editTab}>
              <div className={styles.colorEditors}>
                {currentPalette.colors.map((color, index) => (
                  <div key={index} className={styles.colorEditor}>
                    <div
                      className={styles.colorPreview}
                      style={{ backgroundColor: editedColors[index] }}
                    />
                    <div className={styles.colorInfo}>
                      <label className={styles.colorLabel}>{color.name}</label>
                      <button
                        type="button"
                        className={styles.colorPickerButton}
                        onClick={() => setOpenPickerIndex(openPickerIndex === index ? null : index)}
                        style={{ backgroundColor: editedColors[index] }}
                        aria-label={`Pick color for ${color.name}`}
                      />
                      {openPickerIndex === index && (
                        <>
                          <div
                            className={styles.pickerCover}
                            onClick={() => setOpenPickerIndex(null)}
                          />
                          <div className={styles.pickerPopover}>
                            <SketchPicker
                              color={editedColors[index]}
                              onChange={(color) => handleColorChange(index, color)}
                              disableAlpha
                            />
                          </div>
                        </>
                      )}
                      <input
                        type="text"
                        value={editedColors[index]}
                        onChange={(e) => handleHexInputChange(index, e.target.value)}
                        className={styles.hexInput}
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className={styles.applyButton} onClick={handleApplyEdits}>
                Apply Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
