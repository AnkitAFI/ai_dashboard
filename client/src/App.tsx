// import { Switch, Route } from "wouter";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClient } from "./lib/queryClient";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { useState, useEffect, createContext, useContext } from "react";
 
// // Pages
// import Landing from "@/pages/landing";
// import Login from "@/pages/login";
// import Signup from "@/pages/signup";
// import Dashboard from "@/pages/dashboard";
// import Subscription from "@/pages/subscription";
// import About from "@/pages/about";
// import Settings from "@/pages/settings";
// import NotFound from "@/pages/not-found";


// // Analytics Pages
// import Sales from "@/pages/sales";
// import Revenue from "@/pages/revenue";
// import Categories from "@/pages/categories";
// import CategoryProducts from "@/pages/category-products";
// import ProductDetails from "@/pages/product-details";
// import SentimentProducts from "@/pages/sentiment-products"; 
// import ProductTracker from "@/pages/product-tracker";
// import ProductTrackerHistory from "@/pages/ProductTrackerHistory";

// // Auth Context
// interface User {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   businessName?: string;
//   location?: string;
//   subscriptionTier: string;
// }
 
// interface AuthContextType {
//   user: User | null;
//   login: (user: User) => void;
//   logout: () => void;
//   isAuthenticated: boolean;
// }
 
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within an AuthProvider");
//   return context;
// };
 
// function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
 
//   useEffect(() => {
//     const storedUser = localStorage.getItem("ecomai_user");
//     if (storedUser) {
//       try {
//         setUser(JSON.parse(storedUser));
//       } catch {
//         localStorage.removeItem("ecomai_user");
//       }
//     }
//   }, []);
 
//   const login = (userData: User) => {
//     setUser(userData);
//     localStorage.setItem("ecomai_user", JSON.stringify(userData));
//   };
 
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("ecomai_user");
//   };
 
//   const isAuthenticated = !!user;
 
//   return (
//     <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }
 
// function Router() {
//   return (
//     <Switch>
//       {/* Landing Page - ROOT */}
//       <Route path="/" component={Landing} />
//       {/* Analytics Pages */}
//       <Route path="/" component={Dashboard} />
//       <Route path="/dashboard" component={Dashboard} />
//       <Route path="/sales" component={Sales} />
//       <Route path="/revenue" component={Revenue} />
//       <Route path="/categories" component={Categories} />
//       <Route path="/category-products/:source/:category" component={CategoryProducts} />
//       <Route path="/product/:productName" component={ProductDetails} /> 
//       <Route path="/product-tracker" component={ProductTracker} />
//       <Route path="/product-tracker/history" component={ProductTrackerHistory} />

//       <Route path="/sentiment-products/:source/:sentiment" component={SentimentProducts} />

//       {/* Tools Pages */}
//       <Route path="/subscription" component={Subscription} />
//       <Route path="/about" component={About} />
//       <Route path="/settings" component={Settings} />

//       {/* Auth Pages */}
//       <Route path="/login" component={Login} />
//       <Route path="/signup" component={Signup} />

//       {/* 404 Fallback */}
//       <Route component={NotFound} />
//       <Route path="/categories" component={Categories} />
//       <Route path="/category-products/:category" component={CategoryProducts} />
//     </Switch>
//   );
// }

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <AuthProvider>
//           <Toaster />
//           <Router />
//         </AuthProvider>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;



import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, createContext, useContext } from "react";

// Pages
import Landing from "@/pages/landing";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-service";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Subscription from "@/pages/subscription";
import About from "@/pages/about";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Analytics Pages
import Sales from "@/pages/sales";
import Overview from "@/pages/overview";
import Categories from "@/pages/categories";
import CategoryProducts from "@/pages/category-products";
import ProductDetails from "@/pages/product-details";
import SentimentProducts from "@/pages/sentiment-products";
import ProductTracker from "@/pages/product-tracker";
import ProductTrackerHistory from "@/pages/ProductTrackerHistory";

// ==================
// Auth Context
// ==================
interface User {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  location?: string;
  subscriptionTier: string;
  aiChatUsed?: number;
  aiChatMonth?: string;
  businessInterests?: string[];
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// ==================
// AuthProvider
// ==================
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("https://api.insydz.com/api/auth/me", {
        credentials: "include",
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
          subscriptionTier: data.subscription_tier || "free",
          aiChatUsed: data.ai_chat_used,
          aiChatMonth: data.ai_chat_month,
          businessInterests: data.business_interests,
          createdAt: data.created_at,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching user session:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("https://api.insydz.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isLoading, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==================
// ProtectedRoute
// ==================
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg font-semibold">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component {...rest} />;
}

// ==================
// Router
// ==================
function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/about" component={About} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-service" component={TermsOfService} />

      {/* Protected Pages */}
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/sales" component={Sales} />
      <ProtectedRoute path="/overview" component={Overview} />
      <ProtectedRoute path="/categories" component={Categories} />
      <ProtectedRoute
        path="/category-products/:source/:category"
        component={CategoryProducts}
      />
      <ProtectedRoute path="/product/:productName" component={ProductDetails} />
      <ProtectedRoute path="/product-tracker" component={ProductTracker} />
      <ProtectedRoute
        path="/product-tracker/history"
        component={ProductTrackerHistory}
      />
      <ProtectedRoute
        path="/sentiment-products/:source/:sentiment"
        component={SentimentProducts}
      />
      <ProtectedRoute path="/subscription" component={Subscription} />
      <ProtectedRoute path="/settings" component={Settings} />

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

// ==================
// App
// ==================
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}