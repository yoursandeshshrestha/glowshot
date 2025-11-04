"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface InlineCropProps {
  imageData: string;
  containerWidth: number;
  containerHeight: number;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export interface CropPreset {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export const CROP_PRESETS: CropPreset[] = [
  { name: "Free", width: 0, height: 0, aspectRatio: 0 },
  { name: "16:9", width: 1920, height: 1080, aspectRatio: 16 / 9 },
  { name: "1:1", width: 1080, height: 1080, aspectRatio: 1 },
  { name: "4:3", width: 1920, height: 1440, aspectRatio: 4 / 3 },
];

interface InlineCropPropsExtended extends InlineCropProps {
  selectedPreset?: number;
  onPresetChange?: (index: number) => void;
}

export function InlineCrop({
  imageData,
  containerWidth,
  containerHeight,
  onCropComplete,
  onCancel,
  selectedPreset: externalSelectedPreset,
  onPresetChange: externalOnPresetChange,
}: InlineCropPropsExtended) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [internalSelectedPreset, setInternalSelectedPreset] = useState(0);
  const selectedPreset = externalSelectedPreset ?? internalSelectedPreset;
  const [cropArea, setCropArea] = useState({
    x: 100,
    y: 100,
    width: 400,
    height: 400,
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      
      // Calculate image display position based on container, not imageTransform
      // This ensures we always show the full original image correctly
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;

      let drawWidth: number;
      let drawHeight: number;

      // Fit image within container while maintaining aspect ratio
      if (imgAspect > containerAspect) {
        // Image is wider than container
        drawWidth = containerWidth * 0.85; // Use 85% of container width
        drawHeight = drawWidth / imgAspect;
      } else {
        // Image is taller than container
        drawHeight = containerHeight * 0.85; // Use 85% of container height
        drawWidth = drawHeight * imgAspect;
      }

      const x = (containerWidth - drawWidth) / 2;
      const y = (containerHeight - drawHeight) / 2;

      setImagePosition({ x, y, width: drawWidth, height: drawHeight });
      
      // Set initial crop area to 80% of image (free aspect ratio)
      const initialWidth = drawWidth * 0.8;
      const initialHeight = drawHeight * 0.8;
      
      setCropArea({
        x: x + (drawWidth - initialWidth) / 2,
        y: y + (drawHeight - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
      });
    };
    img.src = imageData;
  }, [imageData, containerWidth, containerHeight]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const overlay = overlayRef.current;
    if (!overlay) return { x: 0, y: 0 };
    const rect = overlay.getBoundingClientRect();
    
    // Calculate the scale factor between actual container size and displayed size
    const scaleX = containerWidth / rect.width;
    const scaleY = containerHeight / rect.height;
    
    // Convert mouse coordinates from screen space to container space
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    return { x, y };
  }, [containerWidth, containerHeight]);

  const getHandleAtPosition = (x: number, y: number) => {
    const handleSize = 20;
    const threshold = handleSize;

    if (
      Math.abs(x - cropArea.x) < threshold &&
      Math.abs(y - cropArea.y) < threshold
    )
      return "tl";
    if (
      Math.abs(x - (cropArea.x + cropArea.width)) < threshold &&
      Math.abs(y - cropArea.y) < threshold
    )
      return "tr";
    if (
      Math.abs(x - cropArea.x) < threshold &&
      Math.abs(y - (cropArea.y + cropArea.height)) < threshold
    )
      return "bl";
    if (
      Math.abs(x - (cropArea.x + cropArea.width)) < threshold &&
      Math.abs(y - (cropArea.y + cropArea.height)) < threshold
    )
      return "br";

    if (
      Math.abs(x - (cropArea.x + cropArea.width / 2)) < threshold &&
      Math.abs(y - cropArea.y) < threshold
    )
      return "t";
    if (
      Math.abs(x - (cropArea.x + cropArea.width / 2)) < threshold &&
      Math.abs(y - (cropArea.y + cropArea.height)) < threshold
    )
      return "b";
    if (
      Math.abs(x - cropArea.x) < threshold &&
      Math.abs(y - (cropArea.y + cropArea.height / 2)) < threshold
    )
      return "l";
    if (
      Math.abs(x - (cropArea.x + cropArea.width)) < threshold &&
      Math.abs(y - (cropArea.y + cropArea.height / 2)) < threshold
    )
      return "r";

    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      return "move";
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getMousePos(e);
    const handle = getHandleAtPosition(pos.x, pos.y);

    if (handle === "move") {
      setIsDragging(true);
      setDragStart({ x: pos.x - cropArea.x, y: pos.y - cropArea.y });
    } else if (handle) {
      setIsResizing(handle);
      setDragStart(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getMousePos(e);

    if (isDragging) {
      const newX = Math.max(
        imagePosition.x,
        Math.min(pos.x - dragStart.x, imagePosition.x + imagePosition.width - cropArea.width)
      );
      const newY = Math.max(
        imagePosition.y,
        Math.min(pos.y - dragStart.y, imagePosition.y + imagePosition.height - cropArea.height)
      );
      setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      const aspectRatio = CROP_PRESETS[selectedPreset].aspectRatio;

      setCropArea((prev) => {
        let newCrop = { ...prev };

        if (aspectRatio > 0) {
          // Apply aspect ratio constraint
          switch (isResizing) {
            case "tl":
            case "tr":
            case "bl":
            case "br": {
              // For corners, resize based on the primary dimension
              const newWidth = Math.max(50, prev.width + (isResizing === "tr" || isResizing === "br" ? dx : -dx));
              const newHeight = newWidth / aspectRatio;
              
              if (isResizing === "tl") {
                newCrop.x = Math.max(imagePosition.x, prev.x + prev.width - newWidth);
                newCrop.y = Math.max(imagePosition.y, prev.y + prev.height - newHeight);
              } else if (isResizing === "tr") {
                newCrop.y = Math.max(imagePosition.y, prev.y + prev.height - newHeight);
              } else if (isResizing === "bl") {
                newCrop.x = Math.max(imagePosition.x, prev.x + prev.width - newWidth);
              }
              
              newCrop.width = newWidth;
              newCrop.height = newHeight;
              break;
            }
            case "t":
            case "b": {
              const newHeight = Math.max(50, prev.height + (isResizing === "b" ? dy : -dy));
              const newWidth = newHeight * aspectRatio;
              newCrop.width = newWidth;
              newCrop.height = newHeight;
              newCrop.x = prev.x + (prev.width - newWidth) / 2;
              if (isResizing === "t") {
                newCrop.y = Math.max(imagePosition.y, prev.y + prev.height - newHeight);
              }
              break;
            }
            case "l":
            case "r": {
              const newWidth = Math.max(50, prev.width + (isResizing === "r" ? dx : -dx));
              const newHeight = newWidth / aspectRatio;
              newCrop.width = newWidth;
              newCrop.height = newHeight;
              newCrop.y = prev.y + (prev.height - newHeight) / 2;
              if (isResizing === "l") {
                newCrop.x = Math.max(imagePosition.x, prev.x + prev.width - newWidth);
              }
              break;
            }
          }
        } else {
          // Free aspect ratio - allow independent width and height
          switch (isResizing) {
            case "tl":
              newCrop.x = Math.max(imagePosition.x, prev.x + dx);
              newCrop.y = Math.max(imagePosition.y, prev.y + dy);
              newCrop.width = Math.max(50, prev.width - dx);
              newCrop.height = Math.max(50, prev.height - dy);
              break;
            case "tr":
              newCrop.y = Math.max(imagePosition.y, prev.y + dy);
              newCrop.width = Math.max(50, prev.width + dx);
              newCrop.height = Math.max(50, prev.height - dy);
              break;
            case "bl":
              newCrop.x = Math.max(imagePosition.x, prev.x + dx);
              newCrop.width = Math.max(50, prev.width - dx);
              newCrop.height = Math.max(50, prev.height + dy);
              break;
            case "br":
              newCrop.width = Math.max(50, prev.width + dx);
              newCrop.height = Math.max(50, prev.height + dy);
              break;
            case "t":
              newCrop.y = Math.max(imagePosition.y, prev.y + dy);
              newCrop.height = Math.max(50, prev.height - dy);
              break;
            case "b":
              newCrop.height = Math.max(50, prev.height + dy);
              break;
            case "l":
              newCrop.x = Math.max(imagePosition.x, prev.x + dx);
              newCrop.width = Math.max(50, prev.width - dx);
              break;
            case "r":
              newCrop.width = Math.max(50, prev.width + dx);
              break;
          }
        }

        // Constrain to image bounds
        newCrop.width = Math.min(newCrop.width, imagePosition.x + imagePosition.width - newCrop.x);
        newCrop.height = Math.min(newCrop.height, imagePosition.y + imagePosition.height - newCrop.y);

        return newCrop;
      });
      setDragStart(pos);
    } else {
      const handle = getHandleAtPosition(pos.x, pos.y);
      const overlay = overlayRef.current;
      if (overlay) {
        if (handle === "move") overlay.style.cursor = "move";
        else if (handle === "tl" || handle === "br") overlay.style.cursor = "nwse-resize";
        else if (handle === "tr" || handle === "bl") overlay.style.cursor = "nesw-resize";
        else if (handle === "t" || handle === "b") overlay.style.cursor = "ns-resize";
        else if (handle === "l" || handle === "r") overlay.style.cursor = "ew-resize";
        else overlay.style.cursor = "default";
      }
    }
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  const handleCrop = useCallback(() => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const scaleX = img.naturalWidth / imagePosition.width;
    const scaleY = img.naturalHeight / imagePosition.height;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropArea.width * scaleX;
    cropCanvas.height = cropArea.height * scaleY;
    const ctx = cropCanvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        img,
        (cropArea.x - imagePosition.x) * scaleX,
        (cropArea.y - imagePosition.y) * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );

      onCropComplete(cropCanvas.toDataURL("image/png"));
    }
  }, [cropArea, imagePosition, onCropComplete]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCrop();
      } else if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCrop, onCancel]);

  // Update crop area when preset changes (using ref to track previous preset)
  const prevPresetRef = useRef(selectedPreset);
  useEffect(() => {
    if (imagePosition.width === 0 || prevPresetRef.current === selectedPreset) return;
    prevPresetRef.current = selectedPreset;
    
    const preset = CROP_PRESETS[selectedPreset];
    
    // Skip adjustment if "Free" mode (aspectRatio === 0)
    if (preset.aspectRatio === 0) return;
    
    setCropArea((prev) => {
      const centerX = prev.x + prev.width / 2;
      const centerY = prev.y + prev.height / 2;
      
      // Calculate new dimensions while maintaining center
      let newWidth = prev.width;
      let newHeight = newWidth / preset.aspectRatio;
      
      // If the height exceeds image bounds, adjust based on height
      if (newHeight > imagePosition.height) {
        newHeight = imagePosition.height * 0.8;
        newWidth = newHeight * preset.aspectRatio;
      }
      
      // If width exceeds image bounds, adjust based on width
      if (newWidth > imagePosition.width) {
        newWidth = imagePosition.width * 0.8;
        newHeight = newWidth / preset.aspectRatio;
      }
      
      let newX = centerX - newWidth / 2;
      let newY = centerY - newHeight / 2;
      
      // Constrain to image bounds
      newX = Math.max(imagePosition.x, Math.min(newX, imagePosition.x + imagePosition.width - newWidth));
      newY = Math.max(imagePosition.y, Math.min(newY, imagePosition.y + imagePosition.height - newHeight));
      
      return {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };
    });
  }, [selectedPreset]);

  const handlePresetChange = (presetIndex: number) => {
    if (externalOnPresetChange) {
      externalOnPresetChange(presetIndex);
    } else {
      setInternalSelectedPreset(presetIndex);
    }
    // The useEffect above will handle updating the crop area
  };

  const handleSize = 10;
  const cornerHandleSize = 16;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {/* Display the original image */}
      {imagePosition.width > 0 && (
        <img
          src={imageData}
          alt="Original"
          className="absolute pointer-events-none"
          style={{
            left: imagePosition.x,
            top: imagePosition.y,
            width: imagePosition.width,
            height: imagePosition.height,
            objectFit: 'contain',
          }}
        />
      )}

      {/* Minimal overlay */}
      <svg className="absolute inset-0 pointer-events-none" width={containerWidth} height={containerHeight}>
        <defs>
          <mask id="cropMask">
            <rect width={containerWidth} height={containerHeight} fill="white" />
            <rect
              x={cropArea.x}
              y={cropArea.y}
              width={cropArea.width}
              height={cropArea.height}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width={containerWidth}
          height={containerHeight}
          fill="rgba(0, 0, 0, 0.4)"
          mask="url(#cropMask)"
        />
      </svg>

      {/* Minimal crop box border */}
      <div
        className="absolute border border-white pointer-events-none"
        style={{
          left: cropArea.x,
          top: cropArea.y,
          width: cropArea.width,
          height: cropArea.height,
        }}
      >
        {/* Subtle grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <line
            x1={cropArea.width / 3}
            y1="0"
            x2={cropArea.width / 3}
            y2={cropArea.height}
            stroke="white"
            strokeWidth="1"
          />
          <line
            x1={(cropArea.width * 2) / 3}
            y1="0"
            x2={(cropArea.width * 2) / 3}
            y2={cropArea.height}
            stroke="white"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={cropArea.height / 3}
            x2={cropArea.width}
            y2={cropArea.height / 3}
            stroke="white"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={(cropArea.height * 2) / 3}
            x2={cropArea.width}
            y2={(cropArea.height * 2) / 3}
            stroke="white"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Minimal corner handles */}
      {[
        { x: cropArea.x, y: cropArea.y, pos: "tl" },
        { x: cropArea.x + cropArea.width, y: cropArea.y, pos: "tr" },
        { x: cropArea.x, y: cropArea.y + cropArea.height, pos: "bl" },
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, pos: "br" },
      ].map((corner, i) => (
        <div
          key={`corner-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: corner.x - cornerHandleSize / 2,
            top: corner.y - cornerHandleSize / 2,
            width: cornerHandleSize,
            height: cornerHandleSize,
          }}
        >
          {/* L-shaped corner */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-white" />
          <div className="absolute top-0 left-0 w-[2px] h-full bg-white" />
          {corner.pos === "tr" && (
            <>
              <div className="absolute top-0 right-0 w-[2px] h-full bg-white" />
            </>
          )}
          {corner.pos === "bl" && (
            <>
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white" />
            </>
          )}
          {corner.pos === "br" && (
            <>
              <div className="absolute top-0 right-0 w-[2px] h-full bg-white" />
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white" />
            </>
          )}
        </div>
      ))}

      {/* Minimal edge handles */}
      {[
        { x: cropArea.x + cropArea.width / 2, y: cropArea.y },
        { x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height },
        { x: cropArea.x, y: cropArea.y + cropArea.height / 2 },
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2 },
      ].map((edge, i) => (
        <div
          key={`edge-${i}`}
          className="absolute bg-white pointer-events-none rounded-full"
          style={{
            left: edge.x - handleSize / 2,
            top: edge.y - handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
        />
      ))}

      {/* Keyboard hints */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-10">
        <div className="px-4 py-2 bg-white/90 backdrop-blur rounded-lg text-sm text-gray-700">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Enter</kbd> to apply
        </div>
        <div className="px-4 py-2 bg-white/90 backdrop-blur rounded-lg text-sm text-gray-700">
          Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Esc</kbd> to cancel
        </div>
      </div>

    </div>
  );
}

