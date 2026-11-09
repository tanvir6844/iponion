"use client";

import React from "react";

export default function IponionLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  // Enhanced, bigger sizes so the logo stands out prominently
  const heights = {
    sm: "h-9 sm:h-11",
    md: "h-12 sm:h-14 md:h-16",
    lg: "h-16 sm:h-20"
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src="/logo.svg"
        alt="IPONION - IT & Network Support"
        className={`${heights[size] || "h-14"} w-auto object-contain transition-all drop-shadow-sm`}
      />
    </div>
  );
}
