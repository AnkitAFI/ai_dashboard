import { Switch, Route, useLocation, Redirect, Router as WouterRouter } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, createContext, useContext } from "react";
import ScrollToTop from "@/components/ScrollToTop";

// ==================
// Pages — Shared / Top-level
// ==================
import Landing from "@/pages/shared/landing";
import Pricing from "@/pages/shared/pricing";
import NotFound from "@/pages/shared/not-found";
import FeatureComingSoon from "@/pages/shared/FeatureComingSoon";

// ==================
// Pages — Legal
// ==================
import PrivacyPolicy from "@/pages/legal/privacy-policy";
import TermsOfService from "@/pages/legal/terms-service";

import AmazonSellersPage from "@/pages/solutions/amazon-sellers";
import FlipkartSellersPage from "@/pages/solutions/flipkart-sellers";
import BrandManagersPage from "@/pages/solutions/brand-managers";
import EcommerceAgenciesPage from "@/pages/solutions/ecommerce-agencies";
import SolutionsPage from "@/pages/solutions/solutions";

// ==================
// Pages — Use Cases
// ==================
import UseCasesPage from "@/pages/use-cases/use-cases";
import TrackCompetitorPricesPage from "@/pages/use-cases/track-competitor-prices";
import FindProfitableProductsPage from "@/pages/use-cases/find-profitable-products";
import AnalyzeCustomerReviewsPage from "@/pages/use-cases/analyze-customer-reviews";
import ImproveSEOPage from "@/pages/use-cases/improve-seo";
import AvoidStockoutsPage from "@/pages/use-cases/avoid-stockouts";

// ==================
// Pages — Features
// ==================
import AllFeaturesPage from "@/pages/features/features";
import CompetitorPriceTrackingFeaturePage from "@/pages/features/competitor-price-tracking-feature";
import ReviewAnalyticsFeaturePage from "@/pages/features/review-analytics-feature";
import PriceOptimizationFeaturePage from "@/pages/features/price-optimization-feature";
import KeywordRankTrackingFeaturePage from "@/pages/features/keyword-rank-tracking-feature";
import ProductResearchFeaturePage from "@/pages/features/product-research-feature";
import AIRecommendationsFeaturePage from "@/pages/features/ai-recommendations-feature";
import WhatsAppAlertsFeaturePage from "@/pages/features/whatsapp-alerts-feature";
import FestiveTrendFeaturePage from "@/pages/features/festive-trend-feature";

// ==================
// Pages — Compare
// ==================
import InsydzVsHeliumPage from "@/pages/compare/insydzvshelium";
import InsydzVsJungleScoutPage from "@/pages/compare/insydzvsjunglescout";
import InsydzVsViralLaunchPage from "@/pages/compare/insydzvsvirallaunch";

// ==================
// Pages — Free Tools
// ==================
import FreeAmazonProductAnalyzerPage from "@/pages/free-tools/free-amazon-product-analyzer";
import FreeReviewSentimentCheckerPage from "@/pages/free-tools/free-review-sentiment-checker";
import FreeKeywordRankCheckerPage from "@/pages/free-tools/free-keyword-rank-checker";
import FreeCompetitorPriceCheckerPage from "@/pages/free-tools/free-competitor-price-checker";

// ==================
// Pages — About
// ==================
import About from "@/pages/about/about";
import OurVisionPage from "@/pages/about/our-vision";
import ContactUsPage from "@/pages/about/contact-us";
import CareersPage from "@/pages/about/careers";

// ==================
// Pages — Resources / Expert Blog
// ==================
import ExpertBlog from "@/pages/resources/expert-blog/expert-blog";
import AmazonCompetitorPriceTrackingTool from "@/pages/resources/expert-blog/amazon-competitor-price-tracking-tool";
import AmazonSeoToolIndia from "@/pages/resources/expert-blog/amazon-seo-tool-india";
import HowToRankPage1AmazonIndia from "@/pages/resources/expert-blog/how-to-rank-page-1-amazon-india";
import BestCompetitorPriceTrackingToolsIndia from "@/pages/resources/expert-blog/best-competitor-price-tracking-tools-india";
import InsydzVsHelium10India from "@/pages/resources/expert-blog/insydz-vs-helium-10-india";
import AmazonReviewAnalysisToolIndia from "@/pages/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers";
import ReviewAnalysisGuideIndia from "@/pages/resources/expert-blog/review-analysis-guide-india";
import BestAmazonKeywordResearchToolIndia from "@/pages/resources/expert-blog/best-amazon-keyword-research-tool-india";
import BestFlipkartAnalyticsTool from "@/pages/resources/expert-blog/best-flipkart-analytics-tool";
import FlipkartKeywordResearchTool from "@/pages/resources/expert-blog/flipkart-keyword-research-tool";
import AmazonVsFlipkartIndiaSellers from "@/pages/resources/expert-blog/amazon-vs-flipkart-india-seller";
import ManualVsAutomatedCompetitorTracking from "@/pages/resources/expert-blog/manual-vs-automated-competitor-tracking-tool";

