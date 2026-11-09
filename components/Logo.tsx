"use client";

import React from "react";

export default function IponionLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const heights = {
    sm: "h-11 sm:h-12",
    md: "h-14 sm:h-16 md:h-20",
    lg: "h-20 sm:h-24 md:h-28"
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <img
        src="/logo.svg?v=final2"
        alt="IPONION - IT & Network Support"
        className={`${heights[size] || "h-16"} w-auto object-contain transition-all drop-shadow-sm`}
      />
    </div>
  );
}
