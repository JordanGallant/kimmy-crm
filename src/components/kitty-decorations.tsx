"use client";

import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

const SPARKLES = ["💖", "✨", "🌸", "💗", "🎀", "💝", "🩷", "💕", "⭐", "🦋"];

function FallingSparkle({ delay, left }: { delay: number; left: number }) {
  return (
    <span
      className="fixed pointer-events-none z-50 text-lg animate-fall"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        top: "-20px",
      }}
    >
      {SPARKLES[Math.floor(Math.random() * SPARKLES.length)]}
    </span>
  );
}

export function KittyDecorations() {
  const { theme } = useTheme();
  const [sparkles, setSparkles] = useState<{ id: number; delay: number; left: number }[]>([]);

  useEffect(() => {
    if (theme !== "pink") return;

    const items = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
      left: Math.random() * 100,
    }));
    setSparkles(items);
  }, [theme]);

  if (theme !== "pink") return null;

  return (
    <>
      {/* Falling sparkles */}
      {sparkles.map((s) => (
        <FallingSparkle key={s.id} delay={s.delay} left={s.left} />
      ))}

      {/* Corner Hello Kitty images */}
      <img
        src="/hello-kitty/kitty2.png"
        alt=""
        className="fixed bottom-4 right-4 w-28 sm:w-36 opacity-30 pointer-events-none z-0 animate-bounce-slow"
      />
      <img
        src="/hello-kitty/kitty4.png"
        alt=""
        className="fixed top-20 left-2 w-20 sm:w-24 opacity-20 pointer-events-none z-0 animate-wiggle hidden md:block"
      />

      {/* Bow ribbon top banner */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 via-pink-500 to-pink-300 z-[60] pointer-events-none" />

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          70% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall 8s linear infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          25% { transform: rotate(5deg) scale(1.05); }
          50% { transform: rotate(-3deg) scale(1); }
          75% { transform: rotate(4deg) scale(1.02); }
        }
        .animate-wiggle {
          animation: wiggle 5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
