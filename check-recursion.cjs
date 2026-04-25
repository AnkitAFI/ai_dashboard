const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      const funcMatches = [...content.matchAll(/function\s+(\w+)\s*\(/g)];
      funcMatches.forEach(m => {
          const name = m[1];
          // Look for <Name /> inside function Name() { ... }
          // We look for the function body
          const start = m.index;
          let braceCount = 0;
          let end = -1;
          let foundOpen = false;
          
          for (let i = start; i < content.length; i++) {
              if (content[i] === '{') {
                  braceCount++;
                  foundOpen = true;
              } else if (content[i] === '}') {
                  braceCount--;
              }
              
              if (foundOpen && braceCount === 0) {
                  end = i;
                  break;
              }
          }
          
          if (end !== -1) {
              const body = content.slice(start, end + 1);
              const recursiveRegex = new RegExp(`<${name}\\s*\\/>`, 'g');
              if (recursiveRegex.test(body)) {
                  console.log(`CRITICAL: Infinite recursion in ${p} for function ${name}`);
              }
          }
      });
    }
  });
}

walk('app/(dashboard)');
console.log('Recursion check completed.');
