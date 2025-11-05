"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Glowshot and who is it for?",
    answer:
      "Glowshot is a powerful image transformation platform designed for creators, designers, and anyone who needs to quickly add professional backgrounds to their images. It's perfect for social media content creators, product photographers, and marketing professionals.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "Glowshot supports all common image formats including PNG, JPG, JPEG, and WebP. You can upload images of any size, and export them in either PNG or JPG format with adjustable quality settings.",
  },
  {
    question: "Can I use custom backgrounds for my images?",
    answer:
      "Yes! Glowshot offers both pre-made gradient backgrounds and the ability to upload your own custom background images. You can also create custom gradients with your preferred colors and directions.",
  },
  {
    question: "Is there a limit on image size or number of exports?",
    answer:
      "Currently, Glowshot is completely free to use with no limits on image size, number of uploads, or exports. You can transform as many images as you need without any restrictions.",
  },
  {
    question: "Do I need to create an account to use Glowshot?",
    answer:
      "No account required! Glowshot works directly in your browser. Simply visit the playground, upload your image, customize it, and download your result. Your privacy is important to us - images are processed client-side and not stored on our servers.",
  },
  {
    question: "Can I adjust the size and position of my images?",
    answer:
      "Absolutely! Glowshot provides precise controls for scaling, cropping, and positioning your images. You can adjust canvas dimensions, add padding, crop images inline, and position them exactly where you want on the canvas.",
  },
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="w-full flex justify-center items-start bg-[#f7f5f3]">
      <div className="flex-1 px-4 md:px-8 py-16 md:py-20 flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-12 max-w-[1200px]">
        {/* Left Column - Header */}
        <motion.div
          className="w-full lg:flex-1 flex flex-col justify-center items-start gap-4 lg:py-5"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-full flex flex-col justify-center text-[#37322f] font-normal leading-tight md:leading-[44px] font-serif text-4xl tracking-tight">
            Frequently Asked Questions
          </div>
          <div className="w-full text-[#37322f]/80 text-lg font-medium leading-7 font-sans">
            Everything you need to know about transforming your images with
            Glowshot.
          </div>
        </motion.div>

        {/* Right Column - FAQ Items */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index);
              return (
                <motion.div
                  key={index}
                  className="w-full border-b border-[#37322f]/10"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                >
                  <motion.button
                    onClick={() => toggleItem(index)}
                    className="w-full px-5 py-[18px] flex justify-between items-center gap-5 text-left hover:bg-white/50 transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 text-[#37322f] text-base font-medium leading-6 font-sans">
                      {item.question}
                    </div>
                    <motion.div
                      className="flex justify-center items-center"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown className="w-6 h-6 text-[#37322f]/60" />
                    </motion.div>
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: {
                              duration: 0.4,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            },
                            opacity: {
                              duration: 0.3,
                              delay: 0.1,
                            },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: {
                              duration: 0.3,
                              ease: [0.04, 0.62, 0.23, 0.98],
                            },
                            opacity: {
                              duration: 0.2,
                            },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          className="px-5 pb-[18px] pt-0 text-[#37322f]/80 text-base font-normal leading-6 font-sans"
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {item.answer}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
