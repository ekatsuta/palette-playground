import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { generateShareUrl, shareUrl } from "../../utils/share";
import styles from "./ShareButton.module.css";

interface ShareButtonProps {
  paletteId: number;
  pageIndex: number;
  mood: string;
  compositionName?: string;
}

export function ShareButton({ paletteId, pageIndex, mood, compositionName }: ShareButtonProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    const url = generateShareUrl(paletteId, pageIndex, mood);
    const title = compositionName
      ? `Palette #${paletteId} - ${compositionName}`
      : `Palette #${paletteId}`;
    const text = `Check out this color palette: "${mood}"`;

    const success = await shareUrl(url, title, text);

    if (success) {
      // Show "Copied!" feedback for clipboard copy
      if (!navigator.share) {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    }
  };

  return (
    <button className={styles.shareButton} onClick={handleShare} aria-label="Share this palette">
      {showCopied ? (
        <>
          <Check size={16} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={16} />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
