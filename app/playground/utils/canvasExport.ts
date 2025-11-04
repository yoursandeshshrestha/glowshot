import { GradientData } from "./gradientGenerator";

export type ExportFormat = "png" | "jpeg";

interface ExportOptions {
  width: number;
  height: number;
  scale: number;
  format?: ExportFormat;
  quality?: number; // 0 to 1, for JPEG quality
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

export async function exportCanvas(options: ExportOptions): Promise<string> {
  const {
    width,
    height,
    scale,
    format = "png",
    quality = 0.95,
    backgroundSrc,
    backgroundGradient,
    backgroundBlur = 0,
    uploadedImageSrc,
    imageTransform,
  } = options;

  const exportWidth = width * scale;
  const exportHeight = height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  // Scale context
  ctx.scale(scale, scale);

  // Set high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw background
  if (backgroundGradient) {
    // Apply blur if needed
    if (backgroundBlur > 0) {
      ctx.filter = `blur(${backgroundBlur}px)`;
    }
    
    const angleRad = (backgroundGradient.angle - 90) * (Math.PI / 180);
    const x0 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y0 = height / 2 + (Math.sin(angleRad) * height) / 2;
    const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    backgroundGradient.colors.forEach((color, index) => {
      const position = index / (backgroundGradient.colors.length - 1);
      gradient.addColorStop(position, color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Reset filter
    ctx.filter = 'none';
  } else if (backgroundSrc) {
    // Apply blur if needed
    if (backgroundBlur > 0) {
      ctx.filter = `blur(${backgroundBlur}px)`;
    }
    
    const bgImg = await loadImage(backgroundSrc);
    ctx.drawImage(bgImg, 0, 0, width, height);
    
    // Reset filter
    ctx.filter = 'none';
  } else {
    // Draw white background when no gradient or image
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw uploaded image if exists
  if (uploadedImageSrc) {
    const img = await loadImage(uploadedImageSrc);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((imageTransform.rotation * Math.PI) / 180);
    const finalScale = imageTransform.scale / 100;
    ctx.scale(finalScale, finalScale);

    const cropXPx = (img.naturalWidth * imageTransform.cropX) / 100;
    const cropYPx = (img.naturalHeight * imageTransform.cropY) / 100;
    const cropWidthPx = (img.naturalWidth * imageTransform.cropWidth) / 100;
    const cropHeightPx = (img.naturalHeight * imageTransform.cropHeight) / 100;

    const cropAspect = cropWidthPx / cropHeightPx;
    const boxAspect = imageTransform.width / imageTransform.height;

    let drawWidth: number;
    let drawHeight: number;

    if (cropAspect > boxAspect) {
      drawWidth = imageTransform.width;
      drawHeight = imageTransform.width / cropAspect;
    } else {
      drawHeight = imageTransform.height;
      drawWidth = imageTransform.height * cropAspect;
    }

    const x = -drawWidth / 2;
    const y = -drawHeight / 2;

    if (imageTransform.borderRadius > 0) {
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

  // Export with specified format and quality
  if (format === "jpeg") {
    return canvas.toDataURL("image/jpeg", quality);
  }
  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function downloadImage(dataUrl: string, filename: string = "donkey-export.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

