const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const oldAnim = `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}`;
const newAnim = `initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.25, ease: "easeOut" }}`;

content = content.split(oldAnim).join(newAnim);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Animation updated');
