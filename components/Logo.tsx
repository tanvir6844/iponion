"use client";

import React from "react";

export default function IponionLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const heights = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-10",
    lg: "h-11 sm:h-12"
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src="/logo.svg"
        alt="IPONION"
        className={`${heights[size] || "h-9"} w-auto object-contain max-w-[200px]`}
        onError={(e: any) => {
          // Fallback if image path is resolving
          e.target.style.display = 'none';
          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="hidden items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#2D1457] flex items-center justify-center text-white font-black text-sm">
          IP
        </div>
        <span className="font-black text-base tracking-tight text-[#2D1457]">IPONION</span>
      </div>
    </div>
  );
}
