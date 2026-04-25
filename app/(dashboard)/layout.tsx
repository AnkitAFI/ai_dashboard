import DashboardClientLayout from "@/components/layout/dashboard-client-layout";

export const dynamic = "force-dynamic";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardClientLayout>
      {children}
    </DashboardClientLayout>
  );
}
