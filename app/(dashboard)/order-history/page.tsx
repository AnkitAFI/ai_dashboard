"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
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
import { Skeleton } from "@/components/ui/skeleton";

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

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/payments/history/${user.id}`, {
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

  if (!user) return null;

  const totalPaid = orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.amount, 0);
  const paidCount = orders.filter((o) => o.status === "paid").length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
          <p className="text-sm text-slate-500 font-medium">All your past payments and invoices in one place</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchOrders}
          disabled={loading}
          className="rounded-xl border-sky-100 text-sky-700 hover:bg-sky-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh History
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/50">
          <AlertCircle className="h-4 w-4 text-rose-500" />
          <AlertDescription className="text-rose-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              label: "Total Spent",
              value: formatAmount(totalPaid),
              icon: <IndianRupee className="h-5 w-5 text-sky-600" />,
              bg: "bg-sky-50",
            },
            {
              label: "Successful",
              value: paidCount,
              icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
              bg: "bg-emerald-50",
            },
            {
              label: "Pending",
              value: pendingCount,
              icon: <Clock className="h-5 w-5 text-amber-600" />,
              bg: "bg-amber-50",
            },
          ].map((stat) => (
            <Card key={stat.label} className={`${stat.bg} border-none shadow-md rounded-3xl overflow-hidden`}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Orders List */}
      <Card className="rounded-[2.5rem] shadow-xl border-none bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 px-8 py-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-sky-500" />
              Recent Transactions
            </CardTitle>
            {!loading && <Badge variant="secondary" className="rounded-full">{orders.length} Records</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                <Receipt className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No orders found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">You haven't made any purchases yet. Your history will appear here once you subscribe.</p>
              <Button className="mt-8 bg-sky-600 hover:bg-sky-700 rounded-xl px-8" asChild>
                <a href="/subscription">View Plans</a>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-4">Transaction</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => {
                    const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                    return (
                      <tr key={order.id} className="group hover:bg-sky-50/30 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                              <Receipt className="h-4 w-4 text-sky-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-sm truncate">
                                {order.invoice_number ?? `#ORD-${order.id}`}
                              </p>
                              {order.razorpay_payment_id && (
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate uppercase">
                                  {order.razorpay_payment_id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                            ${PLAN_BADGE[order.plan_id] ?? "bg-slate-100 text-slate-600"}`}>
                            {order.plan_id}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="font-black text-slate-900 text-sm">{formatAmount(order.amount)}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Incl. {formatAmount(order.gst_amount)} GST</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-slate-700">{formatDate(order.paid_at ?? order.created_at)}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border tracking-wider ${status.badgeClass}`}>
                            {status.icon}
                            {status.label.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal / Dialog for Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <Card className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border-none animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 text-[10px] font-black tracking-widest uppercase py-1">Invoice Details</Badge>
                  <h3 className="text-2xl font-black text-slate-900">{selectedOrder.invoice_number ?? `#ORD-${selectedOrder.id}`}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400"><RefreshCw className="w-5 h-5 rotate-45" /></button>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Plan Type</span>
                  <span className={`font-black uppercase tracking-wider px-3 py-1 rounded-full text-[10px] ${PLAN_BADGE[selectedOrder.plan_id]}`}>{selectedOrder.plan_id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Base Amount</span>
                  <span className="font-bold text-slate-800">{formatAmount(selectedOrder.base_amount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">GST (18%)</span>
                  <span className="font-bold text-slate-800">{formatAmount(selectedOrder.gst_amount)}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-black text-slate-900">Total Paid</span>
                  <span className="text-2xl font-black text-sky-600">{formatAmount(selectedOrder.amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/50 rounded-2xl p-3">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Payment ID</p>
                  <p className="font-mono text-slate-800 truncate">{selectedOrder.razorpay_payment_id || "N/A"}</p>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-3">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1">Order Date</p>
                  <p className="text-slate-800 font-bold">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-sky-600 hover:bg-sky-700 rounded-2xl h-12 font-bold shadow-lg shadow-sky-100" onClick={() => window.open(`${BASE_URL}/api/payments/invoice/${selectedOrder.id}`, "_blank")}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold border-slate-100" onClick={() => setSelectedOrder(null)}>Close</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
