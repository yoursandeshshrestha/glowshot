"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useState, useRef } from "react";

export function DemoVideo() {
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="py-20 bg-[#f7f5f3]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <motion.div
          className="flex flex-col gap-8 items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          {/* Section Title */}
          <div className="text-center">
            <h2 className="text-[#37322f] text-4xl md:text-5xl font-normal font-serif mb-4">
              See it in action
            </h2>
            <p className="text-[#37322f]/80 text-lg font-medium">
              Watch how easy it is to transform your images
            </p>
          </div>

          {/* Video Container */}
          <motion.div
            className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-white p-2"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            <div className="relative w-full rounded-lg overflow-hidden bg-[#f7f5f3]">
              <video
                ref={videoRef}
                autoPlay
                loop
                playsInline
                className="w-full h-auto"
              >
                <source src="/Video/demo-video.mp4" type="video/mp4" />
                {/* Fallback to gif for browsers that don't support video */}
                Your browser does not support the video tag.
              </video>

              {/* Mute/Unmute Button */}
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 bg-[#37322f]/80 hover:bg-[#37322f] text-white rounded-full p-3 transition-all duration-200 shadow-lg backdrop-blur-sm"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

