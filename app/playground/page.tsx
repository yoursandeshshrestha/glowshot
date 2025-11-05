"use client";

import {
  CanvasWithRulers,
  InlineCrop,
  InlineScale,
  BackgroundDrawer,
} from "../components/playground";
import { PlaygroundHeader } from "../components/others/PlaygroundHeader";
import { PlaygroundFooter } from "../components/others/PlaygroundFooter";
import { useImageUpload } from "./hooks/useImageUpload";
import { useBackgroundCycle } from "./hooks/useBackgroundCycle";
import { useImageTransform } from "./hooks/useImageTransform";
import { useImagePreloader } from "./hooks/useImagePreloader";
import { useState, useEffect } from "react";
import { exportCanvas, downloadImage } from "./utils/canvasExport";
import { CANVAS_SIZES, BlurBlock } from "./types";

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
  const [blurBlocks, setBlurBlocks] = useState<BlurBlock[]>([]);
  const [isManagingBlurBlocks, setIsManagingBlurBlocks] = useState(false);
  const [selectedBlurBlockId, setSelectedBlurBlockId] = useState<string | null>(null);
  const [copiedBlurBlock, setCopiedBlurBlock] = useState<BlurBlock | null>(null);
  const [zoomLevel, setZoomLevel] = useState(85);
  const [exportFilename, setExportFilename] = useState("glowshot");

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
    // Update image first
    updateImage(croppedImage);
    // Use a small delay to ensure state updates before exiting crop mode
    setTimeout(() => {
      setIsCropping(false);
    }, 0);
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

  const handleImageSelectionDone = () => {
    setIsImageSelected(false);
    setShowBorderRadiusSlider(false);
  };

  const handleBackgroundClick = () => {
    setIsImageSelected(false);
    setSelectedBlurBlockId(null);
    setIsBackgroundDrawerOpen((prev) => !prev);
  };

  const handleAddBlurBlock = () => {
    const newBlock: BlurBlock = {
      id: `blur-${Date.now()}`,
      x: 25,
      y: 25,
      width: 25,
      height: 25,
      blurAmount: 10,
    };
    setBlurBlocks([...blurBlocks, newBlock]);
    setIsManagingBlurBlocks(true);
    setSelectedBlurBlockId(newBlock.id);
    setIsImageSelected(false);
    setIsCropping(false);
    setIsScaling(false);
  };

  const handleUpdateBlurBlock = (id: string, updates: Partial<BlurBlock>) => {
    setBlurBlocks((blocks) =>
      blocks.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  const handleDeleteBlurBlock = (id: string) => {
    setBlurBlocks((blocks) => blocks.filter((block) => block.id !== id));
    if (selectedBlurBlockId === id) {
      setSelectedBlurBlockId(null);
    }
  };

  const handleToggleBlurBlockMode = () => {
    setIsManagingBlurBlocks((prev) => !prev);
    if (isManagingBlurBlocks) {
      setSelectedBlurBlockId(null);
    }
  };

  const handleEnterBlurMode = () => {
    if (!isManagingBlurBlocks) {
      setIsManagingBlurBlocks(true);
      setIsImageSelected(false);
    }
  };

  const handleCopyBlurBlock = () => {
    if (selectedBlurBlockId) {
      const blockToCopy = blurBlocks.find((b) => b.id === selectedBlurBlockId);
      if (blockToCopy) {
        setCopiedBlurBlock(blockToCopy);
      }
    }
  };

  const handlePasteBlurBlock = () => {
    if (copiedBlurBlock) {
      const newBlock: BlurBlock = {
        ...copiedBlurBlock,
        id: `blur-${Date.now()}`,
        // Offset by 5% to make it visible
        x: Math.min(copiedBlurBlock.x + 5, 95 - copiedBlurBlock.width),
        y: Math.min(copiedBlurBlock.y + 5, 95 - copiedBlurBlock.height),
      };
      setBlurBlocks([...blurBlocks, newBlock]);
      setSelectedBlurBlockId(newBlock.id);
      setIsManagingBlurBlocks(true);
    }
  };

  // Keyboard shortcuts for copy/paste
  useEffect(() => {
    if (!isManagingBlurBlocks) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Copy: Cmd+C or Ctrl+C
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && selectedBlurBlockId) {
        e.preventDefault();
        handleCopyBlurBlock();
      }
      // Paste: Cmd+V or Ctrl+V
      if ((e.metaKey || e.ctrlKey) && e.key === "v" && copiedBlurBlock) {
        e.preventDefault();
        handlePasteBlurBlock();
      }
      // Delete: Backspace or Delete
      if ((e.key === "Backspace" || e.key === "Delete") && selectedBlurBlockId) {
        e.preventDefault();
        handleDeleteBlurBlock(selectedBlurBlockId);
      }
      // Exit blur mode: Enter
      if (e.key === "Enter") {
        e.preventDefault();
        handleToggleBlurBlockMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isManagingBlurBlocks, selectedBlurBlockId, copiedBlurBlock, blurBlocks]);

  // Keyboard shortcut to exit border radius mode
  useEffect(() => {
    if (!showBorderRadiusSlider) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Exit border radius mode: Enter
      if (e.key === "Enter") {
        e.preventDefault();
        setShowBorderRadiusSlider(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showBorderRadiusSlider]);


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

  const handleCanvasWidthChange = (width: number) => {
    setCustomWidth(width);
    if (isCustomCanvas) {
      setWidth(width * 0.85);
    }
  };

  const handleCanvasHeightChange = (height: number) => {
    setCustomHeight(height);
    if (isCustomCanvas) {
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
        blurBlocks: blurBlocks,
      });

      const sizeName = currentCanvasSize.name
        .toLowerCase()
        .replace(/\s+/g, "-");
      const extension = format === "jpeg" ? "jpg" : "png";
      downloadImage(dataUrl, `${exportFilename}-${sizeName}-${scale}x.${extension}`);
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
        onFilenameChange={setExportFilename}
      />
      <PlaygroundFooter
        hasImage={!!uploadedImage}
        isImageSelected={isImageSelected}
        onCropClick={handleCropClick}
        onScaleClick={handleScaleClick}
        onBorderRadiusClick={handleBorderRadiusClick}
        showBorderRadiusSlider={showBorderRadiusSlider}
        borderRadius={transform.borderRadius}
        onBorderRadiusChange={setBorderRadius}
        isManagingBlurBlocks={isManagingBlurBlocks}
        selectedBlurBlockId={selectedBlurBlockId}
        onCopyBlurBlock={handleCopyBlurBlock}
        onPasteBlurBlock={handlePasteBlurBlock}
        onDeleteBlurBlock={() => selectedBlurBlockId && handleDeleteBlurBlock(selectedBlurBlockId)}
        hasCopiedBlurBlock={copiedBlurBlock !== null}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        onBackgroundDrawerOpen={() => setIsBackgroundDrawerOpen((prev) => !prev)}
        onImageUpload={handleImageUpload}
        onToggleBlurBlockMode={handleToggleBlurBlockMode}
        onAddBlurBlock={handleAddBlurBlock}
        onImageSelectionDone={handleImageSelectionDone}
        isBackgroundDrawerOpen={isBackgroundDrawerOpen}
      />
      <div className="h-screen w-full bg-white relative overflow-hidden">
        {/* Noise Texture (Darker Dots) Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "#ffffff",
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex items-center justify-center h-full pt-20 pb-20">
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
          onBackgroundDrawerOpen={() => setIsBackgroundDrawerOpen((prev) => !prev)}
          onImageUpload={handleImageUpload}
          isImageSelected={isImageSelected}
          isCropping={isCropping}
          cropPresetIndex={cropPresetIndex}
          onCropPresetChange={setCropPresetIndex}
          isBackgroundDrawerOpen={isBackgroundDrawerOpen}
          blurBlocks={blurBlocks}
          isManagingBlurBlocks={isManagingBlurBlocks}
          onAddBlurBlock={handleAddBlurBlock}
          onUpdateBlurBlock={handleUpdateBlurBlock}
          onDeleteBlurBlock={handleDeleteBlurBlock}
          onToggleBlurBlockMode={handleToggleBlurBlockMode}
          selectedBlurBlockId={selectedBlurBlockId}
          onSelectBlurBlock={setSelectedBlurBlockId}
          onCopyBlurBlock={handleCopyBlurBlock}
          onPasteBlurBlock={handlePasteBlurBlock}
          hasCopiedBlurBlock={copiedBlurBlock !== null}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onEnterBlurMode={handleEnterBlurMode}
          isCustomCanvas={isCustomCanvas}
          onCanvasWidthChange={handleCanvasWidthChange}
          onCanvasHeightChange={handleCanvasHeightChange}
          showBorderRadiusSlider={showBorderRadiusSlider}
          borderRadius={transform.borderRadius}
          onBorderRadiusChange={setBorderRadius}
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
          backgroundBlur={backgroundBlur}
          onBackgroundBlurChange={setBackgroundBlur}
        />
          </div>
        </div>
      </div>
    </>
  );
}
