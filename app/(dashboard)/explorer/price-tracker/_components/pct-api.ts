// app/(dashboard)/explorer/price-tracker/_components/pct-api.ts
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

const PCT_BASE = `${API_BASE_URL}/api/pct`;

// Configure axios to always send cookies for session-based auth
axios.defaults.withCredentials = true;

export interface TrackerItem {
  id: number;
  sheet_name: string;
  our_asin: string;
  our_product: {
    title: string;
    photo: string | null;
    url: string;
    price: number | null;
    currency: string;
    is_prime: boolean;
    star_rating: number | null;
    num_ratings: number | null;
    last_fetched: string | null;
  };
  competitors_count: number;
  competitors: Array<{
    asin: string;
    title: string;
    photo: string | null;
    url: string;
    price: number | null;
    currency: string;
    is_prime: boolean;
    star_rating: number | null;
    num_ratings: number | null;
    diff_pct: number | null;
    alert_active: boolean;
  }>;
  cheapest_competitor: {
    asin: string | null;
    price: number | null;
    diff_pct: number | null;
  };
  country: string;
  alert_enabled: boolean;
  alert_threshold: number;
  alert_emails: string[];
  alert_competitor_asins?: string[];
  created_at: string;
  updated_at: string;
}

export interface QuotaData {
  tier: string;
  is_locked: boolean;
  credits_used: number;
  credits_limit: number;
  credits_remaining: number;
  alerts_used: number;
  alerts_limit: number;
  alerts_remaining: number;
  cycle_start: string | null;
  wallet_balance: number;
  packages: Record<string, { credits: number; price_inr: number; label: string }>;
}

export interface WalletData {
  balance: number;
  total_purchased: number;
  total_used: number;
  transactions: Array<{
    id: number;
    type: string;
    credits: number;
    description: string;
    amount_inr: number | null;
    status: string;
    created_at: string;
  }>;
}

function sanitizeError(err: any, fallback: string): Error {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") {
    const technicalKeywords = [
      "traceback", "sql", "postgres", "psycopg", "fastapi", "openpyxl",
      "rapidapi", "openwebninja", "404", "500", "502", "503", "internal server",
      "exception", "syntaxerror", "operationalerror", "object at", "table", "column"
    ];
    const isTech = technicalKeywords.some((w) => detail.toLowerCase().includes(w));
    if (!isTech && detail.length < 100) {
      return new Error(detail);
    }
  }
  return new Error(fallback);
}

export const pctApi = {
  getQuota: async (): Promise<QuotaData> => {
    try {
      const res = await axios.get<QuotaData>(`${PCT_BASE}/quota`);
      return res.data;
    } catch {
      // Safe fallback - prevents unhandled crash / error overlays
      return {
        tier: "premium",
        credits_limit: 10,
        credits_used: 0,
        credits_remaining: 10,
        alerts_limit: 10,
        alerts_used: 0,
        alerts_remaining: 10,
        wallet_balance: 0,
        is_locked: false,
        cycle_start: null,
        packages: {},
      };
    }
  },

  getTrackers: async (): Promise<TrackerItem[]> => {
    try {
      const res = await axios.get<TrackerItem[]>(`${PCT_BASE}/trackers`);
      return res.data || [];
    } catch {
      return [];
    }
  },

  getTrackerDetail: async (trackerId: number): Promise<any> => {
    try {
      const res = await axios.get(`${PCT_BASE}/trackers/${trackerId}`);
      return res.data;
    } catch (err: any) {
      throw sanitizeError(err, "Unable to load product details right now.");
    }
  },

  uploadSheet: async (formData: FormData): Promise<any> => {
    try {
      const res = await axios.post(`${PCT_BASE}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      throw sanitizeError(err, "Unable to process upload. Please check your file format and try again.");
    }
  },

  refreshTracker: async (trackerId: number): Promise<any> => {
    try {
      const res = await axios.post(`${PCT_BASE}/trackers/${trackerId}/refresh`);
      return res.data;
    } catch (err: any) {
      throw sanitizeError(err, "Prices are currently updating. Please check back shortly.");
    }
  },

  deleteTracker: async (trackerId: number): Promise<any> => {
    try {
      const res = await axios.delete(`${PCT_BASE}/trackers/${trackerId}`);
      return res.data;
    } catch (err: any) {
      throw sanitizeError(err, "Unable to remove tracker right now.");
    }
  },

  updateAlert: async (
    trackerId: number,
    payload: {
      alert_enabled?: boolean;
      alert_threshold?: number;
      alert_emails?: string[];
      alert_competitor_asins?: string[];
    }
  ): Promise<any> => {
    try {
      const res = await axios.patch(`${PCT_BASE}/trackers/${trackerId}/alert`, payload);
      return res.data;
    } catch (err: any) {
      throw sanitizeError(err, "Unable to update alert preferences right now.");
    }
  },

  getWallet: async (): Promise<WalletData> => {
    try {
      const res = await axios.get<WalletData>(`${PCT_BASE}/wallet`);
      return res.data;
    } catch (err: any) {
      return {
        balance: 0,
        total_purchased: 0,
        total_used: 0,
        transactions: [],
      };
    }
  },

  createWalletOrder: async (
    arg: string | number | { package_id?: string; credits?: number }
  ): Promise<any> => {
    try {
      let payload: { package_id?: string; credits?: number } = {};
      if (typeof arg === "number") {
        payload = { credits: arg };
      } else if (typeof arg === "string") {
        payload = { package_id: arg };
      } else {
        payload = arg;
      }
      const res = await axios.post(`${PCT_BASE}/wallet/create-order`, payload);
      return res.data;
    } catch (err: any) {
      throw sanitizeError(err, "Unable to initiate payment. Please try again.");
    }
  },

  verifyWalletOrder: async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<any> => {
    try {
      const res = await axios.post(`${PCT_BASE}/wallet/verify`, payload);
      return res.data;
    } catch (err: any) {
      throw sanitizeError(err, "Payment is being processed. Your balance will update shortly.");
    }
  },

  getPriceHistory: async (asin: string, country = "IN"): Promise<any> => {
    try {
      const res = await axios.get(`${PCT_BASE}/history/${asin}`, { params: { country } });
      return res.data || [];
    } catch {
      return [];
    }
  },
};
