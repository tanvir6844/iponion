"use client";

import React from "react";

export default function IponionLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  // Extra-large, prominent dimensions so the 2nd edition logo looks bold and crystal clear
  const heights = {
    sm: "h-11 sm:h-12",
    md: "h-14 sm:h-16 md:h-20",
    lg: "h-20 sm:h-24 md:h-28"
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src="/logo.svg"
        alt="IPONION"
        className={`${heights[size] || "h-16"} w-auto object-contain transition-all drop-shadow-sm`}
      />
    </div>
  );
}
