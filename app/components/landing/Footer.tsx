"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="w-full py-12 bg-[#f7f5f3] border-t border-[#37322f]/10">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Main Content */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Developer Info */}
          <div className="flex flex-col gap-3">
            <motion.h3
              className="text-[#37322f] font-semibold text-base"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Built by Sandesh Shrestha
            </motion.h3>
            <motion.div
              className="text-[#37322f]/70 text-sm space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p>hey, I&apos;m a developer who built this site</p>
              <p>
                I regularly share updates about what I&apos;m building on
                X/Twitter and LinkedIn
              </p>
              <p>
                feel free to follow me @{" "}
                <Link
                  href="https://x.com/yoursandeshdev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#37322f] hover:underline font-medium"
                >
                  X.com/yoursandeshdev
                </Link>{" "}
                and @{" "}
                <Link
                  href="https://www.linkedin.com/in/sandeshshresthadev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#37322f] hover:underline font-medium"
                >
                  LinkedIn.com/sandeshshresthadev
                </Link>
              </p>
              <p>Hope this site was helpful ❤️</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          className="mt-8 pt-8 border-t border-[#37322f]/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-[#37322f]/70 text-sm">
            © {new Date().getFullYear()} Sandesh Shrestha / Glowshot - All Rights
            Reserved
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
