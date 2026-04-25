const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      let original = c;
      
      // 1. Identify what we need from next/navigation
      let needsRouter = c.includes('setLocation(') || c.includes('router.push(') || c.includes('router.back(') || c.includes('router.replace(');
      let needsPathname = c.includes('location.pathname') || c.includes('pathname') || /const\s+\[\s*location/.test(c);
      let needsParams = c.includes('useRoute(') || c.includes('useParams(');
      
      // Specific check for the common patterns we found
      if (/useLocation\(\)/.test(c)) {
          if (/const\s+\[\s*location\s*,\s*setLocation\s*\]\s*=\s*useLocation\(\)/.test(c)) {
              needsRouter = true;
              needsPathname = true;
          } else if (/const\s+\[\s*,\s*setLocation\s*\]\s*=\s*useLocation\(\)/.test(c)) {
              needsRouter = true;
          } else if (/const\s+\[\s*location\s*\]\s*=\s*useLocation\(\)/.test(c)) {
              needsPathname = true;
          }
      }
      if (/useRoute\(\s*["']/.test(c)) {
          needsParams = true;
      }

      // 2. Fix wouter imports -> next/navigation
      c = c.replace(
        /import\s+\{([^}]*)\}\s+from\s+["']wouter["'];?[\r\n]?/g,
        (match, imports) => {
          let result = '';
          const hooks = [];
          if (needsRouter) hooks.push('useRouter');
          if (needsPathname) hooks.push('usePathname');
          if (needsParams) hooks.push('useParams');
          
          if (hooks.length > 0) {
              result += `import { ${hooks.join(', ')} } from "next/navigation";\n`;
          }
          if (imports.includes('Link')) {
            result += `import Link from "next/link";\n`;
          }
          return result;
        }
      );

      // Handle cases where next/navigation was already partially imported by other scripts
      if (c.includes('from "next/navigation"')) {
          c = c.replace(/import\s+\{([^}]*)\}\s+from\s+["']next\/navigation["'];?/g, (m, imports) => {
              const current = imports.split(',').map(i => i.trim());
              if (needsRouter && !current.includes('useRouter')) current.push('useRouter');
              if (needsPathname && !current.includes('usePathname')) current.push('usePathname');
              if (needsParams && !current.includes('useParams')) current.push('useParams');
              return `import { ${Array.from(new Set(current)).join(', ')} } from "next/navigation";`;
          });
      } else if (needsRouter || needsPathname || needsParams) {
          // If no import yet but we need it (e.g. wouter import was missing but hooks are used)
          const hooks = [];
          if (needsRouter) hooks.push('useRouter');
          if (needsPathname) hooks.push('usePathname');
          if (needsParams) hooks.push('useParams');
          c = c.replace('"use client";\n\n', `"use client";\n\nimport { ${hooks.join(', ')} } from "next/navigation";\n`);
      }
      
      // 3. Fix useLocation usage patterns
      c = c.replace(/const\s+\[\s*location\s*,\s*setLocation\s*\]\s*=\s*useLocation\(\);?/g, 
        'const pathname = usePathname(); const router = useRouter();');
      c = c.replace(/const\s+\[\s*,\s*setLocation\s*\]\s*=\s*useLocation\(\);?/g, 
        'const router = useRouter();');
      c = c.replace(/const\s+\[\s*location\s*\]\s*=\s*useLocation\(\);?/g, 
        'const pathname = usePathname();');

      // 4. Fix useRoute usage patterns
      // Pattern: const [match, params] = useRoute("/product/:productName");
      c = c.replace(/const\s+\[\s*\w+\s*,\s*(\w+)\s*\]\s*=\s*useRoute\([^)]*\);?/g, 
        'const $1 = useParams();');
      // Pattern: const [, params] = useRoute("/product/:productName");
      c = c.replace(/const\s+\[\s*,\s*(\w+)\s*\]\s*=\s*useRoute\([^)]*\);?/g, 
        'const $1 = useParams();');

      // 5. Global replacements for the variables
      c = c.replace(/\bsetLocation\(/g, 'router.push(');
      if (original.includes('const [location') || original.includes('const [ location')) {
          c = c.replace(/\blocation\b/g, 'pathname');
      }

      if (c !== original) {
        fs.writeFileSync(p, c);
        console.log('Fixed wouter in:', p);
      }
    }
  });
}

walk('app/(dashboard)');
console.log('Wouter fix completed.');
