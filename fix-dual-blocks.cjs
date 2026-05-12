const fs = require('fs');
const path = require('path');

function applyTransforms(content) {
  content = content.replace(
    /import\s*\{\s*useAuth\s*\}\s+from\s+["']@\/App["'];?/g,
    'import { useAuth } from "@/lib/auth-context";'
  );
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+["']react-router-dom["'];?[\r\n]?/g,
    'import { useRouter, useSearchParams, usePathname } from "next/navigation";\n'
  );
  content = content.replace(/const navigate\s*=\s*useNavigate\(\);/g, 'const router = useRouter();');
  content = content.replace(/\bnavigate\(/g, 'router.push(');
  content = content.replace(/const location\s*=\s*useLocation\(\);/g, 'const pathname = usePathname();');
  content = content.replace(/\blocation\.pathname\b/g, 'pathname');
  content = content.replace(
    /const\s+\[searchParams\]\s*=\s*useSearchParams\(\);/g,
    'const searchParams = useSearchParams();'
  );
  content = content.replace(/import\.meta\.env\.VITE_API_URL/g, '(process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com")');
  content = content.replace(/import\.meta\.env\.VITE_ADMIN_EMAIL/g, '(process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")');
  content = content.replace(/import\.meta\.env\.VITE_(\w+)/g, 'process.env.NEXT_PUBLIC_$1');
  content = content.replace(/import\.meta\.env\.(\w+)/g, 'process.env.$1');
  return content;
}

function wrapSuspense(content, originalName) {
  if (content.includes('<Suspense')) return content;
  const internalName = originalName + 'Content';
  content = content.replace(
    `export default function ${originalName}(`,
    `function ${internalName}(`
  );
  if (!content.includes('Suspense')) {
    content = content.replace(
      /import\s+\{([^}]+)\}\s+from\s+["']react["']/,
      (m, imports) => `import { ${imports.trim()}, Suspense } from "react"`
    );
  }
  content += `\n\nexport default function ${originalName}() {\n  return (\n    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>\n      <${internalName} />\n    </Suspense>\n  );\n}\n`;
  return content;
}

// SIMPLE AND RELIABLE: Find the first non-commented `import` line.
// If that first import is at line > 10, the file starts with comments — use full file.
// If the file has a gap > 200 lines between first real imports and a second cluster, 
// start from the second cluster.
// For these specific files, all real code starts around line 471.
function extractActiveBlock(srcContent) {
  const lines = srcContent.split('\n');
  
  // Find all non-commented import line indices
  const realImports = lines
    .map((l, i) => ({ i, t: l.trim() }))
    .filter(({ t }) => /^import\s/.test(t));
  
  if (realImports.length === 0) return srcContent;
  
  const firstReal = realImports[0].i;
  
  // If first real import is near start (within first 20 lines), no stripping needed
  if (firstReal < 20) return srcContent;
  
  // Otherwise, the file has a massive commented-out block at the top.
  // Start from the first real import line.
  let startLine = firstReal;
  // Walk back to include blank lines before the imports
  while (startLine > 0 && lines[startLine - 1].trim() === '') startLine--;
  
  return lines.slice(startLine).join('\n');
}

const problematicFiles = {
  'KeywordGapAnalysis.tsx': { dest: 'app/(dashboard)/seller/keyword-gap/page.tsx', name: 'KeywordGapAnalysis' },
  'PriceComparison.tsx': { dest: 'app/(dashboard)/explorer/competitor-prices/page.tsx', name: 'PriceComparison' },
  'ReviewComparison.tsx': { dest: 'app/(dashboard)/explorer/review-analytics/page.tsx', name: 'ReviewComparison' },
  'SellerProducts.tsx': { dest: 'app/(dashboard)/seller/products/page.tsx', name: 'SellerProducts' },
  'WhiteSpaceFinder.tsx': { dest: 'app/(dashboard)/explorer/white-space-finder/page.tsx', name: 'WhiteSpaceFinder' },
};

Object.entries(problematicFiles).forEach(([srcFile, { dest, name }]) => {
  let content = fs.readFileSync(`client/src/_pages/dashboard/${srcFile}`, 'utf8');
  
  const lines = content.split('\n');
  const realImports = lines.map((l, i) => /^import\s/.test(l.trim()) ? i : -1).filter(i => i >= 0);
  console.log(`${srcFile}: first real import at line ${realImports[0] + 1}, total imports: ${realImports.length}`);
  
  content = extractActiveBlock(content);
  content = applyTransforms(content);
  content = '"use client";\n\n' + content;
  content = wrapSuspense(content, name);
  
  // Verify the output starts correctly
  const outLines = content.split('\n');
  console.log(`  Output starts: ${outLines.slice(0, 4).map(l => l.slice(0, 60)).join(' | ')}`);
  
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
  console.log(`✅ Fixed: ${srcFile} -> ${dest}\n`);
});
