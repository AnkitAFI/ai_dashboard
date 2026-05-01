import DashboardClientLayout from "@/components/layout/dashboard-client-layout";
import { SelectedProductProvider } from "@/lib/selected-product-context";
export const dynamic = "force-dynamic";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SelectedProductProvider>
      <DashboardClientLayout>
        {children}
      </DashboardClientLayout>
    </SelectedProductProvider>
  );
}
