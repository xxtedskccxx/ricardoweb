"use client";

import { motion, useReducedMotion } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Quiet, interruptible entrance used for editorial content blocks. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={
        reduceMotion
          ? { duration: 0.16 }
          : { duration: 0.42, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.12 }
          : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
