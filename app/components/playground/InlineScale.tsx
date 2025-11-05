"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface InlineScaleProps {
  imageData: string;
  containerWidth: number;
  containerHeight: number;
  currentWidth: number;
  currentHeight: number;
  onScaleComplete: (width: number, height: number) => void;
  onCancel?: () => void;
}

export function InlineScale({
  imageData,
  containerWidth,
  containerHeight,
  currentWidth,
  currentHeight,
  onScaleComplete,
  onCancel,
}: InlineScaleProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [scaleBox, setScaleBox] = useState({
    x: 0,
    y: 0,
    width: currentWidth,
    height: currentHeight,
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;

      let drawWidth: number;
      let drawHeight: number;

      if (imgAspect > containerAspect) {
        drawWidth = currentWidth;
        drawHeight = currentWidth / imgAspect;
      } else {
        drawHeight = currentHeight;
        drawWidth = currentHeight * imgAspect;
      }

      const x = (containerWidth - drawWidth) / 2;
      const y = (containerHeight - drawHeight) / 2;

      setImagePosition({ x, y, width: drawWidth, height: drawHeight });
      setScaleBox({ x, y, width: drawWidth, height: drawHeight });
    };
    img.src = imageData;
  }, [imageData, containerWidth, containerHeight, currentWidth, currentHeight]);

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
      Math.abs(x - scaleBox.x) < threshold &&
      Math.abs(y - scaleBox.y) < threshold
    )
      return "tl";
    if (
      Math.abs(x - (scaleBox.x + scaleBox.width)) < threshold &&
      Math.abs(y - scaleBox.y) < threshold
    )
      return "tr";
    if (
      Math.abs(x - scaleBox.x) < threshold &&
      Math.abs(y - (scaleBox.y + scaleBox.height)) < threshold
    )
      return "bl";
    if (
      Math.abs(x - (scaleBox.x + scaleBox.width)) < threshold &&
      Math.abs(y - (scaleBox.y + scaleBox.height)) < threshold
    )
      return "br";

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getMousePos(e);
    const handle = getHandleAtPosition(pos.x, pos.y);

    if (handle) {
      setIsResizing(handle);
      setDragStart(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = getMousePos(e);

    if (isResizing) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      const sensitivity = 2; // Increased sensitivity

      setScaleBox((prev) => {
        let newBox = { ...prev };
        const imgAspect = imageRef.current
          ? imageRef.current.naturalWidth / imageRef.current.naturalHeight
          : 1;

        switch (isResizing) {
          case "tl": {
            const avgDelta = ((dx + dy) / 2) * sensitivity;
            newBox.width = Math.max(100, prev.width - avgDelta);
            newBox.height = newBox.width / imgAspect;
            newBox.x = prev.x + (prev.width - newBox.width) / 2;
            newBox.y = prev.y + (prev.height - newBox.height) / 2;
            break;
          }
          case "tr": {
            const avgDelta = ((dx - dy) / 2) * sensitivity;
            newBox.width = Math.max(100, prev.width + avgDelta);
            newBox.height = newBox.width / imgAspect;
            newBox.x = prev.x + (prev.width - newBox.width) / 2;
            newBox.y = prev.y + (prev.height - newBox.height) / 2;
            break;
          }
          case "bl": {
            const avgDelta = ((-dx + dy) / 2) * sensitivity;
            newBox.width = Math.max(100, prev.width + avgDelta);
            newBox.height = newBox.width / imgAspect;
            newBox.x = prev.x + (prev.width - newBox.width) / 2;
            newBox.y = prev.y + (prev.height - newBox.height) / 2;
            break;
          }
          case "br": {
            const avgDelta = ((dx + dy) / 2) * sensitivity;
            newBox.width = Math.max(100, prev.width + avgDelta);
            newBox.height = newBox.width / imgAspect;
            newBox.x = prev.x + (prev.width - newBox.width) / 2;
            newBox.y = prev.y + (prev.height - newBox.height) / 2;
            break;
          }
        }

        return newBox;
      });
      setDragStart(pos);
    } else {
      const handle = getHandleAtPosition(pos.x, pos.y);
      const overlay = overlayRef.current;
      if (overlay) {
        if (handle === "tl" || handle === "br") overlay.style.cursor = "nwse-resize";
        else if (handle === "tr" || handle === "bl") overlay.style.cursor = "nesw-resize";
        else overlay.style.cursor = "default";
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(null);
  };

  const handleApplyScale = () => {
    onScaleComplete(scaleBox.width, scaleBox.height);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleApplyScale();
      } else if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scaleBox]);

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
      {/* Display the image */}
      {imagePosition.width > 0 && (
        <img
          src={imageData}
          alt="Scale preview"
          className="absolute pointer-events-none"
          style={{
            left: scaleBox.x,
            top: scaleBox.y,
            width: scaleBox.width,
            height: scaleBox.height,
            objectFit: 'contain',
          }}
        />
      )}

      {/* Scale box border */}
      <div
        className="absolute border border-white pointer-events-none"
        style={{
          left: scaleBox.x,
          top: scaleBox.y,
          width: scaleBox.width,
          height: scaleBox.height,
        }}
      />

      {/* Corner handles for scaling */}
      {[
        { x: scaleBox.x, y: scaleBox.y, pos: "tl" },
        { x: scaleBox.x + scaleBox.width, y: scaleBox.y, pos: "tr" },
        { x: scaleBox.x, y: scaleBox.y + scaleBox.height, pos: "bl" },
        { x: scaleBox.x + scaleBox.width, y: scaleBox.y + scaleBox.height, pos: "br" },
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
            <div className="absolute top-0 right-0 w-[2px] h-full bg-white" />
          )}
          {corner.pos === "bl" && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white" />
          )}
          {corner.pos === "br" && (
            <>
              <div className="absolute top-0 right-0 w-[2px] h-full bg-white" />
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white" />
            </>
          )}
        </div>
      ))}

      {/* Keyboard hints */}
      <div className="absolute bottom-10 right-10 z-10">
        <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-3 shadow-lg flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Enter</kbd> to apply
          </div>
          {onCancel && (
            <>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Esc</kbd> to cancel
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

