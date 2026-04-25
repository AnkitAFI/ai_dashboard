const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      let original = content;
      
      // Look for the double export pattern or infinite loop
      // pattern: function NameContent() { return ( <Suspense> <NameContent /> </Suspense> ) }
      const infiniteLoopMatch = content.match(/function\s+(\w+Content)\(\)\s*\{\s*return\s*\(\s*<Suspense[^>]*>\s*<\1\s*\/>\s*<\/Suspense>\s*\);?\s*\}/);
      if (infiniteLoopMatch) {
          console.log('Found infinite loop in:', p);
          // Remove the infinite loop function
          content = content.replace(infiniteLoopMatch[0], '');
      }

      // Check for multiple export defaults
      const exports = content.match(/export default function/g);
      if (exports && exports.length > 1) {
          console.log('Found multiple exports in:', p);
          // This usually happens when wrap-suspense appends to a file that already has an export default
      }
      
      // LET'S CLEAN UP AND UNIFY
      // A clean file should have:
      // 1. One function NameContent(...) { ... } (not exported)
      // 2. One export default function Name() { return <Suspense><NameContent /></Suspense> }
      
      // First, find the real content function
      // It might be function NameContent( or export default function Name(
      let mainContent = '';
      const contentMatch = content.match(/function\s+(\w+Content)\s*\(/);
      const originalMatch = content.match(/export default function\s+(\w+)\s*\(/);
      
      if (contentMatch && originalMatch) {
          const internalName = contentMatch[1];
          const externalName = originalMatch[1];
          
          // If they are part of a double wrap, keep only one clean wrap at the end
          // Remove all existing wraps
          content = content.replace(/export default function \w+\(\) \{\s*return \(\s*<Suspense[\s\S]*?<\/Suspense>\s*\);\s*\}/g, '');
          
          // Re-append a clean wrap
          content = content.trim() + `\n\nexport default function ${externalName}() {\n  return (\n    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>\n      <${internalName} />\n    </Suspense>\n  );\n}\n`;
      }

      if (content !== original) {
        fs.writeFileSync(p, content);
        console.log('Sanitized:', p);
      }
    }
  });
}

walk('app/(dashboard)');
console.log('Sanitization completed.');
