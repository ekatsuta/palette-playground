import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./components/pages/Home";
import { AllPalettes } from "./components/pages/AllPalettes";
import { PaletteDetail } from "./components/pages/PaletteDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/palettes" element={<AllPalettes />} />
      <Route path="/palettes/:id" element={<PaletteDetail />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
