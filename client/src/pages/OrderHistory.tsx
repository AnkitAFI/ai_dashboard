import { useState, useEffect } from "react";
import { useAuth } from "@/App";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Menu,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  CreditCard,
  Calendar,
  IndianRupee,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "https://api.insydz.com";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentOrder {
  id: number;
  plan_id: string;
  amount: number;
  base_amount: number;
  gst_amount: number;
  gst_number: string | null;
  status: string;
  invoice_number: string | null;
  razorpay_payment_id: string | null;
  expires_at: string | null;
  created_at: string;
  paid_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; badgeClass: string; rowBg: string }
> = {
  paid: {
    label: "Paid",
    icon: <CheckCircle2 className="h-4 w-4" />,
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rowBg: "",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="h-4 w-4" />,
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    rowBg: "bg-amber-50/40",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="h-4 w-4" />,
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    rowBg: "bg-rose-50/40",
  },
  refunded: {
    label: "Refunded",
    icon: <RefreshCw className="h-4 w-4" />,
    badgeClass: "bg-sky-100 text-sky-700 border-sky-200",
    rowBg: "bg-sky-50/40",
  },
};

const PLAN_BADGE: Record<string, string> = {
  free:       "bg-slate-100 text-slate-600",
  basic:      "bg-sky-100 text-sky-700",
  premium:    "bg-amber-100 text-amber-700",
  enterprise: "bg-indigo-100 text-indigo-700",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-5 border-b border-slate-100 last:border-0 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-1/4" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-16" />
      <div className="h-6 bg-slate-200 rounded-full w-16" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center">
        <Receipt className="h-9 w-9 text-sky-300" />
      </div>
      <div>
        <p className="text-slate-700 font-bold text-lg">No orders yet</p>
        <p className="text-slate-400 text-sm mt-1">Your payment history will appear here once you subscribe to a plan.</p>
      </div>
      <Button
        onClick={() => (window.location.href = "/subscription")}
        className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-6 font-bold"
      >
        View Plans
      </Button>
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
}: {
  order: PaymentOrder;
  onClose: () => void;
}) {
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5"
           onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Invoice</p>
            <p className="text-xl font-extrabold text-slate-900">
              {order.invoice_number ?? `#ORD-${order.id}`}
            </p>
          </div>
          <button onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Status badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${status.badgeClass}`}>
          {status.icon}
          {status.label}
        </div>

        {/* Plan */}
        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Plan</span>
            <span className={`font-bold capitalize px-2 py-0.5 rounded-full text-xs ${PLAN_BADGE[order.plan_id] ?? "bg-slate-100 text-slate-600"}`}>
              {order.plan_id}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Base Amount</span>
            <span className="font-semibold text-slate-800">{formatAmount(order.base_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">GST (18%)</span>
            <span className="font-semibold text-slate-800">{formatAmount(order.gst_amount)}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between">
            <span className="font-bold text-slate-700">Total Paid</span>
            <span className="font-extrabold text-sky-700 text-lg">{formatAmount(order.amount)}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-2.5 text-sm">
          {order.razorpay_payment_id && (
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payment ID</span>
              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">{order.razorpay_payment_id}</span>
            </div>
          )}
          {order.gst_number && (
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> GSTIN</span>
              <span className="font-mono text-xs text-slate-600">{order.gst_number}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Order Date</span>
            <span className="text-slate-700 font-medium">{formatDate(order.created_at)}</span>
          </div>
          {order.paid_at && (
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Paid On</span>
              <span className="text-slate-700 font-medium">{formatDate(order.paid_at)}</span>
            </div>
          )}
          {order.expires_at && (
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Expires</span>
              <span className="text-slate-700 font-medium">{formatDate(order.expires_at)}</span>
            </div>
          )}
        </div>

        {order.status === "paid" ? (
          <Button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 font-bold flex items-center gap-2"
            onClick={() =>
              window.open(`${API_BASE}/api/payments/invoice/${order.id}`, "_blank")
            }
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </Button>
        ) : (
          <Button
            className="w-full rounded-xl h-11 font-bold"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function OrderHistory() {
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders]             = useState<PaymentOrder[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);

  // ── Fetch orders ──────────────────────────────────────────────────────────

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/payments/history/${user.id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to load order history.");
      }
      const data: PaymentOrder[] = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  // ── Auth guards ───────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading order history...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view your order history</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/login")}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 font-bold">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalPaid    = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount, 0);
  const paidCount    = orders.filter((o) => o.status === "paid").length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">

      {/* Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"
               onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <Sidebar />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
        <Sidebar />
      </aside>

      {/* Main */}
      <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">

        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg
                           rounded-none sm:rounded-2xl px-4 sm:px-6 lg:px-12 py-4 sm:py-6
                           mb-6 flex items-center justify-between sticky top-0 sm:top-4
                           z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors">
              <Menu className="h-5 w-5 text-sky-900" />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-900 tracking-tight">
                Order History
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                All your past payments and invoices
                <span className="mx-1.5 text-slate-300">•</span>
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            className="hidden sm:flex items-center gap-2 rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        <main className="px-4 sm:px-6 flex-1 overflow-y-auto pb-10 space-y-6 max-w-4xl mx-auto w-full">

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <AlertDescription className="text-rose-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Row */}
          {!loading && orders.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Total Spent",
                  value: formatAmount(totalPaid),
                  icon: <IndianRupee className="h-5 w-5 text-sky-500" />,
                  bg: "bg-sky-50",
                },
                {
                  label: "Successful",
                  value: paidCount,
                  icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
                  bg: "bg-emerald-50",
                },
                {
                  label: "Pending",
                  value: pendingCount,
                  icon: <Clock className="h-5 w-5 text-amber-500" />,
                  bg: "bg-amber-50",
                },
              ].map((stat) => (
                <Card key={stat.label}
                      className={`${stat.bg} border-0 shadow-sm rounded-2xl`}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                      <p className="text-base font-extrabold text-slate-800">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Orders Table Card */}
          <Card className="rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-sky-500" />
                Payment Records
              </CardTitle>
              <CardDescription>
                {loading ? "Fetching your orders..." : `${orders.length} order${orders.length !== 1 ? "s" : ""} found`}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div>
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
              ) : orders.length === 0 ? (
                <EmptyState />
              ) : (
                <div>
                  {/* Table header — hidden on mobile */}
                  <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4
                                  px-6 py-3 bg-slate-50 border-b border-slate-100
                                  text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Order</span>
                    <span>Plan</span>
                    <span>Amount</span>
                    <span>Date</span>
                    <span>Status</span>
                  </div>

                  {orders.map((order) => {
                    const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`w-full text-left flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto]
                                    items-center gap-3 sm:gap-4 px-6 py-4 border-b border-slate-100
                                    last:border-0 hover:bg-sky-50/60 transition-colors group
                                    ${status.rowBg}`}
                      >
                        {/* Order ID + Invoice */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                            <Receipt className="h-4 w-4 text-sky-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">
                              {order.invoice_number ?? `#ORD-${order.id}`}
                            </p>
                            {order.razorpay_payment_id && (
                              <p className="text-xs text-slate-400 font-mono truncate">
                                {order.razorpay_payment_id}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Plan */}
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                                            ${PLAN_BADGE[order.plan_id] ?? "bg-slate-100 text-slate-600"}`}>
                            {order.plan_id}
                          </span>
                        </div>

                        {/* Amount */}
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">
                            {formatAmount(order.amount)}
                          </p>
                          <p className="text-xs text-slate-400">
                            +{formatAmount(order.gst_amount)} GST
                          </p>
                        </div>

                        {/* Date */}
                        <div className="hidden sm:block">
                          <p className="text-sm font-medium text-slate-700">{formatDate(order.paid_at ?? order.created_at)}</p>
                          {order.expires_at && (
                            <p className="text-xs text-slate-400">
                              Expires {formatDate(order.expires_at)}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                            text-xs font-bold border ${status.badgeClass}`}>
                            {status.icon}
                            <span className="hidden sm:inline">{status.label}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer note */}
          {!loading && orders.length > 0 && (
            <p className="text-center text-xs text-slate-400 pb-2">
              Showing last {orders.length} orders • Click any row to view full invoice details
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
