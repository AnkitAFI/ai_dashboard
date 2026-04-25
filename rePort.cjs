const fs = require('fs');

// Re-port a single file cleanly (no commented-out duplicate blocks)
function portClean(srcPath, destPath) {
  let content = fs.readFileSync(srcPath, 'utf8');

  // Remove any existing "use client" to avoid duplication
  content = content.replace(/^["']use client["'];\s*/m, '');

  // Prepend directive
  content = '"use client";\n\n' + content;

  // useAuth import
  content = content.replace(
    /import\s*\{\s*useAuth\s*\}\s+from\s+["']@\/App["'];?/g,
    'import { useAuth } from "@/lib/auth-context";'
  );

  // react-router-dom -> next/navigation
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+["']react-router-dom["'];?/g,
    'import { useRouter, useSearchParams, usePathname } from "next/navigation";'
  );

  // const navigate = useNavigate()
  content = content.replace(
    /const navigate\s*=\s*useNavigate\(\);/g,
    'const router = useRouter();'
  );

  // navigate( -> router.push(
  content = content.replace(/navigate\(/g, 'router.push(');

  // const location = useLocation()
  content = content.replace(
    /const location\s*=\s*useLocation\(\);/g,
    'const pathname = usePathname();'
  );
  content = content.replace(/location\.pathname/g, 'pathname');

  // const [searchParams] = useSearchParams()
  content = content.replace(
    /const\s+\[searchParams\]\s*=\s*useSearchParams\(\);/g,
    'const searchParams = useSearchParams();'
  );

  // Vite env
  content = content.replace(/import\.meta\.env\.VITE_API_URL/g, 'process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"');
  content = content.replace(/import\.meta\.env\.VITE_(\w+)/g, 'process.env.NEXT_PUBLIC_$1');
  content = content.replace(/import\.meta\.env\.(\w+)/g, 'process.env.$1');

  fs.mkdirSync(require('path').dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content);
  console.log('Ported:', destPath);
}

// Re-port the keyword-gap page cleanly
portClean(
  'client/src/_pages/dashboard/KeywordGapAnalysis.tsx',
  'app/(dashboard)/seller/keyword-gap/page.tsx'
);
