"use client";

import { useEffect, useRef } from "react";
import { GradientData } from "../../playground/utils/gradientGenerator";
import {
  getCachedImage,
  preloadImage,
} from "../../playground/hooks/useImagePreloader";

interface CanvasProps {
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
}

interface CanvasClickProps extends CanvasProps {
  onImageClick?: () => void;
  onBackgroundClick?: () => void;
}

export function Canvas({
  width,
  height,
  backgroundSrc,
  backgroundGradient,
  backgroundBlur = 0,
  uploadedImageSrc,
  imageTransform,
  onImageClick,
  onBackgroundClick,
}: CanvasClickProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size in actual pixels
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale canvas back down via CSS
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: false,
      willReadFrequently: false,
    });
    if (!ctx) return;

    // Scale context to account for pixel ratio
    ctx.scale(dpr, dpr);

    // Set high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const drawCanvas = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background (gradient, image, or white)
      if (backgroundGradient) {
        // Apply blur if needed
        if (backgroundBlur > 0) {
          ctx.filter = `blur(${backgroundBlur}px)`;
        }

        // Convert angle to radians and calculate gradient direction
        const angleRad = (backgroundGradient.angle - 90) * (Math.PI / 180);
        const x0 = width / 2 + (Math.cos(angleRad) * width) / 2;
        const y0 = height / 2 + (Math.sin(angleRad) * height) / 2;
        const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
        const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;

        // Create canvas gradient
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        // Add color stops
        backgroundGradient.colors.forEach((color, index) => {
          const position = index / (backgroundGradient.colors.length - 1);
          gradient.addColorStop(position, color);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Reset filter
        ctx.filter = "none";
      } else if (backgroundImageRef.current?.complete) {
        // Apply blur if needed
        if (backgroundBlur > 0) {
          ctx.filter = `blur(${backgroundBlur}px)`;
        }

        ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);

        // Reset filter
        ctx.filter = "none";
      } else {
        // Draw white background when no gradient or image
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      // Draw uploaded image with transforms
      if (uploadedImageRef.current?.complete && uploadedImageSrc) {
        ctx.save();

        // Move to center of canvas
        ctx.translate(width / 2, height / 2);

        // Apply rotation
        ctx.rotate((imageTransform.rotation * Math.PI) / 180);

        // Apply scale
        const finalScale = imageTransform.scale / 100;
        ctx.scale(finalScale, finalScale);

        const img = uploadedImageRef.current;

        // Calculate crop area in source image coordinates
        const cropXPx = (img.naturalWidth * imageTransform.cropX) / 100;
        const cropYPx = (img.naturalHeight * imageTransform.cropY) / 100;
        const cropWidthPx = (img.naturalWidth * imageTransform.cropWidth) / 100;
        const cropHeightPx =
          (img.naturalHeight * imageTransform.cropHeight) / 100;

        // Calculate display dimensions maintaining aspect ratio
        const cropAspect = cropWidthPx / cropHeightPx;
        const boxAspect = imageTransform.width / imageTransform.height;

        let drawWidth: number;
        let drawHeight: number;

        if (cropAspect > boxAspect) {
          // Crop is wider than box
          drawWidth = imageTransform.width;
          drawHeight = imageTransform.width / cropAspect;
        } else {
          // Crop is taller than box
          drawHeight = imageTransform.height;
          drawWidth = imageTransform.height * cropAspect;
        }

        const x = -drawWidth / 2;
        const y = -drawHeight / 2;

        if (imageTransform.borderRadius > 0) {
          // Draw with rounded corners
          ctx.beginPath();
          const radius = Math.min(
            imageTransform.borderRadius,
            drawWidth / 2,
            drawHeight / 2
          );
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + drawWidth - radius, y);
          ctx.quadraticCurveTo(x + drawWidth, y, x + drawWidth, y + radius);
          ctx.lineTo(x + drawWidth, y + drawHeight - radius);
          ctx.quadraticCurveTo(
            x + drawWidth,
            y + drawHeight,
            x + drawWidth - radius,
            y + drawHeight
          );
          ctx.lineTo(x + radius, y + drawHeight);
          ctx.quadraticCurveTo(x, y + drawHeight, x, y + drawHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.clip();
        }

        // Draw cropped portion of image
        ctx.drawImage(
          img,
          cropXPx,
          cropYPx,
          cropWidthPx,
          cropHeightPx,
          x,
          y,
          drawWidth,
          drawHeight
        );

        ctx.restore();
      }
    };

    // Load background image
    if (backgroundSrc && !backgroundGradient) {
      // Try to get cached image first
      const cachedBg = getCachedImage(backgroundSrc);
      if (cachedBg) {
        backgroundImageRef.current = cachedBg;
        drawCanvas();
      } else {
        // Fallback to loading if not cached
        preloadImage(backgroundSrc)
          .then((img) => {
            backgroundImageRef.current = img;
            drawCanvas();
          })
          .catch((err) => {
            console.error("Failed to load background:", err);
            backgroundImageRef.current = null;
            drawCanvas();
          });
      }
    } else {
      backgroundImageRef.current = null;
      drawCanvas();
    }

    // Load uploaded image
    if (uploadedImageSrc) {
      // Try to get cached image first
      const cachedUpload = getCachedImage(uploadedImageSrc);
      if (cachedUpload) {
        uploadedImageRef.current = cachedUpload;
        drawCanvas();
      } else {
        // Fallback to loading if not cached (for user uploads)
        preloadImage(uploadedImageSrc)
          .then((img) => {
            uploadedImageRef.current = img;
            drawCanvas();
          })
          .catch((err) => {
            console.error("Failed to load uploaded image:", err);
            uploadedImageRef.current = null;
            drawCanvas();
          });
      }
    } else {
      uploadedImageRef.current = null;
      drawCanvas();
    }
  }, [
    width,
    height,
    backgroundSrc,
    backgroundGradient,
    backgroundBlur,
    uploadedImageSrc,
    imageTransform,
  ]);

  const isClickOnImage = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImageSrc) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    const rect = canvas.getBoundingClientRect();
    // Convert click coordinates from displayed size to actual canvas coordinates
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const centerX = width / 2;
    const centerY = height / 2;
    const halfWidth = imageTransform.width / 2;
    const halfHeight = imageTransform.height / 2;

    return (
      x >= centerX - halfWidth &&
      x <= centerX + halfWidth &&
      y >= centerY - halfHeight &&
      y <= centerY + halfHeight
    );
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isClickOnImage(e)) {
      onImageClick?.();
    } else {
      onBackgroundClick?.();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        imageRendering: "auto",
        cursor: uploadedImageSrc ? "pointer" : "default",
      }}
      className="block"
    />
  );
}
