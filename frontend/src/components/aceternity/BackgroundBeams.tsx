"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const beams = beamsRef.current;
    if (!beams) return;

    const moveBeams = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;
      beams.style.setProperty("--mouse-x", `${x}%`);
      beams.style.setProperty("--mouse-y", `${y}%`);
    };

    window.addEventListener("mousemove", moveBeams);

    return () => {
      window.removeEventListener("mousemove", moveBeams);
    };
  }, []);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden",
        className
      )}
      style={{
        background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--primary-rgb), 0.1), transparent 40%)`,
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  );
};
