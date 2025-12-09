import { useState } from "react";
import { Info, Shuffle } from "lucide-react";
import { GoldenSection } from "../compositions/GoldenSection";
import { RuleOfThirds } from "../compositions/RuleOfThirds";
import { GoldenSpiral } from "../compositions/GoldenSpiral";
import type { PaletteWithReasoning } from "../../types/palette";
import styles from "./SingleCompositionPage.module.css";
import { LShape } from "../compositions/LShape";
import { DiagonalHarmony } from "../compositions/DiagnoalHarmony";
import { GoldenTriangles } from "../compositions/GoldenTriangles";
import { HorizonBalance } from "../compositions/HorizontalBalance";
import { SymmetricalBalance } from "../compositions/SymmetricalBalance";
import { RadialBloom } from "../compositions/RadialBloom";
import { Pyramid } from "../compositions/Pyramid";
import { SCurveComposition } from "../compositions/SCurve";
import { SpiralSection } from "../compositions/SpiralSection";
import { CircularComposition } from "../compositions/Circular";
import { FulcrumComposition } from "../compositions/Fulcrum";
import { CompositionModal } from "../ui/CompositionModal";
import { ShareButton } from "../ui/ShareButton";

export const compositions = [
  {
    name: "Golden Section",
    Component: GoldenSection,
    description:
      "Divides space using the golden ratio (1:1.618), creating naturally balanced compositions.",
  },
  {
    name: "Rule of Thirds",
    Component: RuleOfThirds,
    description: "Places key elements along a 3x3 grid for dynamic, dynamic balance.",
  },
  {
    name: "Golden Spiral",
    Component: GoldenSpiral,
    description: "Guides the eye through a natural, flowing curve based on Fibonacci sequence.",
  },
  {
    name: "Golden Triangles",
    Component: GoldenTriangles,
    description:
      "Uses diagonal lines to create dynamic movement and energy. Best for dynamic scenes with diagonal elements.",
  },
  {
    name: "Horizontal Balance",
    Component: HorizonBalance,
    description: "Creates calm, stable compositions with horizontal divisions.",
  },
  {
    name: "Diagonal Harmony",
    Component: DiagonalHarmony,
    description:
      "Adds energy and movement through diagonal divisions. Useful for dynamic presentations and eye-catching designs.",
  },
  {
    name: "Symmetrical Balance",
    Component: SymmetricalBalance,
    description: "Provides formal, stable compositions through mirror symmetry.",
  },
  {
    name: "Radial Bloom",
    Component: RadialBloom,
    description: "Draws focus to a central point with radiating elements.",
  },
  {
    name: "Pyramid",
    Component: Pyramid,
    description: "Creates hierarchical stability with a triangular structure.",
  },
  {
    name: "L-Shape",
    Component: LShape,
    description:
      "Balances negative space with an L-shaped element. Effective for modern, minimalist layouts and asymmetric designs.",
  },
  {
    name: "Fulcrum",
    Component: FulcrumComposition,
    description:
      "(or Steelyard) Balances visual weight around a central pivot point. Large mass is counterbalanced by a smaller mass placed further away from the center.",
  },
  {
    name: "S-Curve",
    Component: SCurveComposition,
    description:
      "Leads the eye through a smooth, flowing S-shaped path. Ideal for natural, elegant, and graceful compositions.",
  },
  {
    name: "Spiral Section",
    Component: SpiralSection,
    description:
      "Guides attention inward with a sectioned spiral pattern. Great for progressive storytelling and focal emphasis.",
  },
  {
    name: "Circular",
    Component: CircularComposition,
    description: "Creates unity and completeness with circular arrangements.",
  },
];

interface SingleCompositionPageProps {
  combination: PaletteWithReasoning;
  compositionIndex: number;
  mood: string;
  pageIndex: number;
}

