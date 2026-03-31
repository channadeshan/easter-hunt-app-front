import React from "react";
import { EmojiAsset } from "../config/emojiAssets";

interface EmojiPickerProps {
  pool: EmojiAsset[];
  selected: string; // the currently selected URL
  onChange: (url: string) => void;
  /** Highlight colour when selected — defaults to hunt-canary */
  accentClass?: string;
  accentBorder?: string;
  /** Size of each button in Tailwind classes */
  size?: string;
}

export default function EmojiPicker({
  pool,
  selected,
  onChange,
  accentClass = "bg-hunt-canary/20",
  accentBorder = "border-hunt-canary",
  size = "w-10 h-10",
}: EmojiPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {pool.map((asset, index) => {
        const isSelected = selected === asset.url;
        return (
          <button
            key={index}
            type="button"
            title={asset.label}
            onClick={() => onChange(asset.url)}
            className={`
              ${size} rounded-xl flex items-center justify-center
              border transition-all duration-150 overflow-hidden p-1
              ${
                isSelected
                  ? `${accentClass} ${accentBorder} scale-110 shadow-lg`
                  : "bg-hunt-bg border-hunt-border hover:border-gray-500 hover:scale-105"
              }
            `}
          >
            <img
              src={asset.url}
              alt={asset.label}
              className="w-full h-full object-contain"
              loading="lazy"
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
}
