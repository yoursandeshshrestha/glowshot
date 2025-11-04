"use client";

import { ArrowDownToLine } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DownloadMenuProps {
  onDownload: (scale: number, format: "png" | "jpeg") => void;
}

const downloadOptions = [
  { label: "1x PNG (Lossless)", scale: 1, format: "png" as const },
  { label: "1x JPEG (Compressed)", scale: 1, format: "jpeg" as const },
  { label: "2x PNG (2K Lossless)", scale: 2, format: "png" as const },
  { label: "2x JPEG (2K Compressed)", scale: 2, format: "jpeg" as const },
  { label: "3x PNG (3K Lossless)", scale: 3, format: "png" as const },
  { label: "3x JPEG (3K Compressed)", scale: 3, format: "jpeg" as const },
  { label: "4x PNG (4K Lossless)", scale: 4, format: "png" as const },
  { label: "4x JPEG (4K Compressed)", scale: 4, format: "jpeg" as const },
];

export function DownloadMenu({ onDownload }: DownloadMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleDownloadClick = (scale: number, format: "png" | "jpeg") => {
    onDownload(scale, format);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        <ArrowDownToLine className="w-4 h-4" />
        <span className="text-sm">Download</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-[100] max-h-96 overflow-y-auto">
          {downloadOptions.map((option, index) => (
            <button
              key={`${option.scale}-${option.format}`}
              onClick={() => handleDownloadClick(option.scale, option.format)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors block border-b border-gray-100 last:border-b-0"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

