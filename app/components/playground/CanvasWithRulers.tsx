"use client";

import { Canvas } from "./Canvas";
import { GradientData } from "../../playground/utils/gradientGenerator";
import { ReactNode, useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Shuffle, Scissors, Maximize2, RectangleHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { CROP_PRESETS } from "./InlineCrop";

interface CanvasWithRulersProps {
  width: number;
  height: number;
  backgroundSrc?: string;
  backgroundGradient?: GradientData | null;
  backgroundBlur?: number;
  uploadedImageSrc?: string;
  imageTransform: {
    width: number;
    height: number;
    rotation: number;
    scale: number;
    borderRadius: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
  };
  onImageClick?: () => void;
  onBackgroundClick?: () => void;
  overlay?: ReactNode;
  onBackgroundDrawerOpen?: () => void;
  onImageUpload?: (file: File) => void;
  onCropClick?: () => void;
  onScaleClick?: () => void;
  onBorderRadiusClick?: () => void;
  isImageSelected?: boolean;
  isCropping?: boolean;
  showBorderRadiusSlider?: boolean;
  borderRadius?: number;
  onBorderRadiusChange?: (value: number) => void;
  cropPresetIndex?: number;
  onCropPresetChange?: (index: number) => void;
  isBackgroundDrawerOpen?: boolean;
}

export function CanvasWithRulers({
  width,
  height,
  backgroundSrc,
  backgroundGradient,
  backgroundBlur,
  uploadedImageSrc,
  imageTransform,
  onImageClick,
  onBackgroundClick,
  overlay,
  onBackgroundDrawerOpen,
  onImageUpload,
  onCropClick,
  onScaleClick,
  onBorderRadiusClick,
  isImageSelected = false,
  isCropping = false,
  showBorderRadiusSlider = false,
  borderRadius = 0,
  onBorderRadiusChange,
  cropPresetIndex = 0,
  onCropPresetChange,
  isBackgroundDrawerOpen = false,
}: CanvasWithRulersProps) {
  // Use state for viewport-dependent calculations to avoid hydration errors
  const [maxDisplayWidth, setMaxDisplayWidth] = useState(1200);
  const [maxDisplayHeight, setMaxDisplayHeight] = useState(800);
  const [zoomLevel, setZoomLevel] = useState(85);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  // Handle keyboard events for border radius slider
  useEffect(() => {
    if (!showBorderRadiusSlider) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && onBorderRadiusClick) {
        onBorderRadiusClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showBorderRadiusSlider, onBorderRadiusClick]);

  useEffect(() => {
    // Update display dimensions after mount (client-side only)
    const updateDimensions = () => {
      setMaxDisplayWidth(window.innerWidth * 0.7);
      setMaxDisplayHeight(window.innerHeight * 0.8);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const scaleX = Math.min(1, maxDisplayWidth / width);
  const scaleY = Math.min(1, maxDisplayHeight / height);
  const baseDisplayScale = Math.min(scaleX, scaleY);
  const displayScale = baseDisplayScale * (zoomLevel / 85);

  const displayWidth = width * displayScale;
  const displayHeight = height * displayScale;

  return (
    <>
      <motion.div
        className="relative inline-block"
        animate={{
          x: isBackgroundDrawerOpen ? -192 : 0,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div
          className="relative inline-block border border-gray-200"
          style={{
            width: displayWidth,
            height: displayHeight,
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Canvas with scale transform */}
          <div
            className="relative"
            style={{
              transform: `scale(${displayScale})`,
              transformOrigin: "top left",
              width: width,
              height: height,
            }}
          >
            <Canvas
              width={width}
              height={height}
              backgroundSrc={backgroundSrc}
              backgroundGradient={backgroundGradient}
              backgroundBlur={backgroundBlur}
              uploadedImageSrc={uploadedImageSrc}
              imageTransform={imageTransform}
              onImageClick={onImageClick}
              onBackgroundClick={onBackgroundClick}
            />
            {/* Render overlay inside the same scaled container */}
            {overlay}
          </div>
        </div>
      </motion.div>

      {/* Fixed controls at the bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-between z-40 w-full max-w-4xl px-8">
        {/* Zoom slider on the left */}
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="50"
            max="85"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-48 h-1 bg-gray-300 rounded-full appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, #d1d5db 0%, #d1d5db ${
                ((zoomLevel - 50) / (85 - 50)) * 100
              }%, #e5e7eb ${
                ((zoomLevel - 50) / (85 - 50)) * 100
              }%, #e5e7eb 100%)`,
            }}
          />
          <span className="text-sm text-gray-700 font-medium min-w-[3ch]">
            {zoomLevel}%
          </span>
        </div>

        {/* Buttons on the right */}
        <div className="flex items-center gap-4">
          {isCropping && onCropPresetChange ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Crop Dimension:</span>
              <div className="flex gap-2">
                {CROP_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => onCropPresetChange(index)}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                      cropPresetIndex === index
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          ) : showBorderRadiusSlider && onBorderRadiusChange ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Border Radius:</span>
              <input
                type="range"
                value={borderRadius}
                onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
                className="w-48 h-1 bg-gray-300 rounded-full appearance-none cursor-pointer slider-thumb"
                min="0"
                max="500"
                step="1"
              />
              <input
                type="number"
                value={borderRadius}
                onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
                className="w-16 px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-900 text-center focus:outline-none focus:border-gray-400"
                min="0"
                max="500"
              />
            </div>
          ) : isImageSelected && uploadedImageSrc ? (
            <>
              <button
                onClick={onCropClick}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Scissors className="w-4 h-4" />
                Crop
              </button>
              <button
                onClick={onScaleClick}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
                Scale
              </button>
              <button
                onClick={onBorderRadiusClick}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RectangleHorizontal className="w-4 h-4" />
                Border Radius
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onBackgroundDrawerOpen}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                Change BG
              </button>
              <button
                onClick={handleImageUploadClick}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Image
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </>
  );
}
