"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <motion.h1
                className="text-[#37322f] text-5xl md:text-6xl font-normal leading-tight md:leading-[70px] font-serif"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                Turn boring images into professional ones
              </motion.h1>
              <motion.p
                className="text-[#37322f]/80 text-lg font-medium leading-7 font-sans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                Add beautiful backgrounds, adjust scale, crop, and export your
                images with studio-quality results in seconds.
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.25, 0.4, 0.25, 1],
              }}
            >
              <Link href="/playground">
                <Button className="h-10 px-12 bg-[#37322f] hover:bg-[#37322f]/90 text-white rounded-full font-medium text-sm shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] uppercase cursor-pointer">
                  Go to playground
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Side - Example Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 1,
              delay: 0.3,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            {/* Arrow and Label */}
            <motion.div
              className="absolute -top-1 right-0 z-10"
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 0.7, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.2,
                ease: "easeOut",
              }}
            >
              <Image
                src="/hero/arrow.png"
                alt="Arrow pointing to example"
                width={46}
                height={40}
                className="rotate-30  -scale-x-100 opacity-70"
              />
            </motion.div>
            <motion.span
              className="absolute  right-[40px] text-[#37322f] top-[-30px] font-normal text-2xl whitespace-nowrap z-10 italic"
              style={{ fontFamily: "Georgia, serif" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.1,
                ease: "easeOut",
              }}
            >
              example
            </motion.span>

            <motion.div className="relative w-full max-w-xl aspect-4/3 rounded-2xl overflow-hidden shadow-2xl bg-white p-1 rotate-1 top-[20px]">
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src="/hero/example-image.jpg"
                  alt="Example of image transformation"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
