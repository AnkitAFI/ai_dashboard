const fs = require('fs');
const path = require('path');

// Pages that call useSearchParams() at the component level need to be
// wrapped in a <Suspense> boundary to avoid Next.js prerender failures.
// Strategy: rename the default export to <PageContent />, then export
// a new default that wraps it in <Suspense>.

const pages = [
  'app/(dashboard)/explorer/competitor-prices/page.tsx',
  'app/(dashboard)/explorer/review-analytics/page.tsx',
  'app/(dashboard)/explorer/white-space-finder/page.tsx',
  'app/(dashboard)/seller/keyword-gap/page.tsx',
  'app/(dashboard)/seller/price-comparison/page.tsx',
  'app/(dashboard)/seller/products/page.tsx',
  'app/(dashboard)/seller/review-comparison/page.tsx',
  'app/(dashboard)/sentiment-analysis/[source]/[sentiment]/page.tsx',
  'app/(dashboard)/keyword-intelligence/page.tsx',
];

pages.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Already wrapped? Skip.
  if (content.includes('SuspenseWrapper') || content.includes('<Suspense>')) {
    console.log('Already wrapped:', filePath);
    return;
  }

  // Find the last `export default function <Name>` or `export default function(`
  const match = content.match(/export default function (\w+)\s*\(/);
  if (!match) {
    console.log('No default export found in:', filePath);
    return;
  }

  const originalName = match[1];
  const internalName = originalName + 'Content';

  // Rename the export to internal
  content = content.replace(
    `export default function ${originalName}(`,
    `function ${internalName}(`
  );

  // Add React import if not present
  if (!content.includes("import React") && !content.includes("from 'react'") && !content.includes('from "react"')) {
    content = content.replace('"use client";\n\n', '"use client";\n\nimport React, { Suspense } from "react";\n');
  } else {
    // Add Suspense to existing react import if missing
    if (!content.includes('Suspense')) {
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+["']react["']/,
        (m, imports) => `import { ${imports.trim()}, Suspense } from "react"`
      );
    }
  }

  // Append the Suspense wrapper
  content += `\n\nexport default function ${originalName}() {\n  return (\n    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" /></div>}>\n      <${internalName} />\n    </Suspense>\n  );\n}\n`;

  fs.writeFileSync(filePath, content);
  console.log(`✅ Wrapped ${originalName} in Suspense: ${filePath}`);
});