// ==================
// Pages — Auth
// ==================
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import VerifyEmail from "@/pages/auth/VerifyEmail";

// ==================
// Pages — Dashboard & App
// ==================
import Dashboard from "@/pages/dashboard/dashboard";
import Subscription from "@/pages/dashboard/subscription";
import Settings from "@/pages/dashboard/settings";
import OrderHistory from "@/pages/dashboard/OrderHistory";
import AdminDashboard from "@/pages/dashboard/AdminDashboard";
import Sales from "@/pages/dashboard/sales";
import Overview from "@/pages/dashboard/overview";
import Categories from "@/pages/dashboard/categories";
import CategoryProducts from "@/pages/dashboard/category-products";
import ProductDetails from "@/pages/dashboard/product-details";
import SentimentProducts from "@/pages/dashboard/sentiment-products";
import ProductTracker from "@/pages/dashboard/product-tracker";
import ProductTrackerHistory from "@/pages/dashboard/ProductTrackerHistory";
import ShareOfVoice from "@/pages/dashboard/ShareOfVoice";
import KeywordTracker from "@/pages/dashboard/keyword-tracker";
import ProfitabilityOptimizer from "@/pages/dashboard/ProfitabilityOptimizer";
import WhiteSpaceFinder from "@/pages/dashboard/WhiteSpaceFinder";
import AiAdvisor from "@/pages/dashboard/AiAdvisor";
import SellerProducts from "@/pages/dashboard/SellerProducts";
// ==================
// Environment Config
// ==================
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


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
  onboardingCompleted: boolean;
  onboarding_marketplace: string | null;
  onboarding_details: string | null;
  seller_id: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
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
    if (typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap') {
      setIsLoading(false);
      return;
    }
    // Skip if no window (SSR safety)
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
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
          subscriptionTier: data.subscription_tier || "free",
          aiChatUsed: data.ai_chat_used,
          aiChatMonth: data.ai_chat_month,
          businessInterests: data.business_interests,
          createdAt: data.created_at,
          onboardingCompleted: data.onboarding_completed,
          onboarding_marketplace: data.onboarding_marketplace || null,
          onboarding_details: data.onboarding_details || null,
          seller_id: data.seller_id || null,
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

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchCurrentUser();
  };

  // ✅ Improved logout function
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

      // Clear user state
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user state even if backend call fails
      setUser(null);
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

