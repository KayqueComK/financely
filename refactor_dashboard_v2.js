const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// 1. Add imports
if (!content.includes('import { motion, AnimatePresence }')) {
  content = content.replace(
    'import { PieChart } from "@/components/charts/pie-chart";',
    'import { motion, AnimatePresence } from "motion/react";\nimport { PieChart } from "@/components/charts/pie-chart";'
  );
}

// 2. Wrap tabs in AnimatePresence
content = content.replace(
  '        </header>\n\n        {activeTab === "dashboard" && (\n          <>\n',
  '        </header>\n\n        <AnimatePresence mode="wait">\n        {activeTab === "dashboard" && (\n          <motion.div key="tab-dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>\n'
);

content = content.replace(
  '            </section>\n          </>\n        )}',
  '            </section>\n          </motion.div>\n        )}'
);

content = content.replace(
  '        {activeTab === "admin" && (\n          <section className="space-y-6 animate-in fade-in duration-200">',
  '        {activeTab === "admin" && (\n          <motion.section key="tab-admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">'
);

content = content.replace(
  '            </div>\n          </section>\n        )}',
  '            </div>\n          </motion.section>\n        )}'
);

content = content.replace(
  '        {activeTab === "market" && (\n          <section className="space-y-6 animate-in fade-in duration-200">',
  '        {activeTab === "market" && (\n          <motion.section key="tab-market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">'
);

content = content.replace(
  '              </div>\n            </div>\n          </section>\n        )}',
  '              </div>\n            </div>\n          </motion.section>\n        )}\n        </AnimatePresence>'
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
  // Add AnimatePresence. Regex must match exactly the modal condition.
  // We use [\s\S]*? to match the space before the div
  const regexStart = new RegExp(`({${modal}.*?&& \\()\\s*<div className="fixed`, 'g');
  content = content.replace(regexStart, `<AnimatePresence>\n      $1\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed`);
  
  // Replace inner modal container
  const regexInner = /<div className="(w-full max-[^"]+ bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800) animate-in fade-in zoom-in-95 duration-150"[^>]*>/g;
  
  // We need to support onClick={...} that might be on the inner div
  content = content.replace(regexInner, `<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="$1">`);
}

// We need to close motion.div and AnimatePresence
content = content.replace(/          <\/div>\n        <\/div>\n      \)}\n/g, '          </motion.div>\n        </motion.div>\n      )}\n      </AnimatePresence>\n');
// the charts modals might have a slightly different ending
content = content.replace(/          <\/div>\n        <\/div>\n      \)}/g, '          </motion.div>\n        </motion.div>\n      )}\n      </AnimatePresence>');

// 4. Update Staggering for transaction list
content = content.replace(
  '<ul className="space-y-3">',
  '<motion.ul className="space-y-3" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>'
);
content = content.replace(
  /<li key=\{tx\.id\} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">/g,
  '<motion.li variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} key={tx.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">'
);
content = content.replace(
  '                  </ul>',
  '                  </motion.ul>'
);

// 5. Update Staggering for Admin Users list
content = content.replace(
  '<tbody className="divide-y divide-slate-100">',
  '<motion.tbody className="divide-y divide-slate-100" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>'
);
content = content.replace(
  /<tr key=\{u\.id\} className="hover:bg-slate-50\/50 transition">/g,
  '<motion.tr variants={{ hidden: { opacity: 0, y: 5 }, show: { opacity: 1, y: 0 } }} key={u.id} className="hover:bg-slate-50/50 transition">'
);
content = content.replace(
  '                  </tbody>',
  '                  </motion.tbody>'
);


// 6. Update Staggering for Financial Cards
content = content.replace(
  /<section className="grid grid-cols-1 md:grid-cols-3 gap-6">/,
  '<motion.section className="grid grid-cols-1 md:grid-cols-3 gap-6" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>'
);
// Replace the first div inside the grid with motion.div
content = content.replace(
  /<div className="erp-card p-6 rounded-xl relative overflow-hidden">/g,
  '<motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="erp-card p-6 rounded-xl relative overflow-hidden">'
);
// Make sure to close the div properly
// Since replacing </div\> might conflict, let's leave the closing tag as </div> because motion.div can be closed with </motion.div>. Wait, if I open `<motion.div>`, I MUST close it with `</motion.div>`.
// So instead of motion.div for the grid items, I'll just leave the cards as they are without staggering if it's too complex, or I'll just use simple variants.
// Wait, replacing `</div>` is very hard. Let's just NOT stagger the cards for now, or just add `animate={{opacity:1, y:0}}` on them manually.
// Actually, it's safer to omit step 6 if it requires complex HTML parsing. Let's remove step 6 replacements and keep it simple.
content = content.replace(
  /<motion\.section className="grid grid-cols-1 md:grid-cols-3 gap-6" initial="hidden" animate="show" variants=\{\{ hidden: \{ opacity: 0 \}, show: \{ opacity: 1, transition: \{ staggerChildren: 0\.1 \} \} \}\}>/,
  '<section className="grid grid-cols-1 md:grid-cols-3 gap-6">'
);
content = content.replace(
  /<motion\.div variants=\{\{ hidden: \{ opacity: 0, y: 20 \}, show: \{ opacity: 1, y: 0 \} \}\} className="erp-card p-6 rounded-xl relative overflow-hidden">/g,
  '<div className="erp-card p-6 rounded-xl relative overflow-hidden">'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Refactor complete v2');