export function SingleCompositionPage({
  combination,
  compositionIndex,
  mood,
  pageIndex,
}: SingleCompositionPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [shuffledColors, setShuffledColors] = useState<string[] | null>(null);
  const composition = compositions[compositionIndex];

  if (!composition) {
    return <div>Composition not found</div>;
  }

  const { Component, name, description } = composition;

  const hexColors = combination.colors.map((c) => c.hex);
  const displayColors = shuffledColors || hexColors;

  const copyHexToClipboard = async (hex: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShuffle = () => {
    const newColors = [...hexColors].sort(() => Math.random() - 0.5);
    setShuffledColors(newColors);
  };

  return (
    <div className={styles.compositionPage}>
      <div className={styles.compositionPageInner}>
        {/* Mobile: Title above composition */}
        <div className={styles.mobileHeader}>
          <div className={styles.compositionName}>
            <h2>
              {name}
              <button
                className={styles.infoIcon}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                aria-label="Composition information"
              >
                <Info size={14} />
              </button>
            </h2>
            {showTooltip && <div className={styles.tooltip}>{description}</div>}
          </div>
        </div>

        <div className={styles.compositionLayout}>
          {/* Desktop: Title and share on left */}
          <div className={styles.leftSection}>
            <div className={styles.compositionName}>
              <h2>
                {name}
                <button
                  className={styles.infoIcon}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                  aria-label="Composition information"
                >
                  <Info size={14} />
                </button>
              </h2>
              {showTooltip && <div className={styles.tooltip}>{description}</div>}
            </div>
            <div className={styles.shareSection}>
              <ShareButton
                paletteId={combination.id}
                pageIndex={pageIndex}
                mood={mood}
                compositionName={name}
                inspirations={combination.inspirations}
              />
              <button
                type="button"
                className={styles.shuffleButton}
                onClick={handleShuffle}
                title="Shuffle colors"
              >
                <Shuffle size={16} />
                <span>Shuffle</span>
              </button>
            </div>
            <div className={styles.hexSquaresList}>
              {hexColors.map((hex, index) => (
                <button
                  key={index}
                  className={styles.hexSquareWrapper}
                  onClick={() => copyHexToClipboard(hex, index)}
                  title="Click to copy"
                >
                  <div className={styles.hexSquare} style={{ backgroundColor: hex }} />
                  <span className={styles.hexText}>{hex}</span>
                </button>
              ))}
            </div>
            {copiedIndex !== null && (
              <div className={styles.copiedNotification}>Copied {hexColors[copiedIndex]}</div>
            )}
          </div>

          <div className={styles.compositionCanvasWrapper}>
            <div className={styles.compositionCanvas} onClick={() => setIsModalOpen(true)}>
              <Component colors={displayColors} />
            </div>
          </div>
        </div>

        {/* Mobile: Share button below composition */}
        <div className={styles.mobileFooter}>
          <div className={styles.shareSection}>
            <ShareButton
              paletteId={combination.id}
              pageIndex={pageIndex}
              mood={mood}
              compositionName={name}
              inspirations={combination.inspirations}
            />
            <button
              type="button"
              className={styles.shuffleButton}
              onClick={handleShuffle}
              title="Shuffle colors"
            >
              <Shuffle size={16} />
              <span>Shuffle</span>
            </button>
          </div>
          <div className={styles.hexSquaresList}>
            {hexColors.map((hex, index) => (
              <button
                key={index}
                className={styles.hexSquareWrapper}
                onClick={() => copyHexToClipboard(hex, index)}
                title="Click to copy"
              >
                <div className={styles.hexSquare} style={{ backgroundColor: hex }} />
                <span className={styles.hexText}>{hex}</span>
              </button>
            ))}
          </div>
          {copiedIndex !== null && (
            <div className={styles.copiedNotification}>Copied {hexColors[copiedIndex]}</div>
          )}
        </div>
      </div>

      <CompositionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Component colors={displayColors} />
      </CompositionModal>
    </div>
  );
}
