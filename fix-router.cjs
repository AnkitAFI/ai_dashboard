const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'app/(dashboard)'), function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace react-router-dom imports
    content = content.replace(/import\s+\{([^}]*?)(useNavigate|useSearchParams|useLocation)([^}]*?)\}\s+from\s+["']react-router-dom["'];?/g, 'import { useRouter, useSearchParams, usePathname } from "next/navigation";');
    
    // Fix uses of useNavigate
    content = content.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();');
    
    // Fix router.push calls (but avoid replacing something like const navigate = ... again)
    // Be careful with navigate() vs navigate('')
    content = content.replace(/navigate\(/g, 'router.push(');
    
    // Fix useLocation
    content = content.replace(/const location = useLocation\(\);/g, 'const pathname = usePathname();');
    content = content.replace(/location\.pathname/g, 'pathname');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  }
});
