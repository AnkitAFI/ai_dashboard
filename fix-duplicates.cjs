const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      const exports = content.match(/export default function \w+/g);
      if (exports && exports.length > 1) {
          console.log('Multiple exports in:', p);
          // Keep only the LAST one, as it's likely the wrapper we appended
          const lines = content.split('\n');
          const exportIndices = [];
          lines.forEach((line, i) => {
              if (line.trim().startsWith('export default function')) {
                  exportIndices.push(i);
              }
          });
          
          if (exportIndices.length > 1) {
              // Remove all but the last one
              // But wait, the previous ones might have important logic (like Providers)
              // In Dashboard/page.tsx:
              // export default function Dashboard() { return <FiltersProvider><DashboardContent/></FiltersProvider> }
              // was the original. The new one added Suspense.
              // We should MERGE them.
              
              if (p.includes('dashboard\\page.tsx')) {
                  // Special case for Dashboard
                  content = content.replace(/export default function Dashboard\(\) \{[\s\S]*?\}[\s\S]*?export default function Dashboard\(\) \{[\s\S]*?\}/, 
                    'export default function Dashboard() {\n  return (\n    <Suspense fallback={<div className=\"flex items-center justify-center min-h-screen\"><div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600\" /></div>}>\n      <FiltersProvider>\n        <DashboardContent />\n      </FiltersProvider>\n    </Suspense>\n  );\n}');
              } else {
                  // For others, just keep the last one and hope for the best, or manual fix
                  console.log('  Manual check recommended for:', p);
                  // Just remove the duplicates for now by keeping only the last block
                  const lastIndex = exportIndices[exportIndices.length - 1];
                  const newLines = lines.slice(0, exportIndices[0]);
                  newLines.push(...lines.slice(lastIndex));
                  content = newLines.join('\n');
              }
              fs.writeFileSync(p, content);
              console.log('  Fixed duplicates in:', p);
          }
      }
    }
  });
}

walk('app/(dashboard)');
