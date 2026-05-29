import DashboardClientLayout from "@/components/layout/dashboard-client-layout";
import { SelectedProductProvider } from "@/lib/selected-product-context";
import BehaviorTracker from "@/components/BehaviorTracker";
export const dynamic = "force-dynamic";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SelectedProductProvider>
      <BehaviorTracker />
      <DashboardClientLayout>
        {children}
      </DashboardClientLayout>
    </SelectedProductProvider>
  );
}

