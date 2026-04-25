const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      let original = content;
      
      // 1. Identify all function declarations
      const funcMatches = [...content.matchAll(/function\s+(\w+)\s*\(/g)];
      const funcNames = funcMatches.map(m => m[1]);
      
      // 2. Identify duplicate functions
      const counts = {};
      funcNames.forEach(n => counts[n] = (counts[n] || 0) + 1);
      
      Object.keys(counts).forEach(name => {
          if (counts[name] > 1) {
              console.log(`Duplicate function '${name}' in ${p}`);
              
              // Find all instances of this function
              const instances = [];
              const regex = new RegExp(`function\\s+${name}\\s*\\(\\)\\s*\\{[^}]*return\\s*\\(\\s*<Suspense[\\s\\S]*?<${name}\\s*\\/>[\\s\\S]*?\\};?`, 'g');
              
              let m;
              while ((m = regex.exec(content)) !== null) {
                  // This is a recursive suspense wrapper
                  instances.push({ index: m.index, length: m[0].length, full: m[0] });
              }
              
              if (instances.length > 0) {
                  // Remove these recursive wrappers
                  // We sort backwards to not mess up indices
                  instances.sort((a, b) => b.index - a.index).forEach(inst => {
                      content = content.slice(0, inst.index) + content.slice(inst.index + inst.length);
                      console.log(`  Removed recursive wrapper for ${name}`);
                  });
              }
          }
      });
      
      // 3. Fix multiple export defaults
      const exportMatches = [...content.matchAll(/export default function\s+(\w+)/g)];
      if (exportMatches.length > 1) {
          console.log(`Multiple exports in ${p}`);
          // Keep only the last one
          const lastMatch = exportMatches[exportMatches.length - 1];
          const firstMatch = exportMatches[0];
          
          // Remove all export defaults except the last one
          content = content.replace(/export default function\s+\w+\s*\([\s\S]*?\}[\r\n]*/g, (m, offset) => {
              if (offset === lastMatch.index) return m;
              return '';
          });
          console.log(`  Kept only last export: ${lastMatch[1]}`);
      }

      if (content !== original) {
        fs.writeFileSync(p, content.trim() + '\n');
        console.log('Fixed:', p);
      }
    }
  });
}

walk('app/(dashboard)');
