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
  '{activeTab === "dashboard" && (',
  '<AnimatePresence mode="wait">\n        {activeTab === "dashboard" && ('
);

content = content.replace(
  '          </>\n        )}\n\n        {activeTab === "admin" && (',
  '          </>\n        )}\n\n        {activeTab === "admin" && ('
);

// We need to carefully replace the wrappers of each tab.
// Tab 1: dashboard
content = content.replace(
  '{activeTab === "dashboard" && (\n          <>\n',
  '{activeTab === "dashboard" && (\n          <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>\n'
);
content = content.replace(
  '            </section>\n          </>\n        )}',
  '            </section>\n          </motion.div>\n        )}'
);

// Tab 2: admin
content = content.replace(
  '{activeTab === "admin" && (\n          <section className="space-y-6 animate-in fade-in duration-200">',
  '{activeTab === "admin" && (\n          <motion.section key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">'
);
content = content.replace(
  '            </div>\n          </section>\n        )}',
  '            </div>\n          </motion.section>\n        )}'
);

// Tab 3: market
content = content.replace(
  '{activeTab === "market" && (\n          <section className="space-y-6 animate-in fade-in duration-200">',
  '{activeTab === "market" && (\n          <motion.section key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">'
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
  // Add AnimatePresence
  const regexStart = new RegExp(`({${modal}.*?&& \\()\\n\\s*<div className="fixed`, 'g');
  content = content.replace(regexStart, `<AnimatePresence>\n      $1\n        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed`);
  
  // Replace inner modal container
  const regexInner = /<div className="(w-full max-w-[a-z0-9]+ bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800) animate-in fade-in zoom-in-95 duration-150"/g;
  content = content.replace(regexInner, `<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="$1"`);

  // We need to close motion.div and AnimatePresence
  // Since modals have exactly two closing divs before the `)}`, let's do a more robust string replacement
  // We'll replace the closing `        </div>\n      )}` with `        </motion.div>\n        </motion.div>\n      )}\n      </AnimatePresence>`
  // But wait, the inner is closed by `</div>`, the outer is closed by `</div>`.
  // We can just replace all `</div>` that match the end of a modal block.
}

// Write a simple string replace for the ends of modals
content = content.replace(/          <\/div>\n        <\/div>\n      \)}\n/g, '          </motion.div>\n        </motion.div>\n      )}\n      </AnimatePresence>\n');
// the charts modals might have a slightly different ending
content = content.replace(/          <\/div>\n        <\/div>\n      \)}/g, '          </motion.div>\n        </motion.div>\n      )}\n      </AnimatePresence>');

// 4. Update Staggering for transaction list
content = content.replace(
  '<ul className="space-y-3">',
  '<motion.ul className="space-y-3" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>'
);
content = content.replace(
  '<li key={tx.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">',
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
  '<tr key={u.id} className="hover:bg-slate-50/50 transition">',
  '<motion.tr variants={{ hidden: { opacity: 0, y: 5 }, show: { opacity: 1, y: 0 } }} key={u.id} className="hover:bg-slate-50/50 transition">'
);
content = content.replace(
  '                  </tbody>',
  '                  </motion.tbody>'
);


fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Refactor complete');
