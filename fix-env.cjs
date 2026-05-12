const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      let original = c;

      // Replace Vite env vars with Next.js env vars
      c = c.replace(/import\.meta\.env\.VITE_API_URL/g, 'process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com"');
      c = c.replace(/import\.meta\.env\.VITE_ADMIN_EMAIL/g, 'process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""');
      // Catch any remaining import.meta.env
      c = c.replace(/import\.meta\.env\.VITE_(\w+)/g, 'process.env.NEXT_PUBLIC_$1');
      c = c.replace(/import\.meta\.env\.(\w+)/g, 'process.env.$1');

      if (c !== original) {
        fs.writeFileSync(p, c);
        console.log('Fixed env vars in', p);
      }
    }
  });
}

walk('app/(dashboard)');
