const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// 1. Add imports
if (!content.includes('import { motion, AnimatePresence }')) {
  content = content.replace(
    'import { PieChart } from "@/components/charts/pie-chart";',
    'import { motion, AnimatePresence } from "motion/react";\nimport { PieChart } from "@/components/charts/pie-chart";'
  );
}

// 2. Wrap tabs in AnimatePresence with slide-out-left
// When going left, it enters from x: 50, stays at 0, and exits to x: -50.
const slideAnim = `initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.25, ease: "easeOut" }}`;

content = content.replace(
  '        </header>\n\n        {activeTab === "dashboard" && (\n          <>\n',
  '        </header>\n\n        <AnimatePresence mode="wait">\n        {activeTab === "dashboard" && (\n          <motion.div key="tab-dashboard" ' + slideAnim + '>\n'
);

content = content.replace(
  '            </section>\n          </>\n        )}',
  '            </section>\n          </motion.div>\n        )}'
);

content = content.replace(
  '        {activeTab === "admin" && (\n          <section className="space-y-6 animate-in fade-in duration-200">',
  '        {activeTab === "admin" && (\n          <motion.section key="tab-admin" ' + slideAnim + ' className="space-y-6">'
);

content = content.replace(
  '            </div>\n          </section>\n        )}',
  '            </div>\n          </motion.section>\n        )}'
);

content = content.replace(
  '        {activeTab === "market" && (\n          <section className="space-y-6 animate-in fade-in duration-200">',
  '        {activeTab === "market" && (\n          <motion.section key="tab-market" ' + slideAnim + ' className="space-y-6">'
);

content = content.replace(
  '              </div>\n            </div>\n          </section>\n        )}',
  '              </div>\n            </div>\n          </motion.section>\n        )}\n        </AnimatePresence>'
);

// 3. Modals wrapping
// Modal 1: showAddTx
content = content.replace(
  '{showAddTx && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">',
  '<AnimatePresence>\n      {showAddTx && (\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800">'
);

// Modal 2: showEditTx
content = content.replace(
  '{showEditTx && editingTx && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">',
  '<AnimatePresence>\n      {showEditTx && editingTx && (\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800">'
);

// Modal 3: showAddCat
content = content.replace(
  '{showAddCat && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <div className="w-full max-w-sm bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">',
  '<AnimatePresence>\n      {showAddCat && (\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="w-full max-w-sm bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800">'
);

// Modal 4: showEditUserModal
content = content.replace(
  '{showEditUserModal && editingUser && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">',
  '<AnimatePresence>\n      {showEditUserModal && editingUser && (\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800">'
);

// Modal 5: showReportModal
content = content.replace(
  '{showReportModal && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <div className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150">',
  '<AnimatePresence>\n      {showReportModal && (\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">\n          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800">'
);

// Modal 6: selectedAssetChart
content = content.replace(
  '{selectedAssetChart && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" onClick={() => setSelectedAssetChart(null)}>\n          <div className="w-full max-w-3xl bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>',
  '<AnimatePresence>\n      {selectedAssetChart && (\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" onClick={() => setSelectedAssetChart(null)}>\n          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="w-full max-w-3xl bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800" onClick={e => e.stopPropagation()}>'
);

// Modal 7: selectedCurrencyChart
content = content.replace(
  '{selectedCurrencyChart && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" onClick={() => setSelectedCurrencyChart(null)}>\n          <div className="w-full max-w-3xl bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>',
  '<AnimatePresence>\n      {selectedCurrencyChart && (\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" onClick={() => setSelectedCurrencyChart(null)}>\n          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="w-full max-w-3xl bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800" onClick={e => e.stopPropagation()}>'
);

// Closing tags for modals (all 7 of them)
content = content.replace(/          <\/div>\n        <\/div>\n      \)}\n/g, '          </motion.div>\n        </motion.div>\n      )}\n      </AnimatePresence>\n');
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


fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Refactor complete slide');
