const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /@\/hooks\/useSubscriptionLimits/g, to: '@/hooks/use-subscription-limits' },
  { from: /@\/hooks\/useSubscriptionSync/g, to: '@/hooks/use-subscription-sync' },
  { from: /@\/hooks\/useAISummary/g, to: '@/hooks/use-ai-summary' },
  { from: /@\/hooks\/useChartInsight/g, to: '@/hooks/use-chart-insight' },
  { from: /@\/components\/dashboard\/SellerIdInput/g, to: '@/components/dashboard/seller-id-input' },
  { from: /@\/components\/dashboard\/SellerDashboardView/g, to: '@/components/dashboard/seller-dashboard-view' },
  { from: /@\/components\/dashboard\/FiltersContext/g, to: '@/components/dashboard/filters-context' },
  { from: /@\/components\/modals\/OnboardingModal/g, to: '@/components/modals/onboarding-modal' },
  { from: /@\/components\/payment\/PaymentModal/g, to: '@/components/payment/payment-modal' },
  { from: /@\/components\/layout\/Navbar/g, to: '@/components/layout/Navbar' }, // Keep case if file is Pascal
  { from: /@\/components\/layout\/Footer/g, to: '@/components/layout/Footer' }, // Keep case if file is Pascal
];

// Wait, I should check the case of Navbar and Footer in components/layout/
// Navbar.tsx and Footer.tsx are PascalCase in my copy command.
// Let's check.

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDirs = ['app', 'components', 'hooks', 'lib'];

targetDirs.forEach(targetDir => {
  const absoluteDir = path.resolve('c:/Users/AFI-01-Yatharth/Desktop/dash_2/ai_dashboard', targetDir);
  if (fs.existsSync(absoluteDir)) {
    walkDir(absoluteDir, (filePath) => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        replacements.forEach(r => {
          content = content.replace(r.from, r.to);
        });
        if (content !== originalContent) {
          console.log(`Updating imports in ${filePath}`);
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }
    });
  }
});
