"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, CreditCard, Building2, CheckCircle2, AlertCircle,
  Loader2, Receipt, ChevronRight, Shield, User, Mail,
  Phone, MapPin, FileText, Sparkles, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;      
  description: string;
  priceNote?: string;      
}

interface BillingForm {
  fullName: string;
  email: string;
  mobile: string;
  companyName: string;
  billingAddress: string;
  hasGst: boolean;
  gstNumber: string;
}

interface PriceBreakup {
  basePrice: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PaymentPlan;
  userId: number;
  userEmail?: string;
  userName?: string;
  onPaymentSuccess: (planId: string) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>; theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void; escape: boolean; animation: boolean };
}
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance { open: () => void; }

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const isValidGST = (g: string) => GST_REGEX.test(g.toUpperCase());

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.getElementById("rzp-sdk")) return resolve(true);
    const s = document.createElement("script");
    s.id = "rzp-sdk";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const STEPS = ["Billing Details", "Review & Pay", "Processing"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-center mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`
              w-9 h-9 rounded-full flex items-center justify-center
              text-sm font-bold transition-all duration-500
              ${i < current
                ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                : i === current
                  ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-lg shadow-sky-200"
                  : "bg-slate-100 text-slate-400 border border-slate-200"
              }
            `}>
              {i < current ? <CheckCircle2 className="h-4 w-4" /> : <span>{i + 1}</span>}
            </div>
            <span className={`
              text-[11px] mt-1.5 font-semibold text-center whitespace-nowrap
              ${i === current ? "text-sky-700" : i < current ? "text-sky-400" : "text-slate-400"}
            `}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`
              w-12 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500
              ${i < current ? "bg-sky-400" : "bg-slate-200"}
            `} />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label, required = false, icon, error, hint, children, span2 = false,
}: {
  label: string; required?: boolean; icon?: React.ReactNode;
  error?: string; hint?: string; children: React.ReactNode; span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </Label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {icon}
          </span>
        )}
        <div className={icon ? "[&_input]:pl-9 [&_textarea]:pl-9" : ""}>{children}</div>
      </div>
      {error && (
        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />{error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function PriceCard({
  breakup, hasGst, gstNumber, priceNote,
}: {
  breakup: PriceBreakup; hasGst: boolean; gstNumber: string; priceNote?: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-sky-100 shadow-sm">
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-3 flex items-center gap-2">
        <Receipt className="h-4 w-4 text-sky-200" />
        <span className="text-sm font-bold text-white tracking-wide">Price Breakdown</span>
      </div>
      <div className="bg-sky-50 divide-y divide-sky-100">

        {priceNote && (
          <div className="px-5 py-3">
            <p className="text-xs text-sky-700 leading-relaxed">{priceNote}</p>
          </div>
        )}

        <div className="flex justify-between items-center px-5 py-3">
          <span className="text-sm text-slate-600">Base Subscription</span>
          <span className="text-sm font-bold text-slate-800">
            ₹{breakup.basePrice.toLocaleString("en-IN")}
          </span>
        </div>

        {hasGst ? (
          <div className="px-5 py-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-600">GST @ {breakup.gstRate}%</p>
                <p className="text-[11px] text-sky-600 font-mono mt-0.5">
                  GSTIN: {gstNumber.toUpperCase()}
                </p>
              </div>
              <span className="text-sm font-bold text-amber-600">
                +₹{breakup.gstAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-2 ml-3 space-y-0.5 border-l-2 border-sky-300 pl-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>CGST @ {breakup.gstRate / 2}%</span>
                <span>₹{(breakup.gstAmount / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>SGST @ {breakup.gstRate / 2}%</span>
                <span>₹{(breakup.gstAmount / 2).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center px-5 py-3">
            <span className="text-sm text-slate-400 italic">No GST (GSTIN not provided)</span>
            <span className="text-sm text-slate-400">₹0</span>
          </div>
        )}

        <div className="flex justify-between items-center px-5 py-4 bg-white">
          <span className="text-base font-extrabold text-slate-900">Total Payable</span>
          <span className="text-2xl font-extrabold text-sky-700">
            ₹{breakup.total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentModal({
  isOpen, onClose, plan, userId, userEmail = "", userName = "", onPaymentSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  const mountedRef = useRef(true);
  const paymentHandledRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const [form, setForm] = useState<BillingForm>({
    fullName: userName, email: userEmail, mobile: "",
    companyName: "", billingAddress: "", hasGst: false, gstNumber: "",
  });
  const [errs, setErrs] = useState<Partial<Record<keyof BillingForm, string>>>({});
  const [breakup, setBreakup] = useState<PriceBreakup>({
    basePrice: plan.price, gstRate: 18, gstAmount: 0, total: plan.price,
  });

  useEffect(() => {
    if (isOpen) {
      setStep(0); setError(null); setDone(false); setInvoiceId(null); setErrs({});
      paymentHandledRef.current = false;
      setForm((p) => ({ ...p, fullName: userName || p.fullName, email: userEmail || p.email }));
      setBreakup({ basePrice: plan.price, gstRate: 18, gstAmount: 0, total: plan.price });
    }
  }, [isOpen, userName, userEmail, plan.price]);

  useEffect(() => {
    const gst = form.hasGst ? Math.round((plan.price * 18) / 100) : 0;
    setBreakup({ basePrice: plan.price, gstRate: 18, gstAmount: gst, total: plan.price + gst });
  }, [plan.price, form.hasGst]);

  const set = (k: keyof BillingForm, v: string | boolean) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof BillingForm, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile number.";
    if (!form.billingAddress.trim()) e.billingAddress = "Billing address is required.";
    if (form.hasGst && !form.gstNumber.trim()) e.gstNumber = "GSTIN is required when GST is selected.";
    if (form.hasGst && form.gstNumber && !isValidGST(form.gstNumber)) e.gstNumber = "Invalid GSTIN format. Example: 29ABCDE1234F1Z5";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const verify = useCallback(async (r: RazorpayResponse, dbId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/payments/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          razorpay_payment_id: r.razorpay_payment_id,
          razorpay_order_id: r.razorpay_order_id,
          razorpay_signature: r.razorpay_signature,
          order_db_id: dbId, user_id: userId, plan_id: plan.id,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Verification failed. Contact support.");
      }
      if (!mountedRef.current) return;
      setInvoiceId(dbId); setDone(true); onPaymentSuccess(plan.id);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Verification failed. Contact support.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [userId, plan.id, onPaymentSuccess]);

  const pay = async () => {
    if (!mountedRef.current) return;
    setLoading(true); setError(null);

    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) throw new Error("Failed to load Razorpay.");

      const res = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: userId, plan_id: plan.id, amount: breakup.total,
          billing: {
            full_name: form.fullName,
            email: form.email,
            mobile: form.mobile,
            company_name: form.companyName || null,
            billing_address: form.billingAddress,
            gst_number: form.hasGst ? form.gstNumber.toUpperCase() : null,
            gst_amount: breakup.gstAmount,
            base_amount: breakup.basePrice,
          },
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || "Failed to create payment order.");
      }

      const data = await res.json();

      if (data.already_active) {
        if (!mountedRef.current) return;
        setDone(true); onPaymentSuccess(plan.id); setLoading(false);
        return;
      }

      if (!mountedRef.current) return;
      setStep(2);
      paymentHandledRef.current = false;

      const rzp = new window.Razorpay({
        key: data.razorpay_key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Insydz Analytics",
        description: `${plan.name} Plan – Monthly`,
        order_id: data.razorpay_order_id,
        prefill: { name: form.fullName, email: form.email, contact: `+91${form.mobile}` },
        notes: {
          plan_id: plan.id,
          user_id: String(userId),
          gst_number: form.hasGst ? form.gstNumber.toUpperCase() : "",
        },
        theme: { color: "#0284c7" },
        handler: async (response) => {
          paymentHandledRef.current = true;
          await verify(response, data.order_db_id);
        },
        modal: {
          escape: false,
          animation: true,
          ondismiss: () => {
            if (!paymentHandledRef.current && mountedRef.current) {
              setLoading(false); setStep(1);
            }
          },
        },
      });

      rzp.open();

    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Payment failed.");
      setLoading(false); setStep(1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}>

      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0
                        border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700
                            flex items-center justify-center shadow-lg shadow-sky-200">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-600 uppercase tracking-widest">Checkout</p>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                {plan.name} Plan
                <span className="ml-2 text-sm font-semibold text-slate-400">
                  ₹{plan.price.toLocaleString("en-IN")}/mo
                </span>
              </h2>
            </div>
          </div>
          <button onClick={onClose} disabled={step === 2 && !done}
            className="w-9 h-9 rounded-xl flex items-center justify-center
                             text-slate-400 hover:text-slate-700 hover:bg-slate-100
                             transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {done ? (
            <div className="text-center py-4">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-green-50 border-2 border-green-200
                                flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Payment Successful! 🎉</h3>
              <p className="text-slate-500 mb-1">
                You're now on the <span className="font-bold text-sky-600">{plan.name}</span> plan.
              </p>
              <p className="text-sm text-slate-400 mb-8">
                Confirmation email sent to <strong className="text-slate-600">{form.email}</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {invoiceId && (
                  <a href={`${API_BASE}/api/payments/invoice/${invoiceId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5
                                rounded-xl border-2 border-sky-200 text-sky-700 hover:bg-sky-50
                                transition-colors text-sm font-semibold">
                    <FileText className="h-4 w-4" />
                    Download Invoice PDF
                  </a>
                )}
                <Button onClick={onClose}
                  className="bg-gradient-to-r from-sky-600 to-blue-700
                                   hover:from-sky-700 hover:to-blue-800
                                   text-white px-8 rounded-xl font-bold shadow-md shadow-sky-200">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <>
              <StepIndicator current={step} />

              {error && (
                <Alert variant="destructive" className="mb-5 rounded-xl border-rose-200 bg-rose-50">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <AlertDescription className="text-rose-700 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {step === 0 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" required icon={<User className="h-4 w-4" />} error={errs.fullName} span2>
                      <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="John Doe" />
                    </Field>
                    <Field label="Email" required icon={<Mail className="h-4 w-4" />} error={errs.email}>
                      <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@company.com" />
                    </Field>
                    <Field label="Mobile Number" required icon={<Phone className="h-4 w-4" />} error={errs.mobile}>
                      <Input type="tel" value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, ""))} placeholder="9876543210" maxLength={10} />
                    </Field>
                    <Field label="Company Name" icon={<Building2 className="h-4 w-4" />}>
                      <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Pvt. Ltd." />
                    </Field>
                    <Field label="Billing Address" required icon={<MapPin className="h-4 w-4" />} error={errs.billingAddress} span2>
                      <Textarea value={form.billingAddress} onChange={(e) => set("billingAddress", e.target.value)} placeholder="123, MG Road..." rows={3} />
                    </Field>
                  </div>

                  <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${form.hasGst ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-start gap-3">
                      <Checkbox id="gst" checked={form.hasGst} onCheckedChange={(c) => set("hasGst", !!c)} />
                      <label htmlFor="gst" className="cursor-pointer">
                        <p className="text-sm font-semibold text-slate-700">I have a GST Number</p>
                        <p className="text-xs text-slate-400">Add your GSTIN to claim ITC</p>
                      </label>
                    </div>
                    {form.hasGst && (
                      <div className="mt-4 space-y-1.5">
                        <Input value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" maxLength={15} />
                        {errs.gstNumber && <p className="text-xs text-rose-500">{errs.gstNumber}</p>}
                      </div>
                    )}
                  </div>

                  <Button onClick={() => { if (validate()) setStep(1); }} className="w-full h-12 rounded-xl font-bold bg-sky-600 text-white">
                    Continue to Review <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 p-5 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-bold uppercase opacity-80">Selected Plan</p>
                      <p className="text-2xl font-extrabold">{plan.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold">₹{breakup.total.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <PriceCard breakup={breakup} hasGst={form.hasGst} gstNumber={form.gstNumber} priceNote={plan.priceNote} />

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)} disabled={loading} className="flex-1">Edit</Button>
                    <Button onClick={pay} disabled={loading} className="flex-[2] h-12 rounded-xl font-bold bg-sky-600 text-white shadow-lg">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" />Pay ₹{breakup.total.toLocaleString("en-IN")}</>}
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-10 space-y-5">
                  <Loader2 className="h-12 w-12 text-sky-600 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-lg font-extrabold">Razorpay is open</h3>
                    <p className="text-sm text-slate-500">Complete payment in the Razorpay window.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
