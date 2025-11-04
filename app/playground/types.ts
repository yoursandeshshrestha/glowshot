export interface ImageData {
  src: string;
  width: number;
  height: number;
}

export interface BackgroundOption {
  path: string;
  name: string;
}

export interface ImageTransform {
  width: number;
  height: number;
  rotation: number;
  scale: number;
  borderRadius: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

export interface CanvasSize {
  width: number;
  height: number;
  name: string;
  aspectRatio: string;
}

export const CANVAS_SIZES: CanvasSize[] = [
  { width: 1920, height: 1080, name: "HD Landscape", aspectRatio: "16:9" },
  { width: 1080, height: 1080, name: "Square", aspectRatio: "1:1" },
  { width: 1080, height: 1350, name: "Portrait", aspectRatio: "4:5" },
  { width: 1200, height: 675, name: "Twitter Post", aspectRatio: "16:9" },
  { width: 1200, height: 1200, name: "Custom", aspectRatio: "Custom" },
];

