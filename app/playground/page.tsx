"use client";

import {
  CanvasWithRulers,
  InlineCrop,
  InlineScale,
  BackgroundDrawer,
} from "../components/playground";
import { PlaygroundHeader } from "../components/others/PlaygroundHeader";
import { useImageUpload } from "./hooks/useImageUpload";
import { useBackgroundCycle } from "./hooks/useBackgroundCycle";
import { useImageTransform } from "./hooks/useImageTransform";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { useState, useEffect } from "react";
import { exportCanvas, downloadImage } from "./utils/canvasExport";
import { CANVAS_SIZES } from "./types";

// Preload all background images
const BACKGROUND_IMAGES = [
  "/background/1.jpg",
  "/background/2.jpg",
  "/background/3.jpg",
  "/background/4.jpg",
  "/background/5.jpg",
  "/background/6.jpg",
  "/background/7.jpg",
  "/background/8.jpg",
  "/background/9.jpg",
  "/background/10.jpg",
  "/background/11.jpg",
  "/background/12.jpg",
  "/background/13.jpg",
  "/background/14.jpg",
  "/background/15.jpg",
  "/background/16.jpg",
];

export default function PlaygroundPage() {
  // Preload all background images for instant switching
  useImagePreloader(BACKGROUND_IMAGES);

  const { uploadedImage, originalImage, handleImageUpload, updateImage } =
    useImageUpload();
  const [isCropping, setIsCropping] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [showBorderRadiusSlider, setShowBorderRadiusSlider] = useState(false);
  const [cropPresetIndex, setCropPresetIndex] = useState(0);
  const [selectedCanvasSizeIndex, setSelectedCanvasSizeIndex] = useState(0);
  const [isBackgroundDrawerOpen, setIsBackgroundDrawerOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState(1200);
  const [customHeight, setCustomHeight] = useState(1200);

  const {
    currentBackground,
    generatedGradient,
    changeBackground,
    setSpecificBackground,
    handleBackgroundUpload,
    generateGradient,
    backgroundBlur,
    setBackgroundBlur,
  } = useBackgroundCycle();

  const currentCanvasSize = CANVAS_SIZES[selectedCanvasSizeIndex];
  const isCustomCanvas = currentCanvasSize.name === "Custom";
  const baseWidth = isCustomCanvas ? customWidth : currentCanvasSize.width;
  const baseHeight = isCustomCanvas ? customHeight : currentCanvasSize.height;

  const initialUploadedWidth = baseWidth * 0.85; // 15% less
  const initialUploadedHeight = baseHeight * 0.85; // 15% less

  const { transform, setWidth, setHeight, setBorderRadius, setScale } =
    useImageTransform(initialUploadedWidth, initialUploadedHeight);

  // Clear selection when image changes
  useEffect(() => {
    setIsImageSelected(false);
    setIsCropping(false);
    setIsScaling(false);
    setShowBorderRadiusSlider(false);
  }, [uploadedImage]);

  const handleCropClick = () => {
    setIsCropping(true);
    setIsScaling(false);
    setIsImageSelected(false);
    setShowBorderRadiusSlider(false);
  };

  const handleScaleClick = () => {
    setIsScaling(true);
    setIsCropping(false);
    setIsImageSelected(false);
    setShowBorderRadiusSlider(false);
  };

  const handleBorderRadiusClick = () => {
    setShowBorderRadiusSlider((prev) => !prev);
  };

  const handleCropComplete = (croppedImage: string) => {
    updateImage(croppedImage);
    setIsCropping(false);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
  };

  const handleScaleComplete = (width: number, height: number) => {
    setWidth(width);
    setHeight(height);
    setIsScaling(false);
  };

  const handleScaleCancel = () => {
    setIsScaling(false);
  };

  const handleImageClick = () => {
    if (!isCropping && !isScaling && uploadedImage) {
      setIsImageSelected((prev) => !prev);
    }
  };

  const handleBackgroundClick = () => {
    setIsImageSelected(false);
  };


  const handleCanvasSizeChange = (index: number) => {
    setSelectedCanvasSizeIndex(index);

    // Recalculate image dimensions when canvas size changes
    const newCanvasSize = CANVAS_SIZES[index];
    const isCustom = newCanvasSize.name === "Custom";
    const canvasWidth = isCustom ? customWidth : newCanvasSize.width;
    const canvasHeight = isCustom ? customHeight : newCanvasSize.height;
    const newWidth = canvasWidth * 0.85;
    const newHeight = canvasHeight * 0.85;
    setWidth(newWidth);
    setHeight(newHeight);
  };

  const handleCustomDimensionsChange = (width: number, height: number) => {
    setCustomWidth(width);
    setCustomHeight(height);

    // Update image dimensions if custom is selected
    if (isCustomCanvas) {
      setWidth(width * 0.85);
      setHeight(height * 0.85);
    }
  };

  const handleDownload = async (scale: number, format: "png" | "jpeg" = "png") => {
    try {
      const dataUrl = await exportCanvas({
        width: baseWidth,
        height: baseHeight,
        scale,
        format,
        quality: 0.95, // High quality for JPEG
        backgroundSrc: currentBackground,
        backgroundGradient: generatedGradient,
        backgroundBlur: backgroundBlur,
        uploadedImageSrc: uploadedImage || undefined,
        imageTransform: transform,
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const sizeName = currentCanvasSize.name
        .toLowerCase()
        .replace(/\s+/g, "-");
      const extension = format === "jpeg" ? "jpg" : "png";
      downloadImage(dataUrl, `donkey-${sizeName}-${scale}x-${timestamp}.${extension}`);
    } catch (error) {
      console.error("Failed to export canvas:", error);
    }
  };

  return (
    <>
      <PlaygroundHeader
        canvasSizes={CANVAS_SIZES}
        selectedCanvasSize={selectedCanvasSizeIndex}
        onCanvasSizeChange={handleCanvasSizeChange}
        onDownload={handleDownload}
        hasImage={!!uploadedImage}
        customWidth={customWidth}
        customHeight={customHeight}
        onCustomDimensionsChange={handleCustomDimensionsChange}
      />
      <div className="min-h-screen w-full bg-white relative">
        {/* Noise Texture (Darker Dots) Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "#ffffff",
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex items-center justify-center min-h-screen">
          <div className="relative">
        <CanvasWithRulers
          width={baseWidth}
          height={baseHeight}
          backgroundSrc={currentBackground}
          backgroundGradient={generatedGradient}
          backgroundBlur={backgroundBlur}
          uploadedImageSrc={isCropping || isScaling ? undefined : uploadedImage || undefined}
          imageTransform={transform}
          onImageClick={handleImageClick}
          onBackgroundClick={handleBackgroundClick}
          onBackgroundDrawerOpen={() => setIsBackgroundDrawerOpen(true)}
          onImageUpload={handleImageUpload}
          onCropClick={handleCropClick}
          onScaleClick={handleScaleClick}
          onBorderRadiusClick={handleBorderRadiusClick}
          isImageSelected={isImageSelected}
          isCropping={isCropping}
          showBorderRadiusSlider={showBorderRadiusSlider}
          borderRadius={transform.borderRadius}
          onBorderRadiusChange={setBorderRadius}
          cropPresetIndex={cropPresetIndex}
          onCropPresetChange={setCropPresetIndex}
          isBackgroundDrawerOpen={isBackgroundDrawerOpen}
          overlay={
            <>
              {isCropping && originalImage && (
                <InlineCrop
                  imageData={originalImage}
                  containerWidth={baseWidth}
                  containerHeight={baseHeight}
                  onCropComplete={handleCropComplete}
                  onCancel={handleCropCancel}
                  selectedPreset={cropPresetIndex}
                  onPresetChange={setCropPresetIndex}
                />
              )}
              {isScaling && originalImage && (
                <InlineScale
                  imageData={originalImage}
                  containerWidth={baseWidth}
                  containerHeight={baseHeight}
                  currentWidth={transform.width}
                  currentHeight={transform.height}
                  onScaleComplete={handleScaleComplete}
                  onCancel={handleScaleCancel}
                />
              )}
            </>
          }
        />

        <BackgroundDrawer
          isOpen={isBackgroundDrawerOpen}
          onClose={() => setIsBackgroundDrawerOpen(false)}
          onBackgroundSelect={setSpecificBackground}
          onBackgroundUpload={handleBackgroundUpload}
          onGenerateGradient={generateGradient}
        />
          </div>
        </div>
      </div>
    </>
  );
}
