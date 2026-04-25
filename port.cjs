const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 'client/src/_pages/dashboard');
const DEST_DIR = path.join(__dirname, 'app/(dashboard)');

// Map legacy filenames to Next.js route paths
const routeMap = {
  'AdminDashboard.tsx': 'admin-dashboard',
  'AiAdvisor.tsx': 'explorer/ai-advisor',
  'KeywordGapAnalysis.tsx': 'seller/keyword-gap', // Assuming keyword gap is here
  'OrderHistory.tsx': 'order-history',
  'PriceComparison.tsx': 'explorer/competitor-prices', // Wait, or seller/price-comparison?
  'ProductTrackerHistory.tsx': 'product-tracker/history',
  'ProfitabilityOptimizer.tsx': 'explorer/profitability-optimizer',
  'ReviewComparison.tsx': 'explorer/review-analytics',
  'SellerProducts.tsx': 'seller/products', // Will map later if wrong
  'ShareOfVoice.tsx': 'share-of-voice',
  'WhiteSpaceFinder.tsx': 'explorer/white-space-finder',
  'categories.tsx': 'categories',
  'category-products.tsx': 'category-products/[source]/[category]',
  'dashboard.tsx': 'dashboard',
  'keyword-intelligence.tsx': 'keyword-intelligence',
  'keyword-tracker.tsx': 'keyword-tracker',
  'overview.tsx': 'overview',
  'product-details.tsx': 'product/[name]',
  'product-tracker.tsx': 'product-tracker',
  'sales.tsx': 'sales',
  'sentiment-products.tsx': 'sentiment-analysis', // Needs exact param structure later
  'settings.tsx': 'settings',
  'subscription.tsx': 'subscription'
};

function processFile(filename) {
  if (!routeMap[filename]) {
    console.log(`Skipping ${filename} - no route mapped`);
    return;
  }
  
  const sourcePath = path.join(SOURCE_DIR, filename);
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  // 1. Prepend "use client";
  if (!content.startsWith('"use client"')) {
    content = '"use client";\n\n' + content;
  }
  
  // 2. Fix useAuth import
  content = content.replace(/import\s+\{\s*useAuth\s*\}\s+from\s+["']@\/App["'];?/g, 'import { useAuth } from "@/lib/auth-context";');
  
  // 3. Fix Link imports (from react-router-dom)
  if (content.includes('from "react-router-dom"')) {
    content = content.replace(/import\s+\{([^}]*Link[^}]*)\}\s+from\s+["']react-router-dom["'];?/g, (match, group) => {
       return `import Link from "next/link";\nimport { ${group.replace(/Link,?/g, '')} } from "react-router-dom";`;
    });
  }
  
  // 4. Any other fixes?
  
  const destRoute = path.join(DEST_DIR, routeMap[filename], 'page.tsx');
  fs.mkdirSync(path.dirname(destRoute), { recursive: true });
  fs.writeFileSync(destRoute, content);
  console.log(`✅ Ported ${filename} -> ${routeMap[filename]}/page.tsx`);
}

Object.keys(routeMap).forEach(processFile);
