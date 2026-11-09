const fs = require('fs');
const path = require('path');

// 1. Locate IPONION logo 2nd edition.svg in Downloads
const candidatePaths = [
  'C:\\Users\\user\\Downloads\\IPONION logo 2nd edition.svg',
  path.join(process.env.USERPROFILE || 'C:\\Users\\user', 'Downloads', 'IPONION logo 2nd edition.svg'),
  path.join('C:\\Users\\user\\Downloads', 'IPONION logo 2nd edition.svg')
];

let logoData = '';
let foundPath = '';

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    try {
      logoData = fs.readFileSync(p, 'utf8');
      foundPath = p;
      console.log('✓ Found 2nd Edition Logo at:', p);
      break;
    } catch (e) {}
  }
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (logoData) {
  // Save as main public/logo.svg
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoData, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'logo-2nd-edition.svg'), logoData, 'utf8');
  console.log('✓ Successfully saved 2nd edition logo to public/logo.svg');
} else {
  console.log('⚠️ Could not locate the file directly at the exact path, checking Downloads directory...');
  const dlDir = path.join(process.env.USERPROFILE || 'C:\\Users\\user', 'Downloads');
  if (fs.existsSync(dlDir)) {
    const files = fs.readdirSync(dlDir);
    const match = files.find(f => f.toLowerCase().includes('iponion') && f.toLowerCase().includes('2nd') && f.endsWith('.svg'));
    if (match) {
      const fullPath = path.join(dlDir, match);
      logoData = fs.readFileSync(fullPath, 'utf8');
      fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoData, 'utf8');
      console.log('✓ Found and copied matched file:', fullPath);
    }
  }
}

// 2. Update components/Logo.tsx with Extra Large, Prominent Size
const logoComponent = `"use client";

import React from "react";

export default function IponionLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) {
  // Extra-large, prominent dimensions so the 2nd edition logo looks bold and crystal clear
  const heights = {
    sm: "h-11 sm:h-12",
    md: "h-14 sm:h-16 md:h-20",
    lg: "h-20 sm:h-24 md:h-28"
  };

  return (
    <div className={\`flex items-center gap-2 select-none \${className}\`}>
      <img
        src="/logo.svg"
        alt="IPONION"
        className={\`\${heights[size] || "h-16"} w-auto object-contain transition-all drop-shadow-sm\`}
      />
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'components/Logo.tsx'), logoComponent, 'utf8');
console.log('✓ components/Logo.tsx updated with large, prominent display for 2nd edition logo');
console.log('\\nLogo update completed cleanly!');
