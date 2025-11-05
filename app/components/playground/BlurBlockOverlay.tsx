"use client";

import { useState, useRef, useEffect } from "react";
import { BlurBlock } from "../../playground/types";
import { Trash2, Copy, Clipboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BlurBlockOverlayProps {
  blurBlocks: BlurBlock[];
  onUpdateBlurBlock: (id: string, updates: Partial<BlurBlock>) => void;
  onDeleteBlurBlock: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onCopyBlock?: (id: string) => void;
  onPasteBlock?: () => void;
  hasCopiedBlock?: boolean;
  onEnterBlurMode?: () => void;
  isEditMode?: boolean;
}

type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "e" | "s" | "w";

export function BlurBlockOverlay({
  blurBlocks,
  onUpdateBlurBlock,
  onDeleteBlurBlock,
  canvasWidth,
  canvasHeight,
  selectedBlockId,
  onSelectBlock,
  onCopyBlock,
  onPasteBlock,
  hasCopiedBlock = false,
  onEnterBlurMode,
  isEditMode = true,
}: BlurBlockOverlayProps) {
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [resizingBlock, setResizingBlock] = useState<{
    id: string;
    handle: ResizeHandle;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; blockId: string } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; blockX: number; blockY: number } | null>(null);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    blockX: number;
    blockY: number;
    blockWidth: number;
    blockHeight: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = (
    e: React.MouseEvent,
    blockId: string,
    block: BlurBlock
  ) => {
    e.stopPropagation();
    onSelectBlock(blockId);
    onEnterBlurMode?.();
    setDraggingBlockId(blockId);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      blockX: block.x,
      blockY: block.y,
    };
  };

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    blockId: string,
    handle: ResizeHandle,
    block: BlurBlock
  ) => {
    e.stopPropagation();
    onSelectBlock(blockId);
    setResizingBlock({ id: blockId, handle });
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      blockX: block.x,
      blockY: block.y,
      blockWidth: block.width,
      blockHeight: block.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smoother updates
      rafRef.current = requestAnimationFrame(() => {
        if (draggingBlockId && dragStartRef.current) {
          const deltaX = e.clientX - dragStartRef.current.x;
          const deltaY = e.clientY - dragStartRef.current.y;

          // Convert delta from screen pixels to canvas percentage
          const deltaXPercent = (deltaX / canvasWidth) * 100;
          const deltaYPercent = (deltaY / canvasHeight) * 100;

          const currentBlock = blurBlocks.find((b) => b.id === draggingBlockId);
          if (!currentBlock) return;

          const newX = Math.max(
            0,
            Math.min(
              100 - currentBlock.width,
              dragStartRef.current.blockX + deltaXPercent
            )
          );
          const newY = Math.max(
            0,
            Math.min(
              100 - currentBlock.height,
              dragStartRef.current.blockY + deltaYPercent
            )
          );

          onUpdateBlurBlock(draggingBlockId, { x: newX, y: newY });
        }

        if (resizingBlock && resizeStartRef.current) {
          const deltaX = e.clientX - resizeStartRef.current.x;
          const deltaY = e.clientY - resizeStartRef.current.y;

          const deltaXPercent = (deltaX / canvasWidth) * 100;
          const deltaYPercent = (deltaY / canvasHeight) * 100;

          const { handle } = resizingBlock;
          const start = resizeStartRef.current;

          let newX = start.blockX;
          let newY = start.blockY;
          let newWidth = start.blockWidth;
          let newHeight = start.blockHeight;

          // Handle resizing based on which handle is being dragged
          if (handle.includes("w")) {
            const maxDelta = start.blockX;
            const constrainedDelta = Math.min(deltaXPercent, maxDelta);
            newX = start.blockX + constrainedDelta;
            newWidth = start.blockWidth - constrainedDelta;
          }
          if (handle.includes("e")) {
            newWidth = Math.min(100 - start.blockX, start.blockWidth + deltaXPercent);
          }
          if (handle.includes("n")) {
            const maxDelta = start.blockY;
            const constrainedDelta = Math.min(deltaYPercent, maxDelta);
            newY = start.blockY + constrainedDelta;
            newHeight = start.blockHeight - constrainedDelta;
          }
          if (handle.includes("s")) {
            newHeight = Math.min(100 - start.blockY, start.blockHeight + deltaYPercent);
          }

          // Ensure minimum size
          if (newWidth >= 5 && newHeight >= 5) {
            onUpdateBlurBlock(resizingBlock.id, {
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight,
            });
          }
        }
      });
    };

    const handleMouseUp = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setDraggingBlockId(null);
      setResizingBlock(null);
      dragStartRef.current = null;
      resizeStartRef.current = null;
    };

    if (draggingBlockId || resizingBlock) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingBlockId, resizingBlock, blurBlocks, canvasWidth, canvasHeight, onUpdateBlurBlock]);

  const handleBackgroundClick = () => {
    onSelectBlock(null);
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, blockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, blockId });
    onSelectBlock(blockId);
  };

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu]);

  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      onClick={handleBackgroundClick}
    >
      {blurBlocks.map((block) => {
        const isSelected = selectedBlockId === block.id;
        const blockStyle = {
          position: "absolute" as const,
          left: `${block.x}%`,
          top: `${block.y}%`,
          width: `${block.width}%`,
          height: `${block.height}%`,
        };

        return (
          <motion.div
            key={block.id}
            style={blockStyle}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`group ${
              isEditMode && draggingBlockId === block.id 
                ? "cursor-grabbing opacity-80" 
                : isEditMode 
                  ? "cursor-grab" 
                  : "cursor-pointer"
            } transition-opacity duration-75`}
            onMouseDown={(e) => isEditMode && handleMouseDown(e, block.id, block)}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEditMode) {
                onEnterBlurMode?.();
                onSelectBlock(block.id);
              }
            }}
            onContextMenu={(e) => isEditMode && handleContextMenu(e, block.id)}
          >
            {/* Show border on hover or when selected in edit mode, subtle hint when not in edit mode */}
            <div className={`absolute inset-0 border pointer-events-none transition-opacity ${
              isEditMode 
                ? `border-gray-400 opacity-0 group-hover:opacity-100 ${isSelected ? "!opacity-100 !border-gray-900" : ""}`
                : "border-gray-300 opacity-30 group-hover:opacity-60"
            }`} />

            {/* Control buttons - minimal (only in edit mode) */}
            {isEditMode && isSelected && (
              <div className="absolute -top-2 -right-2 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyBlock?.(block.id);
                  }}
                  className="p-0.5 bg-white border border-gray-300 hover:border-gray-400 rounded-full transition-colors shadow-sm"
                  title="Copy (Cmd+C)"
                >
                  <Copy className="w-3 h-3 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBlurBlock(block.id);
                  }}
                  className="p-0.5 bg-white border border-gray-300 hover:border-red-400 rounded-full transition-colors shadow-sm"
                  title="Delete (Backspace)"
                >
                  <Trash2 className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            )}

            {/* Minimal Resize Handles - only show when selected in edit mode */}
            {isEditMode && isSelected && (
              <>
                {/* Corner Handles - overlay style */}
                {(["nw", "ne", "sw", "se"] as ResizeHandle[]).map((handle) => (
                  <div
                    key={handle}
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, block.id, handle, block)
                    }
                    className={`absolute w-2 h-2 bg-white border border-gray-600 rounded-sm cursor-${
                      handle === "nw" || handle === "se" ? "nwse" : "nesw"
                    }-resize z-10 hover:bg-gray-100 transition-colors shadow-sm`}
                    style={{
                      ...(handle.includes("n") ? { top: -1 } : { bottom: -1 }),
                      ...(handle.includes("w") ? { left: -1 } : { right: -1 }),
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ))}

                {/* Edge Handles - overlay on edges */}
                {(["n", "e", "s", "w"] as ResizeHandle[]).map((handle) => (
                  <div
                    key={handle}
                    onMouseDown={(e) =>
                      handleResizeMouseDown(e, block.id, handle, block)
                    }
                    className={`absolute bg-white/90 border border-gray-600 hover:bg-gray-100 transition-colors shadow-sm ${
                      handle === "n" || handle === "s"
                        ? "w-4 h-1 cursor-ns-resize left-1/2 -translate-x-1/2"
                        : "w-1 h-4 cursor-ew-resize top-1/2 -translate-y-1/2"
                    } z-10`}
                    style={{
                      ...(handle === "n" && { top: 0 }),
                      ...(handle === "s" && { bottom: 0 }),
                      ...(handle === "e" && { right: 0 }),
                      ...(handle === "w" && { left: 0 }),
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ))}
              </>
            )}
          </motion.div>
        );
      })}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyBlock?.(contextMenu.blockId);
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Copy className="w-3 h-3" />
              Copy
              <span className="ml-auto text-gray-400">⌘C</span>
            </button>
            {hasCopiedBlock && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPasteBlock?.();
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Clipboard className="w-3 h-3" />
                Paste
                <span className="ml-auto text-gray-400">⌘V</span>
              </button>
            )}
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBlurBlock(contextMenu.blockId);
                setContextMenu(null);
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Delete
              <span className="ml-auto text-gray-400">⌫</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

