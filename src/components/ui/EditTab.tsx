import { useState } from "react";
import { SketchPicker } from "react-color";
import type { ColorResult } from "react-color";
import type { PaletteWithReasoning } from "../../types/palette";
import styles from "./PaletteEditor.module.css";

interface EditTabProps {
  currentPalette: PaletteWithReasoning;
  onApplyEdits: (editedColors: string[]) => void;
}

export function EditTab({ currentPalette, onApplyEdits }: EditTabProps) {
  const [editedColors, setEditedColors] = useState(currentPalette.colors.map((c) => c.hex));
  const [openPickerIndex, setOpenPickerIndex] = useState<number | null>(null);

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

  return (
    <div className={styles.editTab}>
      <div className={styles.colorEditors}>
        {currentPalette.colors.map((color, index) => (
          <div key={index} className={styles.colorEditor}>
            <div className={styles.colorPreview} style={{ backgroundColor: editedColors[index] }} />
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
                  <div className={styles.pickerCover} onClick={() => setOpenPickerIndex(null)} />
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
      <button className={styles.applyButton} onClick={() => onApplyEdits(editedColors)}>
        Apply Changes
      </button>
    </div>
  );
}
