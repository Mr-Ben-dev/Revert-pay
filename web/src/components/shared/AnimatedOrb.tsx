import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedOrb = () => {
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 600 - 300,
      y: Math.random() * 600 - 300,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Main gradient orb */}
      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)",
          filter: "blur(40px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary orb */}
      <motion.div
        className="absolute w-60 h-60 rounded-full"
        style={{
          background: "linear-gradient(225deg, #a855f7 0%, #06b6d4 100%)",
          filter: "blur(30px)",
          opacity: 0.7,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
          x: [-20, 20, -20],
          y: [20, -20, 20],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Solid centered orb with glow */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.8) 0%, rgba(168, 85, 247, 0.6) 50%, rgba(236, 72, 153, 0.4) 100%)",
          boxShadow:
            "0 0 100px rgba(6, 182, 212, 0.5), 0 0 200px rgba(168, 85, 247, 0.3)",
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-cyan-400"
          style={{
            left: `calc(50% + ${particle.x}px)`,
            top: `calc(50% + ${particle.y}px)`,
            boxShadow: "0 0 10px rgba(6, 182, 212, 0.8)",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Rotating rings */}
      <motion.div
        className="absolute w-96 h-96 rounded-full border-2 border-cyan-400/30"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full border-2 border-purple-400/20"
        animate={{
          rotate: -360,
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Center icon */}
      <motion.div
        className="absolute z-10"
        animate={{
          y: [-10, 10, -10],
          rotateZ: [-5, 5, -5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="iconGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "#06b6d4", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#a855f7", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
          {/* Refund arrow */}
          <path
            d="M 32 12 A 16 16 0 1 1 20 24"
            stroke="url(#iconGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M 20 24 L 20 16 L 12 24 Z" fill="url(#iconGradient)" />
          {/* Dollar sign */}
          <path
            d="M 30 28 L 34 28 C 36 28 37 29 37 31 C 37 33 36 34 34 34 L 30 34"
            stroke="url(#iconGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 30 34 L 35 34 C 37 34 38 35 38 37 C 38 39 37 40 35 40 L 30 40"
            stroke="url(#iconGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <line
            x1="32"
            y1="26"
            x2="32"
            y2="42"
            stroke="url(#iconGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
};
