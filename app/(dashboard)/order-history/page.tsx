"use client";

import { useState, useEffect } from "react";
import { sanitizeApiError } from "@/lib/sanitize-error";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
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
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const API_BASE = API_BASE_URL;

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
  free: "bg-slate-100 text-slate-600",
  basic: "bg-sky-100 text-sky-700",
  premium: "bg-amber-100 text-amber-700",
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-sky-50 border border-sky-100 flex items-center justify-center">
        <Receipt className="h-9 w-9 text-sky-300" />
      </div>
      <div>
        <p className="text-slate-700 font-bold text-lg">{t('orderHistory.noOrders', 'No orders yet')}</p>
        <p className="text-slate-400 text-sm mt-1">{t('orderHistory.noOrdersDesc', 'Your payment history will appear here once you subscribe to a plan.')}</p>
      </div>
      <Button
        onClick={() => (window.location.href = "/subscription")}
        className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-6 font-bold"
      >
        {t('orderHistory.viewPlans', 'View Plans')}
      </Button>
    </div>
  );
}

// ─── Order Detail Modal

function OrderDetailModal({
  order,
  onClose,
  isDark,
}: {
  order: PaymentOrder;
  onClose: () => void;
  isDark?: boolean;
}) {
  const { t } = useTranslation();
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-none z-[100] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('orderHistory.invoice', 'Invoice')}</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-150">
              {order.invoice_number ?? `#ORD-${order.id}`}
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Status badge */}
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border",
          order.status === "paid" ? "bg-emerald-100 border-emerald-250 text-emerald-700 dark:bg-emerald-950/35 dark:border-emerald-900/60 dark:text-emerald-400" :
          order.status === "pending" ? "bg-amber-100 border-amber-250 text-amber-700 dark:bg-amber-950/35 dark:border-amber-900/60 dark:text-amber-400" :
          order.status === "failed" ? "bg-rose-100 border-rose-250 text-rose-700 dark:bg-rose-950/35 dark:border-rose-900/60 dark:text-rose-400" :
          "bg-sky-100 border-sky-250 text-sky-700 dark:bg-sky-950/35 dark:border-sky-900/60 dark:text-sky-400"
        )}>
          {status.icon}
          {status.label}
        </div>

        {/* Plan */}
        <div className="bg-slate-50 dark:bg-slate-950/45 rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-slate-850">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t('orderHistory.plan', 'Plan')}</span>
            <span className={cn(
              "font-bold capitalize px-2 py-0.5 rounded-full text-xs",
              order.plan_id === "premium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
              order.plan_id === "basic" ? "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400" :
              "bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-350"
            )}>
              {order.plan_id}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t('orderHistory.baseAmount', 'Base Amount')}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatAmount(order.base_amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">GST (18%)</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatAmount(order.gst_amount)}</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-850 pt-3 flex justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-350">{t('orderHistory.totalPaid', 'Total Paid')}</span>
            <span className="font-extrabold text-sky-750 dark:text-sky-400 text-lg">{formatAmount(order.amount)}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-2.5 text-sm">
          {order.razorpay_payment_id && (
            <div className="flex justify-between">
              <span className="text-slate-450 dark:text-slate-400 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> {t('orderHistory.paymentId', 'Payment ID')}</span>
              <span className="font-mono text-xs text-slate-650 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{order.razorpay_payment_id}</span>
            </div>
          )}
          {order.gst_number && (
            <div className="flex justify-between">
              <span className="text-slate-450 dark:text-slate-400 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> GSTIN</span>
              <span className="font-mono text-xs text-slate-650 dark:text-slate-355">{order.gst_number}</span>
            </div>
          )}
          <div className="flex justify-between">
              <span className="text-slate-450 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {t('orderHistory.orderDate', 'Order Date')}</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{formatDate(order.created_at)}</span>
          </div>
          {order.paid_at && (
            <div className="flex justify-between">
              <span className="text-slate-450 dark:text-slate-400 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> {t('orderHistory.paidOn', 'Paid On')}</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{formatDate(order.paid_at)}</span>
            </div>
          )}
          {order.expires_at && (
            <div className="flex justify-between">
              <span className="text-slate-450 dark:text-slate-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {t('orderHistory.expires', 'Expires')}</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{formatDate(order.expires_at)}</span>
            </div>
          )}
        </div>

        {order.status === "paid" ? (
          <Button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 font-bold flex items-center gap-2 border-none"
            onClick={() =>
              window.open(`${API_BASE}/api/payments/invoice/${order.id}`, "_blank")
            }
          >
            <Download className="h-4 w-4" />
            {t('orderHistory.downloadInvoice', 'Download Invoice')}
          </Button>
        ) : (
          <Button
            className="w-full rounded-xl h-11 font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            variant="outline"
            onClick={onClose}
          >
            {t('orderHistory.close', 'Close')}
          </Button>
        )}
      </div>
    </div>
  );
}

// MAIN PAGE

