"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Confetti {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
}

export function WeddingTheme() {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    const colors = ["#C41E3A", "#D4AF37", "#FFE4E1", "#FFD700", "#FF6B6B"];
    const items = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
    }));
    setConfetti(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            className="absolute rounded-full"
            style={{
              left: `${c.x}%`,
              top: -20,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
            }}
            animate={{
              y: ["0vh", "110vh"],
              x: [0, Math.sin(c.id) * 30, Math.cos(c.id) * 30, 0],
              rotate: [0, 360, 720],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              delay: c.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Floating hearts */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute text-wedding-red/10"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + (i % 3) * 25}%`,
            fontSize: 40 + i * 10,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          ♥
        </motion.div>
      ))}
    </div>
  );
}
