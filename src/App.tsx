import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SingleCompositionPage, compositions } from "./components/SingleCompositionPage";
import { sanzoWadaData, ColorCombination } from "../data/dummy-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./App.css";

export default function App() {
  const [mood, setMood] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<ColorCombination | null>(null);
  const [currentCompositionIndex, setCurrentCompositionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Total number of compositions to paginate through
  const totalPages = compositions.length;

  // Simulate AI palette selection - select just ONE palette
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      // Randomly select 1 palette
      const shuffled = [...sanzoWadaData.combinations].sort(() => Math.random() - 0.5);
      const selected = shuffled[0];

      setSelectedPalette(selected);
      setCurrentCompositionIndex(0);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentCompositionIndex > 0) {
      setCurrentCompositionIndex(currentCompositionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentCompositionIndex < totalPages - 1) {
      setCurrentCompositionIndex(currentCompositionIndex + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentCompositionIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentCompositionIndex((prev) => Math.min(totalPages - 1, prev + 1));
      }
    };

    if (showResults) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showResults, totalPages]);

  return (
    <div className="app-container">
      {/* Header with input - always visible */}
      <div className="header">
        <div className="header-content">
          <div className="header-inner">
            <h1 className="header-title">Color Playground</h1>
            <form onSubmit={handleSubmit} className="search-form">
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="Describe a mood or feeling..."
                className="search-input"
              />
              <button type="submit" className="explore-button">
                Explore
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {!showResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="welcome-screen"
          >
            <div className="welcome-content">
              <div className="welcome-text-section">
                <div className="welcome-description">
                  <p>Discover harmonious color palettes inspired by your creative vision.</p>
                </div>
                <div className="welcome-subdescription">
                  <p>
                    Enter a mood, feeling, or concept above to explore curated combinations from the
                    Sanzo Wada Dictionary of Color.
                  </p>
                </div>
              </div>

              <div className="welcome-examples">
                <p className="welcome-example">
                  Try: "The quiet melancholy of rain on autumn leaves"
                </p>
                <p className="welcome-example">
                  Or: "Electric excitement and urban energy at night"
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="results-container">
            {/* Navigation arrows */}
            {currentCompositionIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="nav-button nav-button-left"
                aria-label="Previous composition"
              >
                <ChevronLeft />
              </button>
            )}

            {currentCompositionIndex < totalPages - 1 && (
              <button
                onClick={handleNext}
                className="nav-button nav-button-right"
                aria-label="Next composition"
              >
                <ChevronRight />
              </button>
            )}

            {/* Composition pages */}
            {selectedPalette && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCompositionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <SingleCompositionPage
                    combination={selectedPalette}
                    compositionIndex={currentCompositionIndex}
                    pageNumber={currentCompositionIndex + 1}
                  />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Page indicator */}
            <div className="page-indicator">
              <span>
                {currentCompositionIndex + 1} / {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
