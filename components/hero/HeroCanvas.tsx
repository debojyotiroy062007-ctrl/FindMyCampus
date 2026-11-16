"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

interface Particle {
  id: number;
  x: string;
  y: string;
  size: number;
  color: string;
  glow: string;
  duration: number;
  dx: number[];
  dy: number[];
}

const PARTICLES: Particle[] = [
  {
    id: 1,
    x: "16%",
    y: "22%",
    size: 3,
    color: "bg-indigo-400",
    glow: "shadow-[0_0_10px_rgba(99,102,241,0.8)]",
    duration: 9,
    dx: [0, 18, -12, 0],
    dy: [0, -22, 12, 0],
  },
  {
    id: 2,
    x: "82%",
    y: "28%",
    size: 2.5,
    color: "bg-emerald-400",
    glow: "shadow-[0_0_10px_rgba(16,185,129,0.8)]",
    duration: 11,
    dx: [0, -20, 15, 0],
    dy: [0, 18, -20, 0],
  },
  {
    id: 3,
    x: "28%",
    y: "68%",
    size: 3.5,
    color: "bg-purple-400",
    glow: "shadow-[0_0_12px_rgba(168,85,247,0.8)]",
    duration: 13,
    dx: [0, 24, -16, 0],
    dy: [0, -18, 22, 0],
  },
  {
    id: 4,
    x: "72%",
    y: "74%",
    size: 2,
    color: "bg-cyan-400",
    glow: "shadow-[0_0_8px_rgba(6,182,212,0.8)]",
    duration: 10,
    dx: [0, -16, 22, 0],
    dy: [0, 20, -16, 0],
  },
  {
    id: 5,
    x: "50%",
    y: "14%",
    size: 2.5,
    color: "bg-indigo-300",
    glow: "shadow-[0_0_10px_rgba(129,140,248,0.8)]",
    duration: 12,
    dx: [0, 12, -18, 0],
    dy: [0, -12, 16, 0],
  },
  {
    id: 6,
    x: "90%",
    y: "58%",
    size: 3,
    color: "bg-emerald-300",
    glow: "shadow-[0_0_10px_rgba(52,211,153,0.8)]",
    duration: 14,
    dx: [0, -24, 12, 0],
    dy: [0, -22, 18, 0],
  },
  {
    id: 7,
    x: "10%",
    y: "62%",
    size: 2,
    color: "bg-indigo-400",
    glow: "shadow-[0_0_8px_rgba(99,102,241,0.7)]",
    duration: 10,
    dx: [0, 20, -12, 0],
    dy: [0, 16, -22, 0],
  },
  {
    id: 8,
    x: "62%",
    y: "42%",
    size: 1.5,
    color: "bg-white",
    glow: "shadow-[0_0_6px_rgba(255,255,255,0.9)]",
    duration: 8,
    dx: [0, -12, 16, 0],
    dy: [0, 12, -14, 0],
  },
];

export function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Raw cursor motion values (start at reasonable hero center)
  const mouseX = useMotionValue(500);
  const mouseY = useMotionValue(220);

  // Smooth physics spring coordinates for responsive spotlight lag
  const springX = useSpring(mouseX, { stiffness: 140, damping: 22, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 140, damping: 22, mass: 0.6 });

  // Dynamic radial gradients bound directly to GPU compositor (zero React re-renders)
  const spotlightBackground = useMotionTemplate`radial-gradient(650px circle at ${springX}px ${springY}px, rgba(99, 102, 241, 0.14), rgba(16, 185, 129, 0.05), transparent 70%)`;
  const secondaryHalo = useMotionTemplate`radial-gradient(350px circle at ${springX}px ${springY}px, rgba(168, 85, 247, 0.08), transparent 60%)`;

  useEffect(() => {
    setMounted(true);
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    // Set initial center coordinates
    const initialRect = parent.getBoundingClientRect();
    if (initialRect.width > 0 && initialRect.height > 0) {
      mouseX.set(initialRect.width / 2);
      mouseY.set(initialRect.height / 2);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX.set(x);
      mouseY.set(y);
    };

    parent.addEventListener("mousemove", handleMouseMove);
    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-10"
      aria-hidden="true"
    >
      {/* Dynamic Cursor Spotlight (Primary Indigo-Emerald Beam) */}
      <motion.div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: spotlightBackground,
          opacity: mounted ? 1 : 0,
        }}
      />

      {/* Secondary Violet Cursor Halo */}
      <motion.div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: secondaryHalo,
          opacity: mounted ? 1 : 0,
        }}
      />

      {/* Perspective Geometric Matrix Grid with Ambient Radial Mask */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, black 30%, transparent 80%)",
        }}
      />

      {/* Micro-Dot Sub-Matrix */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 65% 55% at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 45%, black 20%, transparent 75%)",
        }}
      />

      {/* Ambient Top Horizon Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-indigo-500/10 via-indigo-500/3 to-transparent blur-2xl" />

      {/* Floating Ambient Particle Nodes Drifting via Framer Motion */}
      {mounted &&
        PARTICLES.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full ${particle.color} ${particle.glow}`}
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              x: particle.dx,
              y: particle.dy,
              opacity: [0.25, 0.85, 0.35, 0.25],
              scale: [1, 1.25, 0.9, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
    </div>
  );
}

