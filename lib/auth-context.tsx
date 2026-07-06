// "use client";

// import { createContext, useContext, useState, useEffect } from "react";

// // ── Environment ────────────────────────────────────────────────────────────────
// const API_BASE_URL =
//   API_BASE_URL;

// // ── User Interface (identical to App.tsx) ──────────────────────────────────────
// export interface User {
//   id: number;
//   email: string;
//   name?: string;
//   firstName?: string;
//   lastName?: string;
//   businessName?: string;
//   location?: string;
//   subscriptionTier: string;
//   aiChatUsed?: number;
//   aiChatMonth?: string;
//   businessInterests?: string[];
//   createdAt?: string;
//   onboardingCompleted: boolean;
//   onboarding_marketplace: string | null;
//   onboarding_details: string | null;
//   onboardingGoal?: string | null;
//   seller_id: string | null;
//   sellerId?: string | null;
// }

// // ── Context Type (identical to App.tsx) ───────────────────────────────────────
// export interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   refreshUser: () => Promise<void>;
//   logout: () => Promise<void>;
// }

// // ── Context ───────────────────────────────────────────────────────────────────
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // ── Hook ──────────────────────────────────────────────────────────────────────
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within an AuthProvider");
//   return context;
// };

// // ── Provider ──────────────────────────────────────────────────────────────────
// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchCurrentUser = async () => {
//     // SSR safety — skip on server side
//     if (typeof window === "undefined") {
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
//         credentials: "include",
//         headers: {
//           Accept: "application/json",
//         },
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setUser({
//           id: data.id,
//           email: data.email,
//           name: `${data.first_name} ${data.last_name}`,
//           firstName: data.first_name,
//           lastName: data.last_name,
//           businessName: data.business_name,
//           location: data.location,
//           subscriptionTier: data.subscription_tier || "free",
//           aiChatUsed: data.ai_chat_used,
//           aiChatMonth: data.ai_chat_month,
//           businessInterests: data.business_interests,
//           createdAt: data.created_at,
//           onboardingCompleted: data.onboarding_completed,
//           onboarding_marketplace: data.onboarding_marketplace || null,
//           onboarding_details: data.onboarding_details || null,
//           onboardingGoal: data.onboarding_goal || null,
//           seller_id: data.seller_id || null,
//           sellerId: data.seller_id || null,
//         });
//       } else {
//         setUser(null);
//       }
//     } catch (err) {
//       console.error("Error fetching user session:", err);
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCurrentUser();
//   }, []);

//   const refreshUser = async () => {
//     setIsLoading(true);
//     await fetchCurrentUser();
//   };

//   const logout = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Logout failed");
//       }

//       setUser(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//       // Still clear user state even if backend call fails
//       setUser(null);
//       throw error;
//     }
//   };

//   const isAuthenticated = !!user;

//   return (
//     <AuthContext.Provider
//       value={{ user, isAuthenticated, isLoading, refreshUser, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }



"use client";
import { API_BASE_URL } from "@/lib/config";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";

// Configure axios to always send cookies for session-based auth
axios.defaults.withCredentials = true;

// ── Environment ────────────────────────────────────────────────────────────────

// ── User Interface ─────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  location?: string;
  mobileNumber?: string;          // ← Added
  subscriptionTier: string;
  subscriptionExpiresAt?: string | null;
  
  aiListingsGenerated?: number;
  aiListingsMonth?: string;
  aiCreditsBalance?: number;
  
  aiChatUsed?: number;
  aiChatMonth?: string;
  businessInterests?: string[];
  createdAt?: string;
  onboardingCompleted: boolean;
  onboarding_marketplace: string | null;
  onboarding_details: string | null;
  onboardingGoal?: string | null;
  seller_id: string | null;
  sellerId?: string | null;
  explorerTourCompleted?: boolean;
  sellerTourCompleted?: boolean;
  welcomeCardDismissed?: boolean;
}

// ── Context Type ───────────────────────────────────────────────────────────────
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const isPublicRoute = (path: string) => {
  return (
    path === "/" ||
    path === "/login" ||
    path === "/signup" ||
    path === "/pricing" ||
    path === "/privacy-policy" ||
    path === "/terms-service" ||
    path === "/verify-email" ||
    path.startsWith("/solutions") ||
    path.startsWith("/use-cases") ||
    path.startsWith("/features") ||
    path.startsWith("/free-tools") ||
    path.startsWith("/resources") ||
    path.startsWith("/compare") ||
    path.startsWith("/about") ||
    path.startsWith("/author")
  );
};

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const hasFetched = useRef(false);

  const fetchCurrentUser = async () => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.id,
          email: data.email,
          name: `${data.first_name} ${data.last_name}`,
          firstName: data.first_name,
          lastName: data.last_name,
          businessName: data.business_name,
          location: data.location,
          mobileNumber: data.mobile_number || "",   // ← Added
          subscriptionTier: data.subscription_tier || "free",
          subscriptionExpiresAt: data.subscription_expires_at || null,
          
          aiListingsGenerated: data.ai_listings_generated || 0,
          aiListingsMonth: data.ai_listings_month,
          aiCreditsBalance: data.ai_credits_balance || 0,
          
          aiChatUsed: data.ai_chat_used,
          aiChatMonth: data.ai_chat_month,
          businessInterests: data.business_interests,
          createdAt: data.created_at,
          onboardingCompleted: data.onboarding_completed,
          onboarding_marketplace: data.onboarding_marketplace || null,
          onboarding_details: data.onboarding_details || null,
          onboardingGoal: data.onboarding_goal || null,
          seller_id: data.seller_id || null,
          sellerId: data.seller_id || null,
          explorerTourCompleted: !!data.explorer_tour_completed,
          sellerTourCompleted: !!data.seller_tour_completed,
          welcomeCardDismissed: !!data.welcome_card_dismissed,
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("was_logged_in", "true");
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("was_logged_in");
        }
      }
    } catch (err) {
      console.error("Error fetching user session:", err);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("was_logged_in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;

    const hasSessionFlag = typeof window !== "undefined" && localStorage.getItem("was_logged_in") === "true";

    if (isPublicRoute(pathname) && !hasSessionFlag) {
      setIsLoading(false);
      return;
    }

    hasFetched.current = true;
    fetchCurrentUser();
  }, [pathname]);

  const refreshUser = async () => {
    setIsLoading(true);
    hasFetched.current = true;
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("was_logged_in");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("was_logged_in");
      }
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}