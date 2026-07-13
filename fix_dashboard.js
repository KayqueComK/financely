const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const tabAnim = `initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.25, ease: "easeOut" }}`;

content = content.replace(
  '{activeTab === "admin" && (\n          <section className="space-y-6 animate-in fade-in duration-200">',
  '{activeTab === "admin" && (\n          <motion.section key="tab-admin" ' + tabAnim + ' className="space-y-6">'
);

content = content.replace(
  '{activeTab === "market" && (\n          <section className="space-y-6 animate-in fade-in duration-200">',
  '{activeTab === "market" && (\n          <motion.section key="tab-market" ' + tabAnim + ' className="space-y-6">'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Fixed overlapping replacements');