// ==================
// ProtectedRoute
// ==================
function ProtectedRoute({ component: Component, path, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-muted-foreground">
                  Verifying session...
                </p>
              </div>
            </div>
          );
        }
        if (!isAuthenticated) return null;
        return <Component {...rest} />;
      }}
    </Route>
  );
}
// ==================
// PublicRoute (redirects to dashboard if already logged in)
// ==================
function PublicRoute({ component: Component, path, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-muted-foreground">
                  Loading...
                </p>
              </div>
            </div>
          );
        }
        if (isAuthenticated) return null;
        return <Component {...rest} />;
      }}
    </Route>
  );
}
// ==================
// Router
// ==================
function Router() {
  return (
    <Switch>
      {/* Public Pages (always accessible) */}
      <Route path="/">
        {() => {
          const { isAuthenticated, isLoading } = useAuth();
          if (isLoading) return null;
          return isAuthenticated ? <Redirect to="/dashboard" /> : <Landing />;
        }}
      </Route>
      <Route path="/about" component={About} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-service" component={TermsOfService} />
      <Route path="/solutions/amazon-sellers" component={AmazonSellersPage} />
      <Route path="/solutions/flipkart-sellers" component={FlipkartSellersPage} />
      <Route path="/solutions/brand-managers" component={BrandManagersPage} />
      <Route path="/solutions/ecommerce-agencies" component={EcommerceAgenciesPage} />
      <Route path="/use-cases/track-competitor-prices" component={TrackCompetitorPricesPage} />
      <Route path="/use-cases/find-profitable-products" component={FindProfitableProductsPage} />
      <Route path="/use-cases/analyze-customer-reviews" component={AnalyzeCustomerReviewsPage} />
      <Route path="/use-cases/improve-seo" component={ImproveSEOPage} />
      <Route path="/use-cases/avoid-stockouts" component={AvoidStockoutsPage} />
      <Route path="/features" component={AllFeaturesPage} />
      <Route path="/features/competitor-price-tracking-feature" component={CompetitorPriceTrackingFeaturePage} />
      <Route path="/features/review-analytics-feature" component={ReviewAnalyticsFeaturePage} />
      <Route path="/features/price-optimization-feature" component={PriceOptimizationFeaturePage} />
      <Route path="/features/keyword-rank-tracking-feature" component={KeywordRankTrackingFeaturePage} />
      <Route path="/features/product-research-feature" component={ProductResearchFeaturePage} />
      <Route path="/features/ai-recommendations-feature" component={AIRecommendationsFeaturePage} />
      <Route path="/features/whatsapp-alerts-feature" component={WhatsAppAlertsFeaturePage} />
      <Route path="/features/festive-trend-feature" component={FestiveTrendFeaturePage} />
      <Route path="/use-cases" component={UseCasesPage} />
      <Route path="/solutions" component={SolutionsPage} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/compare/insydzvshelium" component={InsydzVsHeliumPage} />
      <Route path="/compare/insydzvsjunglescout" component={InsydzVsJungleScoutPage} />
      <Route path="/compare/insydzvsvirallaunch" component={InsydzVsViralLaunchPage} />
      <Route path="/resources/expert-blog" component={ExpertBlog} />
      <Route path="/free-tools/free-amazon-product-analyzer" component={FreeAmazonProductAnalyzerPage} />
      <Route path="/free-tools/free-review-sentiment-checker" component={FreeReviewSentimentCheckerPage} />
      <Route path="/free-tools/free-keyword-rank-checker" component={FreeKeywordRankCheckerPage} />
      <Route path="/free-tools/free-competitor-price-checker" component={FreeCompetitorPriceCheckerPage} />
      <Route path="/about/our-vision" component={OurVisionPage} />
      <Route path="/about/contact-us" component={ContactUsPage} />
      <Route path="/about/careers" component={CareersPage} />
      <Route path="/resources/expert-blog/amazon-competitor-price-tracking-tool" component={AmazonCompetitorPriceTrackingTool} />
      <Route path="/resources/expert-blog/amazon-seo-tool-india" component={AmazonSeoToolIndia} />
      <Route path="/resources/expert-blog/how-to-rank-page-1-amazon-india" component={HowToRankPage1AmazonIndia} />
      <Route path="/resources/expert-blog/best-competitor-price-tracking-tools-india" component={BestCompetitorPriceTrackingToolsIndia} />
      <Route path="/resources/expert-blog/insydz-vs-helium-10-india" component={InsydzVsHelium10India} />
      <Route path="/resources/expert-blog/ai-review-intelligence-tool-for-amazon-and-flipkart-sellers" component={AmazonReviewAnalysisToolIndia} />
      <Route path="/resources/expert-blog/review-analysis-guide-india" component={ReviewAnalysisGuideIndia} />
      <Route path="/resources/expert-blog/best-amazon-keyword-research-tool-india" component={BestAmazonKeywordResearchToolIndia} />
      <Route path="/resources/expert-blog/best-flipkart-analytics-tool" component={BestFlipkartAnalyticsTool} />
      <Route path="/resources/expert-blog/flipkart-keyword-research-tool" component={FlipkartKeywordResearchTool} />
      <Route path="/resources/expert-blog/amazon-vs-flipkart-india-seller" component={AmazonVsFlipkartIndiaSellers} />
      <Route path="/resources/expert-blog/manual-vs-automated-competitor-tracking-tool" component={ManualVsAutomatedCompetitorTracking} />

      {/* Auth Pages (redirect to dashboard if already logged in) */}
      <PublicRoute path="/login" component={Login} />
      <PublicRoute path="/signup" component={Signup} />
      <PublicRoute path="/verify-email" component={VerifyEmail} />


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
      <ProtectedRoute path="/share-of-voice" component={ShareOfVoice} />
      <ProtectedRoute path="/keyword-tracker" component={KeywordTracker} />
      <ProtectedRoute path="/order-history" component={OrderHistory} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />

      {/* Explorer Placeholder Routes */}
      <ProtectedRoute path="/explorer/start-here" component={FeatureComingSoon} />
      <ProtectedRoute path="/explorer/product-research" component={FeatureComingSoon} />
      <ProtectedRoute path="/explorer/competitor-prices" component={FeatureComingSoon} />
      <ProtectedRoute path="/explorer/white-space-finder" component={WhiteSpaceFinder} />
      <ProtectedRoute path="/explorer/review-analytics" component={FeatureComingSoon} />
      <ProtectedRoute path="/explorer/profitability-optimizer" component={ProfitabilityOptimizer} />
      <ProtectedRoute path="/explorer/ai-advisor" component={FeatureComingSoon} />
      <ProtectedRoute path="/explorer/whatsapp-alerts" component={FeatureComingSoon} />
      <ProtectedRoute path="/explorer/festive-trends" component={FeatureComingSoon} />
      <ProtectedRoute path="/explorer/my-watchlist" component={FeatureComingSoon} />

      {/* Seller Placeholder Routes */}
      <ProtectedRoute path="/seller/my-products" component={SellerProducts} />
      <ProtectedRoute path="/seller/listing-audit" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/price-comparison" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/review-comparison" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/keyword-gap" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/price-optimizer" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/seo-optimizer" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/ai-advisor" component={AiAdvisor} />
      <ProtectedRoute path="/seller/whatsapp-alerts" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/festive-trends" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/competitor-analysis" component={FeatureComingSoon} />
      <ProtectedRoute path="/seller/rank-tracker" component={FeatureComingSoon} />

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
    <WouterRouter hook={useBrowserLocation}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <ScrollToTop />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}
