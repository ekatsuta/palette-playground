import { useState } from "react";
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

export const compositions = [
  { name: "Golden Section", Component: GoldenSection },
  { name: "Rule of Thirds", Component: RuleOfThirds },
  { name: "Golden Spiral", Component: GoldenSpiral },
  { name: "Golden Triangles", Component: GoldenTriangles },
  { name: "Horizontal Balance", Component: HorizonBalance },
  { name: "Diagonal Harmony", Component: DiagonalHarmony },
  { name: "Symmetrical Balance", Component: SymmetricalBalance },
  { name: "Radial Bloom", Component: RadialBloom },
  { name: "Pyramid", Component: Pyramid },
  { name: "L-Shape", Component: LShape },
  { name: "Fulcrum", Component: FulcrumComposition },
  { name: "S-Curve", Component: SCurveComposition },
  { name: "Spiral Section", Component: SpiralSection },
  { name: "Circular", Component: CircularComposition },
];

interface SingleCompositionPageProps {
  combination: PaletteWithReasoning;
  compositionIndex: number;
}

export function SingleCompositionPage({
  combination,
  compositionIndex,
}: SingleCompositionPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const composition = compositions[compositionIndex];

  if (!composition) {
    return <div>Composition not found</div>;
  }

  const { Component, name } = composition;

  const hexColors = combination.colors.map((c) => c.hex);

  return (
    <div className={styles.compositionPage}>
      <div className={styles.compositionPageInner}>
        <div className={styles.compositionName}>
          <h2>{name}</h2>
        </div>

        <div className={styles.compositionCanvas} onClick={() => setIsModalOpen(true)}>
          <Component colors={hexColors} />
        </div>

        <div className={styles.hexSquaresList}>
          {combination.colors.map((color, index) => (
            <div
              key={index}
              className={styles.hexSquare}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              <span className={styles.hexText}>{color.hex}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full composition view */}
      <CompositionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Component colors={hexColors} />
      </CompositionModal>
    </div>
  );
}
