import { useState } from "react";
import { X } from "lucide-react";
import type { PaletteWithReasoning, SanzoWadaCombination } from "../../types/palette";
import { BrowseTab } from "./BrowseTab";
import { EditTab } from "./EditTab";
import styles from "./PaletteEditor.module.css";

interface PaletteEditorProps {
  currentPalette: PaletteWithReasoning;
  onClose: () => void;
  onApply: (palette: PaletteWithReasoning) => void;
}

export function PaletteEditor({ currentPalette, onClose, onApply }: PaletteEditorProps) {
  const [activeTab, setActiveTab] = useState<"browse" | "edit">("browse");

  const handlePaletteSelect = (palette: SanzoWadaCombination) => {
    const newPalette: PaletteWithReasoning = {
      ...palette,
      inspirations: currentPalette.inspirations,
    };
    onApply(newPalette);
    onClose();
  };

  const handleApplyEdits = (editedColors: string[]) => {
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
            <BrowseTab currentPalette={currentPalette} onPaletteSelect={handlePaletteSelect} />
          )}

          {activeTab === "edit" && (
            <EditTab currentPalette={currentPalette} onApplyEdits={handleApplyEdits} />
          )}
        </div>
      </div>
    </div>
  );
}
