"use client";

import { X, Upload } from "lucide-react";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface BackgroundDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBackgroundSelect: (backgroundPath: string) => void;
  onBackgroundUpload: (file: File) => void;
  onGenerateGradient: () => void;
}

const BACKGROUND_IMAGES = [
  "/Background/1.jpg",
  "/Background/2.jpg",
  "/Background/3.jpg",
  "/Background/4.jpg",
  "/Background/5.jpg",
  "/Background/6.jpg",
  "/Background/7.jpg",
  "/Background/8.jpg",
  "/Background/9.jpg",
  "/Background/10.jpg",
  "/Background/11.jpg",
  "/Background/12.jpg",
  "/Background/13.jpg",
  "/Background/14.jpg",
  "/Background/15.jpg",
  "/Background/16.jpg",
];

export function BackgroundDrawer({
  isOpen,
  onClose,
  onBackgroundSelect,
  onBackgroundUpload,
  onGenerateGradient,
}: BackgroundDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onBackgroundUpload(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col rounded-l-2xl"
          >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Change Background</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Upload Custom Background */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Upload</h3>
              <button
                onClick={handleUploadClick}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Upload Background</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Generate Gradient */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Generate</h3>
              <button
                onClick={onGenerateGradient}
                className="w-full h-32 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-center text-sm text-gray-700 hover:text-gray-900 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400"
              >
                <span className="bg-white/90 px-4 py-2 rounded-lg font-medium">
                  Random Gradient
                </span>
              </button>
            </div>

            {/* Predefined Backgrounds */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Predefined Backgrounds</h3>
              <div className="grid grid-cols-2 gap-3">
                {BACKGROUND_IMAGES.map((bg, index) => (
                  <button
                    key={index}
                    onClick={() => onBackgroundSelect(bg)}
                    className="aspect-video rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors relative"
                  >
                    <Image
                      src={bg}
                      alt={`Background ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 180px"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      priority={index < 4}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

