const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      let original = c;
      
      // Replace hardcoded localhost URLs with env-based ones
      // Use a regex that catches variations
      c = c.replace(/["']http:\/\/localhost:8000(\/api)?["']/g, '(process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com")$1');
      
      // Specifically handle template strings
      c = c.replace(/`http:\/\/localhost:8000([^`]*)`/g, '`${(process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com")}$1`');
      
      // Clean up potential double process.env if already partially handled
      c = c.replace(/\(process\.env\.NEXT_PUBLIC_API_URL \|\| "http:\/\/localhost:8000"\) \|\| "http:\/\/localhost:8000"/g, '(process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com")');

      if (c !== original) {
        fs.writeFileSync(p, c);
        console.log('Fixed API URLs in:', p);
      }
    }
  });
}

walk('app/(dashboard)');
console.log('API URL fix completed.');
