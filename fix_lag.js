const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// 1. Add useRef to imports
if (!content.includes('useRef')) {
  content = content.replace(
    'import React, { useState, useEffect } from "react";',
    'import React, { useState, useEffect, useRef } from "react";'
  );
}

// 2. Remove tooltipState and add tooltipRef
content = content.replace(
  'const [tooltipState, setTooltipState] = useState<{ x: number, y: number } | null>(null);',
  'const tooltipRef = useRef<HTMLDivElement>(null);'
);

// 3. Update onMouseMove and onMouseLeave
content = content.replace(
  /onMouseMove=\{\(e\) => \{\s*const rect = e\.currentTarget\.getBoundingClientRect\(\);\s*setTooltipState\(\{\s*x: e\.clientX - rect\.left,\s*y: e\.clientY - rect\.top,\s*\}\);\s*\}\}\s*onMouseLeave=\{[^\}]+\}/g,
  `onMouseMove={(e) => {
                          if (tooltipRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            tooltipRef.current.style.left = \`\${e.clientX - rect.left + 15}px\`;
                            tooltipRef.current.style.top = \`\${e.clientY - rect.top + 15}px\`;
                          }
                        }}`
);

// 4. Update Tooltip render
content = content.replace(
  /\{tooltipState && hoveredSlice !== null && pieData\[hoveredSlice\] && \(\s*<div\s*className="absolute pointer-events-none bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 z-50 flex flex-col items-center transition-opacity duration-150"\s*style=\{\{\s*left: tooltipState\.x \+ 15,\s*top: tooltipState\.y \+ 15,\s*\}\}\s*>/g,
  `{hoveredSlice !== null && pieData[hoveredSlice] && (
                          <div 
                            ref={tooltipRef}
                            className="absolute pointer-events-none bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-2 z-50 flex flex-col items-center transition-opacity duration-150"
                            style={{ left: 0, top: 0 }}`
);
content = content.replace(
  /\{tooltipState && hoveredSlice !== null && pieData\[hoveredSlice\] && \(/,
  `{hoveredSlice !== null && pieData[hoveredSlice] && (`
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Lag fixed');
