import { GoldenSection } from "./compositions/GoldenSection";
import { RuleOfThirds } from "./compositions/RuleOfThirds";
import { GoldenSpiral } from "./compositions/GoldenSpiral";
import { ColorCombination } from "../../data/dummy-data";

export const compositions = [
  { name: "Golden Section", Component: GoldenSection },
  { name: "Rule of Thirds", Component: RuleOfThirds },
  { name: "Golden Spiral", Component: GoldenSpiral },
];

interface SingleCompositionPageProps {
  combination: ColorCombination;
  compositionIndex: number;
  pageNumber: number;
}

export function SingleCompositionPage({
  combination,
  compositionIndex,
  pageNumber,
}: SingleCompositionPageProps) {
  const composition = compositions[compositionIndex];

  if (!composition) {
    return <div>Composition not found</div>;
  }

  const { Component, name } = composition;

  return (
    <div style={{ padding: "2rem", minHeight: "80vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h2 style={{ opacity: 0.7, marginBottom: "0.5rem" }}>{name}</h2>
          <h3 style={{ opacity: 0.5, fontSize: "1rem", fontWeight: "normal" }}>
            {combination.name}
          </h3>
        </div>
        <div style={{ maxWidth: "800px", margin: "0 auto", aspectRatio: "1/1" }}>
          <Component colors={combination.colors} />
        </div>
      </div>
    </div>
  );
}
