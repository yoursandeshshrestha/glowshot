"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { CanvasSize } from "../../playground/types";
import {
  RectangleHorizontal,
  Square,
  RectangleVertical,
  Download,
  Maximize2,
} from "lucide-react";

interface PlaygroundHeaderProps {
  canvasSizes: CanvasSize[];
  selectedCanvasSize: number;
  onCanvasSizeChange: (index: number) => void;
  onDownload?: (scale: number, format: "png" | "jpeg") => void;
  hasImage?: boolean;
  customWidth?: number;
  customHeight?: number;
  onCustomDimensionsChange?: (width: number, height: number) => void;
  onFilenameChange?: (filename: string) => void;
}

export function PlaygroundHeader({
  canvasSizes,
  selectedCanvasSize,
  onCanvasSizeChange,
  onDownload,
  hasImage = false,
  customWidth = 1200,
  customHeight = 1200,
  onCustomDimensionsChange,
  onFilenameChange,
}: PlaygroundHeaderProps) {
  // Generate initial filename with random value
  const generateRandomFilename = () => {
    const randomValue = Math.random().toString(36).substring(2, 8);
    return `glowshot-${randomValue}`;
  };

  const [filename, setFilename] = useState(generateRandomFilename());
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const [tempWidth, setTempWidth] = useState(customWidth.toString());
  const [tempHeight, setTempHeight] = useState(customHeight.toString());

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target as Node)
      ) {
        setIsDownloadMenuOpen(false);
      }
    };

    if (isDownloadMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDownloadMenuOpen]);

  // Sync temp values with custom dimensions
  useEffect(() => {
    setTempWidth(customWidth.toString());
    setTempHeight(customHeight.toString());
  }, [customWidth, customHeight]);

  // Notify parent of filename changes
  useEffect(() => {
    if (onFilenameChange) {
      onFilenameChange(filename);
    }
  }, [filename, onFilenameChange]);

  const handleDownloadClick = (scale: number, format: "png" | "jpeg") => {
    if (onDownload) {
      onDownload(scale, format);
      setIsDownloadMenuOpen(false);
    }
  };

  const handleCustomWidthChange = (value: string) => {
    setTempWidth(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && onCustomDimensionsChange) {
      onCustomDimensionsChange(numValue, customHeight);
    }
  };

  const handleCustomHeightChange = (value: string) => {
    setTempHeight(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && onCustomDimensionsChange) {
      onCustomDimensionsChange(customWidth, numValue);
    }
  };

  const isCustomSelected = selectedCanvasSize === canvasSizes.length - 1;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-medium text-gray-900 hover:text-gray-700 transition-colors"
        >
          Glowshot
        </Link>

        {/* Center controls */}
        <div className="flex items-center gap-6">
          {/* Filename editor */}
          <div className="flex items-center gap-2">
            {isEditingFilename ? (
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                onBlur={() => setIsEditingFilename(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingFilename(false);
                }}
                autoFocus
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
              />
            ) : (
              <button
                onClick={() => setIsEditingFilename(true)}
                className="px-2 py-1 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                {filename}
              </button>
            )}
          </div>

          {/* Canvas size selector */}
          <div className="flex items-center gap-2">
            {canvasSizes.map((size, index) => {
              const isCustom = size.name === "Custom";
              const getIcon = () => {
                if (isCustom) return Maximize2;
                if (size.width > size.height) return RectangleHorizontal;
                if (size.width === size.height) return Square;
                return RectangleVertical;
              };
              const Icon = getIcon();

              return (
                <button
                  key={index}
                  onClick={() => onCanvasSizeChange(index)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                    selectedCanvasSize === index
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {isCustom ? "Custom" : `${size.width}×${size.height}`}
                </button>
              );
            })}
          </div>

          {/* Custom dimension inputs */}
          {isCustomSelected && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tempWidth}
                onChange={(e) => handleCustomWidthChange(e.target.value)}
                min="1"
                max="10000"
                className="w-20 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                placeholder="Width"
              />
              <span className="text-xs text-gray-500">×</span>
              <input
                type="number"
                value={tempHeight}
                onChange={(e) => handleCustomHeightChange(e.target.value)}
                min="1"
                max="10000"
                className="w-20 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-gray-900"
                placeholder="Height"
              />
            </div>
          )}
        </div>

        <nav className="flex items-center gap-4">
          {hasImage && onDownload && (
            <div className="relative" ref={downloadMenuRef}>
              <button
                onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              {isDownloadMenuOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[100] max-h-96 overflow-y-auto">
                  {downloadOptions.map((option) => (
                    <button
                      key={`${option.scale}-${option.format}`}
                      onClick={() =>
                        handleDownloadClick(option.scale, option.format)
                      }
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors block border-b border-gray-100 last:border-b-0"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