export default function OrderHistory() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);

  // ── Fetch orders

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
        throw new Error(sanitizeApiError(d.detail, "Billing details unavailable. Please refresh."));
      }
      const data: PaymentOrder[] = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? sanitizeApiError(err.message, "Couldn't load order history. Please refresh.") : "Couldn't load order history. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  // ── Auth guards

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-sky-100 border-t-sky-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">{t('orderHistory.loadingHistory', 'Loading order history...')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle>{t('orderHistory.authRequired', 'Authentication Required')}</CardTitle>
            <CardDescription>{t('orderHistory.loginToView', 'Please login to view your order history')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/login")}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 font-bold">
              {t('orderHistory.goToLogin', 'Go to Login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Stats

  const totalPaid = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount, 0);
  const paidCount = orders.filter((o) => o.status === "paid").length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  // ── Render

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full text-slate-900 dark:text-slate-100">
      {/* Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} isDark={isDark} />
      )}

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-sky-100/80 dark:border-slate-850">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950/40 dark:to-cyan-950/40 rounded-2xl flex items-center justify-center shadow-inner">
            <Receipt className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              {t('orderHistory.title', 'Order History')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {t('orderHistory.subtitle', 'View your invoices, transaction receipts, and active subscriptions')} ({user.email}).
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
          className="items-center gap-2 rounded-xl border-sky-200 dark:border-slate-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-900"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {t('orderHistory.refresh', 'Refresh')}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900/40">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          <AlertDescription className="text-rose-700 dark:text-rose-455">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Row */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Total Spent",
              value: formatAmount(totalPaid),
              icon: <IndianRupee className="h-5 w-5 text-sky-500 dark:text-sky-400" />,
              bg: "bg-sky-50 dark:bg-sky-950/20 border border-sky-100/30 dark:border-sky-900/30",
            },
            {
              label: "Successful",
              value: paidCount,
              icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
              bg: "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/30",
            },
            {
              label: "Pending",
              value: pendingCount,
              icon: <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
              bg: "bg-amber-50 dark:bg-amber-950/20 border border-amber-100/30 dark:border-amber-900/30",
            },
          ].map((stat) => (
            <Card key={stat.label}
              className={`${stat.bg} border-0 shadow-sm rounded-2xl`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Orders Table Card */}
      <Card className="rounded-3xl shadow-sm border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-5">
          <CardTitle className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-sky-500 dark:text-sky-400" />
            {t('orderHistory.paymentRecords', 'Payment Records')}
          </CardTitle>
          <CardDescription className="text-slate-550 dark:text-slate-400">
            {loading ? t('orderHistory.fetchingOrders', 'Fetching your orders...') : `${orders.length} order${orders.length !== 1 ? "s" : ""} found`}
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
                              px-6 py-3 bg-slate-50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800
                              text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>{t('orderHistory.order', 'Order')}</span>
                <span>{t('orderHistory.plan', 'Plan')}</span>
                <span>{t('orderHistory.amount', 'Amount')}</span>
                <span>{t('orderHistory.date', 'Date')}</span>
                <span>{t('orderHistory.status', 'Status')}</span>
              </div>

              {orders.map((order) => {
                const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "w-full text-left flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto]",
                      "items-center gap-3 sm:gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800",
                      "last:border-0 hover:bg-sky-50/60 dark:hover:bg-slate-800/40 transition-colors group",
                      status.rowBg && "bg-amber-50/40 dark:bg-amber-950/10"
                    )}
                  >
                    {/* Order ID + Invoice */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Receipt className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                          {order.invoice_number ?? `#ORD-${order.id}`}
                        </p>
                        {order.razorpay_payment_id && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">
                            {order.razorpay_payment_id}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Plan */}
                    <div>
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize",
                        order.plan_id === "premium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                        order.plan_id === "basic" ? "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400" :
                        "bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-350"
                      )}>
                        {order.plan_id}
                      </span>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                        {formatAmount(order.amount)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        +{formatAmount(order.gst_amount)} GST
                      </p>
                    </div>

                    {/* Date */}
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(order.paid_at ?? order.created_at)}</p>
                      {order.expires_at && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Expires {formatDate(order.expires_at)}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                        order.status === "paid" ? "bg-emerald-100 border-emerald-250 text-emerald-700 dark:bg-emerald-950/35 dark:border-emerald-900/65 dark:text-emerald-450" :
                        order.status === "pending" ? "bg-amber-100 border-amber-250 text-amber-700 dark:bg-amber-950/35 dark:border-amber-900/65 dark:text-amber-450" :
                        order.status === "failed" ? "bg-rose-100 border-rose-250 text-rose-700 dark:bg-rose-950/35 dark:border-rose-900/65 dark:text-rose-450" :
                        "bg-sky-100 border-sky-250 text-sky-700 dark:bg-sky-950/35 dark:border-sky-900/65 dark:text-sky-455"
                      )}>
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
        <p className="text-center text-xs text-slate-400 dark:text-slate-550 pb-2">
          {t('orderHistory.showingOrders', 'Showing last {{count}} orders • Click any row to view full invoice details', { count: orders.length })}
        </p>
      )}
    </div>
  );
}
