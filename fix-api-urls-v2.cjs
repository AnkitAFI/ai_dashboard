const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      let original = c;
      
      // Fix the corrupted ones from the previous run
      // pattern: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")/api
      c = c.replace(/\(process\.env\.NEXT_PUBLIC_API_URL \|\| "http:\/\/localhost:8000"\)\/api/g, '(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")');
      
      // Clean up redundant double wraps
      c = c.replace(/process\.env\.NEXT_PUBLIC_API_URL \|\| \(process\.env\.NEXT_PUBLIC_API_URL \|\| "http:\/\/localhost:8000"\)/g, '(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")');

      if (c !== original) {
        fs.writeFileSync(p, c);
        console.log('Fixed API URLs in:', p);
      }
    }
  });
}

walk('app/(dashboard)');
console.log('API URL fix completed.');
