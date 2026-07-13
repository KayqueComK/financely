const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// 1. Add imports (already there but let's be safe)
if (!content.includes('import { motion, AnimatePresence }')) {
  content = content.replace(
    'import { PieChart } from "@/components/charts/pie-chart";',
    'import { motion, AnimatePresence } from "motion/react";\nimport { PieChart } from "@/components/charts/pie-chart";'
  );
}

// 2. Wrap tabs in AnimatePresence with slide-out-left
const tabAnim = `initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25, ease: "easeOut" }}`;

content = content.replace(
  /\{\s*activeTab === "dashboard"\s*&&\s*\(\s*<>\s*/,
  '<AnimatePresence mode="wait">\n        {activeTab === "dashboard" && (\n          <motion.div key="tab-dashboard" ' + tabAnim + '>\n'
);

content = content.replace(
  /\s*<\/section>\s*<\/>\s*\)\}/,
  '\n            </section>\n          </motion.div>\n        )}'
);

content = content.replace(
  /\{\s*activeTab === "admin"\s*&&\s*\(\s*<section className="space-y-6 animate-in fade-in duration-200">\s*/,
  '{activeTab === "admin" && (\n          <motion.section key="tab-admin" ' + tabAnim + ' className="space-y-6">\n'
);

content = content.replace(
  /\s*<\/div>\s*<\/section>\s*\)\}/,
  '\n            </div>\n          </motion.section>\n        )}'
);

content = content.replace(
  /\{\s*activeTab === "market"\s*&&\s*\(\s*<section className="space-y-6 animate-in fade-in duration-200">\s*/,
  '{activeTab === "market" && (\n          <motion.section key="tab-market" ' + tabAnim + ' className="space-y-6">\n'
);

content = content.replace(
  /\s*<\/div>\s*<\/div>\s*<\/section>\s*\)\}/,
  '\n              </div>\n            </div>\n          </motion.section>\n        )}\n        </AnimatePresence>'
);

// 3. Modals wrapping
const modals = [
  'showAddTx',
  'showEditTx',
  'showAddCat',
  'showEditUserModal',
  'showReportModal',
  'selectedAssetChart',
  'selectedCurrencyChart'
];

for (const modal of modals) {
  const regexStart = new RegExp(`({${modal}.*?&& \\()\\s*<div className="fixed inset-0[^>]+>`, 'g');
  content = content.replace(regexStart, `<AnimatePresence>\n      $1\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">`);
  
  const regexInner = /<div className="(w-full max-[^"]+ bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800) animate-in fade-in zoom-in-95 duration-150"([^>]*)>/g;
  content = content.replace(regexInner, `<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="$1"$2>`);
}

// Ensure closing for Modals
content = content.replace(/          <\/div>\n        <\/div>\n      \)}\n/g, '          </motion.div>\n        </motion.div>\n      )}\n      </AnimatePresence>\n');
content = content.replace(/          <\/div>\n        <\/div>\n      \)}/g, '          </motion.div>\n        </motion.div>\n      )}\n      </AnimatePresence>');

// 4. Update Staggering for transaction list
content = content.replace(
  /<ul className="space-y-3">/g,
  '<motion.ul className="space-y-3" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>'
);
content = content.replace(
  /<li key=\{tx\.id\} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">/g,
  '<motion.li variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} key={tx.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">'
);
content = content.replace(
  /                  <\/ul>/g,
  '                  </motion.ul>'
);

// 5. Update Staggering for Admin Users list
content = content.replace(
  /<tbody className="divide-y divide-slate-100">/g,
  '<motion.tbody className="divide-y divide-slate-100" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>'
);
content = content.replace(
  /<tr key=\{u\.id\} className="hover:bg-slate-50\/50 transition">/g,
  '<motion.tr variants={{ hidden: { opacity: 0, y: 5 }, show: { opacity: 1, y: 0 } }} key={u.id} className="hover:bg-slate-50/50 transition">'
);
content = content.replace(
  /                  <\/tbody>/g,
  '                  </motion.tbody>'
);


fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Refactor complete v5');
