const fs = require('fs');
const path = require('path');

// 1. Locate and copy the SVG logo from Downloads
const downloadPaths = [
  'C:\\Users\\user\\Downloads\\IPONION logo main file.svg',
  path.join(process.env.USERPROFILE || 'C:\\Users\\user', 'Downloads', 'IPONION logo main file.svg'),
  path.join(process.env.HOMEPATH ? 'C:' + process.env.HOMEPATH : 'C:\\Users\\user', 'Downloads', 'IPONION logo main file.svg')
];

let svgData = '';
for (const p of downloadPaths) {
  if (fs.existsSync(p)) {
    try {
      svgData = fs.readFileSync(p, 'utf8');
      console.log('✓ Found SVG logo at:', p);
      break;
    } catch (e) {}
  }
}

// Ensure public directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (svgData) {
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgData, 'utf8');
  console.log('✓ Successfully saved logo to public/logo.svg');
} else {
  console.log('⚠️ Could not directly read from Downloads path, creating fallback link.');
}

// 2. components/Logo.tsx - Clean, Responsive SVG Logo Component
const logoComponent = `"use client";

import React from "react";

export default function IponionLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  const heights = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-10",
    lg: "h-11 sm:h-12"
  };

  return (
    <div className={\`flex items-center gap-2 select-none \${className}\`}>
      <img
        src="/logo.svg"
        alt="IPONION"
        className={\`\${heights[size] || "h-9"} w-auto object-contain max-w-[200px]\`}
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
`;

fs.writeFileSync(path.join(__dirname, 'components/Logo.tsx'), logoComponent, 'utf8');
console.log('✓ components/Logo.tsx updated with final logo rendering');

// 3. app/page.tsx - Compact, Balanced Header & Sleek Proportions
let homePagePath = path.join(__dirname, 'app/page.tsx');
if (fs.existsSync(homePagePath)) {
  let content = fs.readFileSync(homePagePath, 'utf8');

  // Replace oversized hero heading class
  content = content.replace(
    /text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-\[1\.2\] mb-5/g,
    'text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug mb-3.5'
  );

  // Replace oversized hero section padding
  content = content.replace(
    /pt-12 pb-16 bg-gradient-to-b/g,
    'pt-7 pb-10 sm:pt-9 sm:pb-12 bg-gradient-to-b'
  );

  // Replace navbar padding
  content = content.replace(
    /py-3\.5 flex items-center justify-between/g,
    'py-2.5 sm:py-3 flex items-center justify-between'
  );

  // Replace hero paragraph text size
  content = content.replace(
    /text-base sm:text-lg text-slate-600 mb-8 leading-relaxed/g,
    'text-sm sm:text-base text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed'
  );

  fs.writeFileSync(homePagePath, content, 'utf8');
  console.log('✓ app/page.tsx updated with sleek, standard header dimensions');
}

console.log('\\nAll final logo and design updates completed!');
