const fs = require('fs');
const path = require('path');

// This script does a clean 1:1 port of ALL legacy dashboard pages.
// It reads directly from client/src/_pages/dashboard/ and writes clean
// Next.js compatible versions, stripping nothing except incompatible APIs.

const SOURCE_DIR = 'client/src/_pages/dashboard';
const DEST_DIR = 'app/(dashboard)';

const routeMap = {
  'AdminDashboard.tsx': 'admin-dashboard',
  'AiAdvisor.tsx': 'explorer/ai-advisor',
  'KeywordGapAnalysis.tsx': 'seller/keyword-gap',
  'OrderHistory.tsx': 'order-history',
  'PriceComparison.tsx': 'explorer/competitor-prices',
  'ProductTrackerHistory.tsx': 'product-tracker/history',
  'ProfitabilityOptimizer.tsx': 'explorer/profitability-optimizer',
  'ReviewComparison.tsx': 'explorer/review-analytics',
  'SellerProducts.tsx': 'seller/products',
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
  'sentiment-products.tsx': 'sentiment-analysis',
  'settings.tsx': 'settings',
  'subscription.tsx': 'subscription'
};

function portFile(filename) {
  if (!routeMap[filename]) return;

  let content = fs.readFileSync(path.join(SOURCE_DIR, filename), 'utf8');

  // Add "use client" at top
  content = '"use client";\n\n' + content;

  // useAuth import
  content = content.replace(
    /import\s*\{\s*useAuth\s*\}\s+from\s+["']@\/App["'];?/g,
    'import { useAuth } from "@/lib/auth-context";'
  );

  // All react-router-dom imports -> next/navigation
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+["']react-router-dom["'];?[\r\n]?/g,
    'import { useRouter, useSearchParams, usePathname } from "next/navigation";\n'
  );

  // const navigate = useNavigate()
  content = content.replace(/const navigate\s*=\s*useNavigate\(\);/g, 'const router = useRouter();');
  // navigate( -> router.push(
  content = content.replace(/\bnavigate\(/g, 'router.push(');

  // const location = useLocation()
  content = content.replace(/const location\s*=\s*useLocation\(\);/g, 'const pathname = usePathname();');
  content = content.replace(/\blocation\.pathname\b/g, 'pathname');

  // const [searchParams] = useSearchParams() -> const searchParams = useSearchParams()
  content = content.replace(
    /const\s+\[searchParams\]\s*=\s*useSearchParams\(\);/g,
    'const searchParams = useSearchParams();'
  );

  // Vite env -> Next.js env
  content = content.replace(/import\.meta\.env\.VITE_API_URL/g, '(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")');
  content = content.replace(/import\.meta\.env\.VITE_ADMIN_EMAIL/g, '(process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")');
  content = content.replace(/import\.meta\.env\.VITE_(\w+)/g, 'process.env.NEXT_PUBLIC_$1');
  content = content.replace(/import\.meta\.env\.(\w+)/g, 'process.env.$1');

  // Fix Infinity icon name collision (lucide exports Infinity component)
  content = content.replace(
    /import\s+\{([^}]*),\s*Infinity\s*([^}]*)\}\s+from\s+["']lucide-react["']/,
    (m, before, after) => `import {${before}, Infinity as InfinityIcon${after}} from "lucide-react"`
  );
  content = content.replace(/<Infinity(\s|\/)/g, '<InfinityIcon$1');

  const destPath = path.join(DEST_DIR, routeMap[filename], 'page.tsx');
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content);
  console.log(`✅ ${filename} -> ${routeMap[filename]}/page.tsx`);
}

// Port all files fresh
Object.keys(routeMap).forEach(portFile);
console.log('\nDone! All pages ported cleanly.');
