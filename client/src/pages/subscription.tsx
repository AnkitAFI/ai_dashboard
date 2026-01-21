

// import { useState, useEffect } from "react";
// import { useAuth } from "@/App";
// import Sidebar from "@/components/layout/sidebar";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Check, X, Crown, Zap, Building2 } from "lucide-react";

// interface SubscriptionPlan {
//   id: string;
//   name: string;
//   price?: number;
//   description: string;
//   features: string[];
//   limitations: string[];
//   isPopular?: boolean;
//   icon: React.ReactNode;
// }

// const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
//   {
//     id: "free",
//     name: "Free",
//     price: 0,
//     description: "Perfect for getting started",
//     icon: <Zap className="h-6 w-6" />,
//     features: [
//       "Basic dashboard access",
//       "100 product tracking",
//       "Basic AI insights",
//       "Weekly reports",
//       "Community support",
//     ],
//     limitations: [
//       "Advanced analytics",
//       "Real-time data",
//       "Premium AI features",
//       "Priority support",
//     ],
//   },
//   {
//     id: "basic",
//     name: "Basic",
//     price: 499,
//     description: "Ideal for growing businesses",
//     icon: <Crown className="h-6 w-6" />,
//     isPopular: true,
//     features: [
//       "All Free features",
//       "1,000 product tracking",
//       "Advanced AI insights",
//       "Daily reports",
//       "Basic competitor analysis",
//       "Email support",
//     ],
//     limitations: [
//       "Real-time alerts",
//       "Custom integrations",
//       "Priority support",
//       "Advanced analytics",
//     ],
//   },
//   {
//     id: "premium",
//     name: "Premium",
//     price: 1999,
//     description: "For serious e-commerce professionals",
//     icon: <Crown className="h-6 w-6 text-yellow-500" />,
//     features: [
//       "All Basic features",
//       "Unlimited product tracking",
//       "Advanced AI chatbot",
//       "Real-time data & alerts",
//       "Priority support",
//       "Advanced analytics",
//       "Custom integrations",
//     ],
//     limitations: [],
//   },
//   {
//     id: "enterprise",
//     name: "Enterprise (Custom)",
//     description: "Tailored solutions for small and medium businesses ",
//     icon: <Building2 className="h-6 w-6 text-indigo-600" />,
//     features: [
//       "All Premium features",
//       "Dedicated account manager",
//       "Custom integrations",
//       "On-premise",
//       "24/7 premium support",
//     ],
//     limitations: [],
//   },
// ];

// export default function Subscription() {
//   const { user } = useAuth();
  
//   const [selectedPlan, setSelectedPlan] = useState(() => {
//     // Initialize from localStorage or user data
//     const savedPlan = localStorage.getItem('selectedPlan');
//     if (savedPlan) {
//       return savedPlan;
//     }
    
//     const userString = localStorage.getItem('user');
//     if (userString) {
//       try {
//         const userData = JSON.parse(userString);
//         return userData.subscriptionTier || "free";
//       } catch (error) {
//         console.error('Error parsing user:', error);
//       }
//     }
    
//     return "free";
//   });

//   // Check for saved plan from landing page on component mount
//   useEffect(() => {
//     const savedPlan = localStorage.getItem('selectedPlan');
    
//     if (savedPlan) {
//       console.log('Found saved plan:', savedPlan);
      
//       // Set the selected plan
//       setSelectedPlan(savedPlan);
      
//       // Update user's subscription tier in localStorage if user exists
//       const userString = localStorage.getItem('user');
//       if (userString) {
//         try {
//           const userData = JSON.parse(userString);
//           userData.subscriptionTier = savedPlan;
//           localStorage.setItem('user', JSON.stringify(userData));
//           console.log('Updated user subscription to:', savedPlan);
//         } catch (error) {
//           console.error('Error updating user subscription:', error);
//         }
//       }
      
//       // Clear the selected plan from localStorage after processing
//       localStorage.removeItem('selectedPlan');
//     }
//   }, []); // Empty dependency array - run only once on mount

//   const handleUpgrade = (planId: string) => {
//     console.log(`Upgrading to ${planId} plan`);
//     setSelectedPlan(planId);
    
//     // Update user's subscription in localStorage
//     const userString = localStorage.getItem('user');
//     if (userString) {
//       try {
//         const userData = JSON.parse(userString);
//         userData.subscriptionTier = planId;
//         localStorage.setItem('user', JSON.stringify(userData));
//       } catch (error) {
//         console.error('Error updating user subscription:', error);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Sidebar />

//       <div className="ml-64 min-h-screen flex flex-col">
//         {/* Header */}
//         <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg rounded-2xl px-12 py-6 mb-6 mx-6 sticky top-4 z-20">
//           <div>
//             <h2 className="text-3xl font-bold text-sky-900">
//               Subscription Plans
//             </h2>
//             <p className="text-slate-600 text-base mt-1">
//               Scale your e-commerce analytics with AI-powered insights
//             </p>
//           </div>
//         </header>

//         <div className="p-6 flex-1 overflow-y-auto w-full">
//           <div className="space-y-12">
//             {/* Hero Section */}
//             <div className="text-center mb-8">
//               <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
//               <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//                 Unlock the full potential of AI-powered e-commerce analytics
//               </p>
//             </div>

//             {/* Subscription Plans Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//               {SUBSCRIPTION_PLANS.map((plan) => (
//                 <Card
//                   key={plan.id}
//                   className={`relative transition-all duration-300 hover:shadow-lg shadow-md border border-slate-200 rounded-2xl ${
//                     plan.isPopular ? "ring-2 ring-primary" : ""
//                   } ${
//                     selectedPlan === plan.id
//                       ? "bg-accent/30"
//                       : "bg-white"
//                   }`}
//                 >
//                   {plan.isPopular && (
//                     <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                       <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg rounded-full">
//                         Popular
//                       </Badge>
//                     </div>
//                   )}

//                   <CardHeader className="text-center pb-4">
//                     <div className="flex justify-center mb-4">
//                       <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
//                         {plan.icon}
//                       </div>
//                     </div>
//                     <CardTitle className="text-xl mb-2 font-semibold">
//                       {plan.name}
//                     </CardTitle>
//                     {plan.id !== "enterprise" ? (
//                       <div className="text-3xl font-bold mb-1">
//                         ₹{plan.price}
//                         <span className="text-sm font-normal text-muted-foreground">
//                           /month
//                         </span>
//                       </div>
//                     ) : (
//                       <div className="text-2xl font-semibold text-indigo-700 mb-1">
//                         Contact for pricing
//                       </div>
//                     )}
//                     <CardDescription>{plan.description}</CardDescription>
//                   </CardHeader>

//                   <CardContent className="space-y-4">
//                     <div className="space-y-3">
//                       {plan.features.map((feature, index) => (
//                         <div key={index} className="flex items-center">
//                           <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
//                           <span className="text-sm text-slate-700">
//                             {feature}
//                           </span>
//                         </div>
//                       ))}

//                       {plan.limitations.map((limitation, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center opacity-60"
//                         >
//                           <X className="h-4 w-4 text-red-400 mr-3 flex-shrink-0" />
//                           <span className="text-sm text-slate-500">
//                             {limitation}
//                           </span>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="pt-4">
//                       {plan.id === "enterprise" ? (
//                         <Button
//                           variant="outline"
//                           className="w-full"
//                           onClick={() => alert("Contact our sales team")}
//                         >
//                           Contact Sales
//                         </Button>
//                       ) : selectedPlan === plan.id ? (
//                         <Button variant="outline" className="w-full" disabled>
//                           Current Plan
//                         </Button>
//                       ) : plan.id === "free" ? (
//                         <Button
//                           variant="outline"
//                           className="w-full"
//                           onClick={() => handleUpgrade(plan.id)}
//                         >
//                           Downgrade to Free
//                         </Button>
//                       ) : (
//                         <Button
//                           className={`w-full ${
//                             plan.id === "premium"
//                               ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
//                               : "bg-primary text-white hover:bg-primary/90"
//                           }`}
//                           onClick={() => handleUpgrade(plan.id)}
//                         >
//                           {plan.id === "basic"
//                             ? "Upgrade to Basic"
//                             : "Upgrade to Premium"}
//                         </Button>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* FAQ Section */}
//             <div className="mt-12">
//               <h3 className="text-xl font-semibold mb-6 text-center">
//                 Frequently Asked Questions
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-medium mb-2">
//                       Can I change my plan anytime?
//                     </h4>
//                     <p className="text-sm text-slate-600">
//                       Yes, you can upgrade or downgrade your plan at any time.
//                       Changes will be reflected in your next billing cycle.
//                     </p>
//                   </div>
//                   <div>
//                     <h4 className="font-medium mb-2">
//                       What payment methods do you accept?
//                     </h4>
//                     <p className="text-sm text-slate-600">
//                       We accept all major credit cards, UPI, and bank transfers
//                       for Indian customers.
//                     </p>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-medium mb-2">Is my data secure?</h4>
//                     <p className="text-sm text-slate-600">
//                       Absolutely. We use enterprise-grade encryption and secure
//                       servers for all customer data.
//                     </p>
//                   </div>
//                   <div>
//                     <h4 className="font-medium mb-2">Do you offer refunds?</h4>
//                     <p className="text-sm text-slate-600">
//                       Yes, we offer a 14-day money-back guarantee for all paid
//                       plans if you're not satisfied.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import { useAuth } from "@/App";
// import Sidebar from "@/components/layout/sidebar";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Check, X, Crown, Zap, Building2 } from "lucide-react";

// interface SubscriptionPlan {
//   id: string;
//   name: string;
//   price?: number;
//   description: string;
//   features: string[];
//   limitations: string[];
//   isPopular?: boolean;
//   icon: React.ReactNode;
// }

// const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
//   {
//     id: "free",
//     name: "Free",
//     price: 0,
//     description: "Perfect for getting started",
//     icon: <Zap className="h-6 w-6" />,
//     features: [
//       "Basic dashboard access",
//       "100 product tracking",
//       "Basic AI insights",
//       "Weekly reports",
//       "Community support",
//     ],
//     limitations: [
//       "Advanced analytics",
//       "Real-time data",
//       "Premium AI features",
//       "Priority support",
//     ],
//   },
//   {
//     id: "basic",
//     name: "Basic",
//     price: 499,
//     description: "Ideal for growing businesses",
//     icon: <Crown className="h-6 w-6" />,
//     isPopular: true,
//     features: [
//       "All Free features",
//       "1,000 product tracking",
//       "Advanced AI insights",
//       "Daily reports",
//       "Basic competitor analysis",
//       "Email support",
//     ],
//     limitations: [
//       "Real-time alerts",
//       "Custom integrations",
//       "Priority support",
//       "Advanced analytics",
//     ],
//   },
//   {
//     id: "premium",
//     name: "Premium",
//     price: 1999,
//     description: "For serious e-commerce professionals",
//     icon: <Crown className="h-6 w-6 text-yellow-500" />,
//     features: [
//       "All Basic features",
//       "Unlimited product tracking",
//       "Advanced AI chatbot",
//       "Real-time data & alerts",
//       "Priority support",
//       "Advanced analytics",
//       "Custom integrations",
//     ],
//     limitations: [],
//   },
//   {
//     id: "enterprise",
//     name: "Enterprise (Custom)",
//     description: "Tailored solutions for small and medium businesses ",
//     icon: <Building2 className="h-6 w-6 text-indigo-600" />,
//     features: [
//       "All Premium features",
//       "Dedicated account manager",
//       "Custom integrations",
//       "On-premise",
//       "24/7 premium support",
//     ],
//     limitations: [],
//   },
// ];

// export default function Subscription() {
//   const { user } = useAuth();

//   const [selectedPlan, setSelectedPlan] = useState(() => {
//     const savedPlan = localStorage.getItem("selectedPlan");
//     if (savedPlan) return savedPlan;

//     const userString = localStorage.getItem("user");
//     if (userString) {
//       try {
//         const userData = JSON.parse(userString);
//         return userData.subscriptionTier || "free";
//       } catch (error) {
//         console.error("Error parsing user:", error);
//       }
//     }
//     return "free";
//   });

//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   useEffect(() => {
//     const savedPlan = localStorage.getItem("selectedPlan");
//     if (savedPlan) {
//       setSelectedPlan(savedPlan);
//       const userString = localStorage.getItem("user");
//       if (userString) {
//         try {
//           const userData = JSON.parse(userString);
//           userData.subscriptionTier = savedPlan;
//           localStorage.setItem("user", JSON.stringify(userData));
//         } catch (error) {
//           console.error("Error updating user subscription:", error);
//         }
//       }
//       localStorage.removeItem("selectedPlan");
//     }
//   }, []);

//   const handleUpgrade = (planId: string) => {
//     setSelectedPlan(planId);
//     const userString = localStorage.getItem("user");
//     if (userString) {
//       try {
//         const userData = JSON.parse(userString);
//         userData.subscriptionTier = planId;
//         localStorage.setItem("user", JSON.stringify(userData));
//       } catch (error) {
//         console.error("Error updating user subscription:", error);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col lg:flex-row">
//       {/* Mobile Sidebar */}
//       {isMobileMenuOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
//           <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform">
//             <div className="flex justify-end p-4">
//               <button onClick={() => setIsMobileMenuOpen(false)}>X</button>
//             </div>
//             <Sidebar />
//           </aside>
//         </>
//       )}

//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
//         <Sidebar />
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">
//         {/* Header */}
//         <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg rounded-2xl px-6 sm:px-12 py-4 sm:py-6 mb-6 flex items-center justify-between sticky top-4 z-20 mx-0 sm:mx-6">
//           <div className="flex items-center gap-3 w-full sm:w-auto">
//             <button
//               onClick={() => setIsMobileMenuOpen(true)}
//               className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
//             >
//               <span className="text-xl font-bold">☰</span>
//             </button>
//             <div>
//               <h2 className="text-3xl font-bold text-sky-900">
//                 Subscription Plans
//               </h2>
//               <p className="text-slate-600 text-sm sm:text-base mt-1">
//                 Scale your e-commerce analytics with AI-powered insights
//               </p>
//             </div>
//           </div>
//         </header>

//         {/* Scrollable Content */}
//         <main className="px-4 sm:px-6 flex-1 overflow-y-auto pb-6 space-y-12">
//           {/* Hero */}
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
//             <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//               Unlock the full potential of AI-powered e-commerce analytics
//             </p>
//           </div>

//           {/* Plans Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//             {SUBSCRIPTION_PLANS.map((plan) => (
//               <Card
//                 key={plan.id}
//                 className={`relative transition-all duration-300 hover:shadow-lg shadow-md border border-slate-200 rounded-2xl ${
//                   plan.isPopular ? "ring-2 ring-primary" : ""
//                 } ${selectedPlan === plan.id ? "bg-accent/30" : "bg-white"}`}
//               >
//                 {plan.isPopular && (
//                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                     <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg rounded-full">
//                       Popular
//                     </Badge>
//                   </div>
//                 )}

//                 <CardHeader className="text-center pb-4">
//                   <div className="flex justify-center mb-4">
//                     <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
//                       {plan.icon}
//                     </div>
//                   </div>
//                   <CardTitle className="text-xl mb-2 font-semibold">
//                     {plan.name}
//                   </CardTitle>
//                   {plan.id !== "enterprise" ? (
//                     <div className="text-3xl font-bold mb-1">
//                       ₹{plan.price}
//                       <span className="text-sm font-normal text-muted-foreground">
//                         /month
//                       </span>
//                     </div>
//                   ) : (
//                     <div className="text-2xl font-semibold text-indigo-700 mb-1">
//                       Contact for pricing
//                     </div>
//                   )}
//                   <CardDescription>{plan.description}</CardDescription>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   <div className="space-y-3">
//                     {plan.features.map((feature, index) => (
//                       <div key={index} className="flex items-center">
//                         <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
//                         <span className="text-sm text-slate-700">{feature}</span>
//                       </div>
//                     ))}

//                     {plan.limitations.map((limitation, index) => (
//                       <div key={index} className="flex items-center opacity-60">
//                         <X className="h-4 w-4 text-red-400 mr-3 flex-shrink-0" />
//                         <span className="text-sm text-slate-500">{limitation}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="pt-4">
//                     {plan.id === "enterprise" ? (
//                       <Button
//                         variant="outline"
//                         className="w-full"
//                         onClick={() => alert("Contact our sales team")}
//                       >
//                         Contact Sales
//                       </Button>
//                     ) : selectedPlan === plan.id ? (
//                       <Button variant="outline" className="w-full" disabled>
//                         Current Plan
//                       </Button>
//                     ) : plan.id === "free" ? (
//                       <Button
//                         variant="outline"
//                         className="w-full"
//                         onClick={() => handleUpgrade(plan.id)}
//                       >
//                         Downgrade to Free
//                       </Button>
//                     ) : (
//                       <Button
//                         className={`w-full ${
//                           plan.id === "premium"
//                             ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
//                             : "bg-primary text-white hover:bg-primary/90"
//                         }`}
//                         onClick={() => handleUpgrade(plan.id)}
//                       >
//                         {plan.id === "basic"
//                           ? "Upgrade to Basic"
//                           : "Upgrade to Premium"}
//                       </Button>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* FAQ */}
//           <div className="mt-12">
//             <h3 className="text-xl font-semibold mb-6 text-center">
//               Frequently Asked Questions
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div>
//                   <h4 className="font-medium mb-2">
//                     Can I change my plan anytime?
//                   </h4>
//                   <p className="text-sm text-slate-600">
//                     Yes, you can upgrade or downgrade your plan at any time.
//                     Changes will be reflected in your next billing cycle.
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-medium mb-2">
//                     What payment methods do you accept?
//                   </h4>
//                   <p className="text-sm text-slate-600">
//                     We accept all major credit cards, UPI, and bank transfers
//                     for Indian customers.
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <h4 className="font-medium mb-2">Is my data secure?</h4>
//                   <p className="text-sm text-slate-600">
//                     Absolutely. We use enterprise-grade encryption and secure
//                     servers for all customer data.
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-medium mb-2">Do you offer refunds?</h4>
//                   <p className="text-sm text-slate-600">
//                     Yes, we offer a 14-day money-back guarantee for all paid
//                     plans if you're not satisfied.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }



// import { useState, useEffect } from "react";
// import { useAuth } from "@/App";
// import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
// import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";
// import Sidebar from "@/components/layout/sidebar";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Check, X, Crown, Zap, Building2, Loader2, AlertCircle, Menu } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// interface SubscriptionPlan {
//   id: string;
//   name: string;
//   price?: number;
//   description: string;
//   features: string[];
//   limitations: string[];
//   isPopular?: boolean;
//   icon: React.ReactNode;
// }

// const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
//   {
//     id: "free",
//     name: "Free",
//     price: 0,
//     description: "Perfect for getting started",
//     icon: <Zap className="h-6 w-6" />,
//     features: [
//       "Basic dashboard access",
//       "25 product tracking",
//       "Top 5 products filter",
//       "5 AI chat messages/month",
//       "5 notifications",
//       "Weekly reports",
//     ],
//     limitations: [
//       "AI Chart Summaries",
//       "Advanced analytics",
//       "Real-time data",
//       "Premium AI features",
//       "Priority support",
//     ],
//   },
//   {
//     id: "basic",
//     name: "Basic",
//     price: 999,
//     description: "Ideal for growing businesses",
//     icon: <Crown className="h-6 w-6" />,
//     isPopular: true,
//     features: [
//       "All Free features",
//       "500 product tracking",
//       "Top 20 products filter",
//       "20 AI chat messages/month",
//       "15 notifications",
//       "AI Chart Summaries",
//       "Daily reports",
//       "Basic competitor alerts",
//       "Email support",
//     ],
//     limitations: [
//       "Real-time alerts",
//       "Priority support",
//     ],
//   },
//   {
//     id: "premium",
//     name: "Premium",
//     price: 1999,
//     description: "For serious e-commerce professionals",
//     icon: <Crown className="h-6 w-6 text-yellow-500" />,
//     features: [
//       "All Basic features",
//       "Unlimited product tracking",
//       "Top 100 products filter",
//       "Unlimited AI chat",
//       "Unlimited notifications",
//       "Advanced AI chatbot",
//       "Real-time data & alerts",
//       "Priority support",
//       "Advanced analytics",
//     ],
//     limitations: [],
//   },
//   {
//     id: "enterprise",
//     name: "Enterprise",
//     description: "Tailored solutions for businesses",
//     icon: <Building2 className="h-6 w-6 text-indigo-600" />,
//     features: [
//       "All Premium features",
//       "White-label options",
//       "24/7 premium support",
//     ],
//     limitations: [],
//   },
// ];

// export default function Subscription() {
//   const { user, refreshUser, isLoading: authLoading } = useAuth();
//   const { currentTier, limits } = useSubscriptionLimits();
//   const { updateSubscriptionInDB, getAIUsage } = useSubscriptionSync();

//   const [selectedPlan, setSelectedPlan] = useState<string>(currentTier);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0, month: '' });

//   // ✅ Load current tier and AI usage
//   useEffect(() => {
//     setSelectedPlan(currentTier);
    
//     const loadUsage = async () => {
//       try {
//         const usage = await getAIUsage();
//         setAiUsage(usage);
//       } catch (err) {
//         console.error("Failed to load AI usage:", err);
//       }
//     };
    
//     if (user) {
//       loadUsage();
//     }
//   }, [currentTier, user]);

//   // ✅ Handle subscription upgrade/downgrade
//   const handleUpgrade = async (planId: string) => {
//     // Clear previous messages
//     setError(null);
//     setSuccess(null);

//     // ✅ VALIDATION: Check user authentication
//     if (!user?.id) {
//       setError("Please login to change your subscription. If you're already logged in, try refreshing the page.");
//       console.error("❌ No authenticated user found!");
//       return;
//     }

//     if (planId === currentTier) {
//       setError("You are already on this plan");
//       return;
//     }

//     if (planId === "enterprise") {
//       alert("Please contact our sales team for Enterprise plan at sales@example.com");
//       return;
//     }

//     setLoading(true);
    
//     try {
//       console.log("🔄 Updating subscription...", {
//         userId: user.id,
//         userEmail: user.email,
//         currentTier,
//         newTier: planId
//       });

//       // ✅ CALL BACKEND API - Updates database and session
//       const result = await updateSubscriptionInDB(planId);
      
//       console.log("✅ Backend response:", result);

//       // ✅ REFRESH AUTH CONTEXT - Updates user everywhere
//       await refreshUser();

//       const actionType = SUBSCRIPTION_PLANS.findIndex(p => p.id === currentTier) < 
//                         SUBSCRIPTION_PLANS.findIndex(p => p.id === planId)
//         ? 'upgraded'
//         : 'changed';

//       setSuccess(`Successfully ${actionType} to ${planId.toUpperCase()} plan! Your new limits are now active.`);

//       // Update selected plan
//       setSelectedPlan(planId);

//       // Reload AI usage with new limits
//       const newUsage = await getAIUsage();
//       setAiUsage(newUsage);

//     } catch (err) {
//       console.error("❌ Subscription update failed:", err);
//       setError(
//         err instanceof Error 
//           ? `Failed to update: ${err.message}` 
//           : "Failed to update subscription. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Show loading state while checking authentication
//   if (authLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
//           <p className="text-slate-600">Loading subscription plans...</p>
//         </div>
//       </div>
//     );
//   }

//   // ✅ Redirect if not authenticated
//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader>
//             <CardTitle>Authentication Required</CardTitle>
//             <CardDescription>Please login to view subscription plans</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button onClick={() => window.location.href = "/login"} className="w-full">
//               Go to Login
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">
//       {/* Mobile Sidebar */}
//       {isMobileMenuOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//             onClick={() => setIsMobileMenuOpen(false)}
//           />
//           <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform">
//             <div className="flex justify-end p-4">
//               <button onClick={() => setIsMobileMenuOpen(false)}>
//                 <X className="h-6 w-6" />
//               </button>
//             </div>
//             <Sidebar />
//           </aside>
//         </>
//       )}

//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:block lg:w-64 fixed h-full z-30">
//         <Sidebar />
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">
//         {/* Header */}
//         <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg rounded-none sm:rounded-2xl px-4 sm:px-6 lg:px-12 py-4 sm:py-6 mb-6 flex items-center justify-between sticky top-0 sm:top-4 z-20 mx-0 sm:mx-6">
//           <div className="flex items-center gap-3 w-full sm:w-auto">
//             <button
//               onClick={() => setIsMobileMenuOpen(true)}
//               className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
//             >
//               <Menu className="h-5 w-5 text-sky-900" />
//             </button>
//             <div>
//               <h2 className="text-2xl sm:text-3xl font-bold text-sky-900">
//                 Subscription Plans
//               </h2>
//               <p className="text-slate-600 text-xs sm:text-sm mt-1">
//                 Current Plan: <span className="font-semibold text-sky-600">{currentTier.toUpperCase()}</span>
//                 <span className="ml-2">• {user.email}</span>
//               </p>
//             </div>
//           </div>
//         </header>

//         {/* Scrollable Content */}
//         <main className="px-4 sm:px-6 flex-1 overflow-y-auto pb-6 space-y-8">
//           {/* Alerts */}
//           {error && (
//             <Alert variant="destructive" className="mx-auto max-w-4xl">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {success && (
//             <Alert className="mx-auto max-w-4xl bg-green-50 border-green-200 text-green-800">
//               <Check className="h-4 w-4" />
//               <AlertDescription>{success}</AlertDescription>
//             </Alert>
//           )}

//           {/* Hero */}
//           <div className="text-center">
//             <h2 className="text-2xl sm:text-3xl font-bold mb-4">Choose Your Plan</h2>
//             <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
//               Unlock the full potential of AI-powered e-commerce analytics
//             </p>

//             {/* Current Usage Stats */}
//             {aiUsage.limit > 0 && aiUsage.limit !== Infinity && (
//               <div className="mt-6 bg-white rounded-lg p-4 max-w-md mx-auto border border-slate-200 shadow-sm">
//                 <p className="text-sm text-slate-600 mb-2 font-medium">AI Chat Usage This Month</p>
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1 bg-slate-200 rounded-full h-3 mr-3">
//                     <div 
//                       className="bg-gradient-to-r from-sky-500 to-blue-600 h-3 rounded-full transition-all"
//                       style={{ 
//                         width: `${Math.min((aiUsage.used / aiUsage.limit) * 100, 100)}%` 
//                       }}
//                     />
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">
//                     {aiUsage.used} / {aiUsage.limit}
//                   </span>
//                 </div>
//                 {aiUsage.used >= aiUsage.limit && (
//                   <p className="text-xs text-red-600 mt-2 font-medium">
//                     ⚠️ Limit reached! Upgrade for more AI chats.
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Plans Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
//             {SUBSCRIPTION_PLANS.map((plan) => {
//               const isCurrentPlan = plan.id === currentTier;
//               const isUpgrade = SUBSCRIPTION_PLANS.findIndex(p => p.id === currentTier) < SUBSCRIPTION_PLANS.findIndex(p => p.id === plan.id);

//               return (
//                 <Card
//                   key={plan.id}
//                   className={`relative transition-all duration-300 hover:shadow-xl shadow-md border rounded-2xl ${
//                     plan.isPopular ? "ring-2 ring-sky-500 ring-offset-2" : "border-slate-200"
//                   } ${isCurrentPlan ? "bg-sky-50 border-sky-300" : "bg-white"}`}
//                 >
//                   {plan.isPopular && (
//                     <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                       <Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-1 shadow-lg rounded-full">
//                         Most Popular
//                       </Badge>
//                     </div>
//                   )}

//                   {isCurrentPlan && (
//                     <div className="absolute -top-3 right-4">
//                       <Badge className="bg-green-500 text-white px-3 py-1 shadow-lg rounded-full">
//                         Current
//                       </Badge>
//                     </div>
//                   )}

//                   <CardHeader className="text-center pb-4">
//                     <div className="flex justify-center mb-4">
//                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
//                         isCurrentPlan ? 'bg-sky-100' : 'bg-slate-100'
//                       }`}>
//                         {plan.icon}
//                       </div>
//                     </div>
//                     <CardTitle className="text-xl mb-2 font-semibold">
//                       {plan.name}
//                     </CardTitle>
//                     {plan.id !== "enterprise" ? (
//                       <div className="text-3xl font-bold mb-1">
//                         ₹{plan.price}
//                         <span className="text-sm font-normal text-muted-foreground">
//                           /month
//                         </span>
//                       </div>
//                     ) : (
//                       <div className="text-xl font-semibold text-indigo-700 mb-1">
//                         Custom Pricing
//                       </div>
//                     )}
//                     <CardDescription className="text-sm">{plan.description}</CardDescription>
//                   </CardHeader>

//                   <CardContent className="space-y-4">
//                     <div className="space-y-2">
//                       {plan.features.map((feature, index) => (
//                         <div key={index} className="flex items-start">
//                           <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
//                           <span className="text-sm text-slate-700">{feature}</span>
//                         </div>
//                       ))}

//                       {plan.limitations.map((limitation, index) => (
//                         <div key={index} className="flex items-start opacity-50">
//                           <X className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
//                           <span className="text-sm text-slate-500 line-through">{limitation}</span>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="pt-4">
//                       {plan.id === "enterprise" ? (
//                         <Button
//                           variant="outline"
//                           className="w-full"
//                           onClick={() => alert("Contact our sales team at sales@example.com")}
//                         >
//                           Contact Sales
//                         </Button>
//                       ) : isCurrentPlan ? (
//                         <Button 
//                           variant="outline" 
//                           className="w-full bg-green-50 border-green-200 text-green-700 cursor-not-allowed" 
//                           disabled
//                         >
//                           <Check className="h-4 w-4 mr-2" />
//                           Current Plan
//                         </Button>
//                       ) : (
//                         <Button
//                           className={`w-full ${
//                             isUpgrade
//                               ? "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white"
//                               : "bg-slate-200 text-slate-700 hover:bg-slate-300"
//                           }`}
//                           onClick={() => handleUpgrade(plan.id)}
//                           disabled={loading}
//                         >
//                           {loading ? (
//                             <>
//                               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                               Processing...
//                             </>
//                           ) : isUpgrade ? (
//                             `Upgrade to ${plan.name}`
//                           ) : (
//                             `Switch to ${plan.name}`
//                           )}
//                         </Button>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>

//           {/* FAQ */}
//           <div className="mt-12 max-w-4xl mx-auto">
//             <h3 className="text-xl font-semibold mb-6 text-center">
//               Frequently Asked Questions
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div>
//                   <h4 className="font-medium mb-2">
//                     Can I change my plan anytime?
//                   </h4>
//                   <p className="text-sm text-slate-600">
//                     Yes, you can upgrade or downgrade your plan at any time.
//                     Changes are instant and reflected immediately.
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-medium mb-2">
//                     What payment methods do you accept?
//                   </h4>
//                   <p className="text-sm text-slate-600">
//                     We accept all major credit cards, UPI, and bank transfers
//                     for Indian customers.
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <h4 className="font-medium mb-2">Is my data secure?</h4>
//                   <p className="text-sm text-slate-600">
//                     Absolutely. We use enterprise-grade encryption and secure
//                     servers for all customer data.
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-medium mb-2">Do you offer refunds?</h4>
//                   <p className="text-sm text-slate-600">
//                     Yes, we offer a 14-day money-back guarantee for all paid
//                     plans if you're not satisfied.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { useAuth } from "@/App";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useSubscriptionSync } from "@/hooks/useSubscriptionSync";
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
import { Check, X, Crown, Zap, Building2, Loader2, AlertCircle, Menu } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionPlan {
  id: string;
  name: string;
  price?: number;
  oldPrice?: number;
  description: string;
  features: string[];
  limitations: string[];
  isPopular?: boolean;
  icon: React.ReactNode;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "Basic dashboard access",
      "25 product tracking",
      "Top 5 products filter",
      "5 AI chat messages/month",
      "5 notifications",
      "Weekly reports",
    ],
    limitations: [
      "AI Chart Summaries",
      "Advanced analytics",
      "Real-time data",
      "Premium AI features",
      "Priority support",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 999,
    oldPrice: 3999,
    description: "Ideal for growing businesses",
    icon: <Crown className="h-6 w-6" />,
    isPopular: true,
    features: [
      "All Free features",
      "500 product tracking",
      "Top 20 products filter",
      "20 AI chat messages/month",
      "15 notifications",
      "AI Chart Summaries",
      "Daily reports",
      "Basic competitor alerts",
      "Email support",
    ],
    limitations: [
      "Real-time alerts",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 1999,
    oldPrice: 7999,
    description: "For serious e-commerce professionals",
    icon: <Crown className="h-6 w-6 text-yellow-500" />,
    features: [
      "All Basic features",
      "Unlimited product tracking",
      "Top 100 products filter",
      "Unlimited AI chat",
      "Unlimited notifications",
      "Advanced AI chatbot",
      "Real-time data & alerts",
      "Priority support",
      "Advanced analytics",
    ],
    limitations: [],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Tailored solutions for businesses",
    icon: <Building2 className="h-6 w-6 text-indigo-600" />,
    features: [
      "All Premium features",
      "White-label options",
      "24/7 premium support",
    ],
    limitations: [],
  },
];

export default function Subscription() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const { currentTier, limits } = useSubscriptionLimits();
  const { updateSubscriptionInDB, getAIUsage } = useSubscriptionSync();

  const [selectedPlan, setSelectedPlan] = useState<string>(currentTier);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiUsage, setAiUsage] = useState({ used: 0, limit: 0, month: '' });

  // ✅ Load current tier and AI usage
  useEffect(() => {
    setSelectedPlan(currentTier);
    
    const loadUsage = async () => {
      try {
        const usage = await getAIUsage();
        setAiUsage(usage);
      } catch (err) {
        console.error("Failed to load AI usage:", err);
      }
    };
    
    if (user) {
      loadUsage();
    }
  }, [currentTier, user]);

  // ✅ Handle subscription upgrade/downgrade
  const handleUpgrade = async (planId: string) => {
    // Clear previous messages
    setError(null);
    setSuccess(null);

    // ✅ VALIDATION: Check user authentication
    if (!user?.id) {
      setError("Please login to change your subscription. If you're already logged in, try refreshing the page.");
      console.error("❌ No authenticated user found!");
      return;
    }

    if (planId === currentTier) {
      setError("You are already on this plan");
      return;
    }

    if (planId === "enterprise") {
      alert("Please contact our sales team for Enterprise plan at sales@example.com");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🔄 Updating subscription...", {
        userId: user.id,
        userEmail: user.email,
        currentTier,
        newTier: planId
      });

      // ✅ CALL BACKEND API - Updates database and session
      const result = await updateSubscriptionInDB(planId);
      
      console.log("✅ Backend response:", result);

      // ✅ REFRESH AUTH CONTEXT - Updates user everywhere
      await refreshUser();

      const actionType = SUBSCRIPTION_PLANS.findIndex(p => p.id === currentTier) < 
                        SUBSCRIPTION_PLANS.findIndex(p => p.id === planId)
        ? 'upgraded'
        : 'changed';

      setSuccess(`Successfully ${actionType} to ${planId.toUpperCase()} plan! Your new limits are now active.`);

      // Update selected plan
      setSelectedPlan(planId);

      // Reload AI usage with new limits
      const newUsage = await getAIUsage();
      setAiUsage(newUsage);

    } catch (err) {
      console.error("❌ Subscription update failed:", err);
      setError(
        err instanceof Error 
          ? `Failed to update: ${err.message}` 
          : "Failed to update subscription. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  // ✅ Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to view subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/login"} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 flex flex-col lg:flex-row">
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden shadow-2xl transform transition-transform">
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

      {/* Main Content */}
      <div className="flex-1 w-full lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg rounded-none sm:rounded-2xl px-4 sm:px-6 lg:px-12 py-4 sm:py-6 mb-6 flex items-center justify-between sticky top-0 sm:top-4 z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-sky-900" />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-sky-900">
                Subscription Plans
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Current Plan: <span className="font-semibold text-sky-600">{currentTier.toUpperCase()}</span>
                <span className="ml-2">• {user.email}</span>
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="px-4 sm:px-6 flex-1 overflow-y-auto pb-6 space-y-8">
          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mx-auto max-w-4xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mx-auto max-w-4xl bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Hero */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
              Unlock the full potential of AI-powered e-commerce analytics
            </p>

            {/* Current Usage Stats */}
            {aiUsage.limit > 0 && aiUsage.limit !== Infinity && (
              <div className="mt-6 bg-white rounded-lg p-4 max-w-md mx-auto border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-600 mb-2 font-medium">AI Chat Usage This Month</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-slate-200 rounded-full h-3 mr-3">
                    <div 
                      className="bg-gradient-to-r from-sky-500 to-blue-600 h-3 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((aiUsage.used / aiUsage.limit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {aiUsage.used} / {aiUsage.limit}
                  </span>
                </div>
                {aiUsage.used >= aiUsage.limit && (
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠️ Limit reached! Upgrade for more AI chats.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrentPlan = plan.id === currentTier;
              const isUpgrade = SUBSCRIPTION_PLANS.findIndex(p => p.id === currentTier) < SUBSCRIPTION_PLANS.findIndex(p => p.id === plan.id);

              return (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-xl shadow-md border rounded-2xl ${
                    plan.isPopular ? "ring-2 ring-sky-500 ring-offset-2" : "border-slate-200"
                  } ${isCurrentPlan ? "bg-sky-50 border-sky-300" : "bg-white"}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-1 shadow-lg rounded-full">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500 text-white px-3 py-1 shadow-lg rounded-full">
                        Current
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCurrentPlan ? 'bg-sky-100' : 'bg-slate-100'
                      }`}>
                        {plan.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-2 font-semibold">
                      {plan.name}
                    </CardTitle>
                    {plan.id !== "enterprise" ? (
                      <div className="text-3xl font-bold mb-1 flex items-baseline justify-center gap-2">
  {plan.oldPrice && (
    <span className="text-gray-400 text-xl line-through">
      ₹{plan.oldPrice}
    </span>
  )}
  <span className="text-3xl font-extrabold text-sky-900">
    ₹{plan.price}
  </span>
  <span className="text-sm font-normal text-muted-foreground self-end">
    /month
  </span>
</div>

                    ) : (
                      <div className="text-xl font-semibold text-indigo-700 mb-1">
                        Custom Pricing
                      </div>
                    )}
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700">{feature}</span>
                        </div>
                      ))}

                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start opacity-50">
                          <X className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-500 line-through">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      {plan.id === "enterprise" ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => alert("Contact our sales team at sales@example.com")}
                        >
                          Contact Sales
                        </Button>
                      ) : isCurrentPlan ? (
                        <Button 
                          variant="outline" 
                          className="w-full bg-green-50 border-green-200 text-green-700 cursor-not-allowed" 
                          disabled
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className={`w-full ${
                            isUpgrade
                              ? "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white"
                              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          }`}
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : isUpgrade ? (
                            `Upgrade to ${plan.name}`
                          ) : (
                            `Switch to ${plan.name}`
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-6 text-center">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">
                    Can I change my plan anytime?
                  </h4>
                  <p className="text-sm text-slate-600">
                    Yes, you can upgrade or downgrade your plan at any time.
                    Changes are instant and reflected immediately.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    What payment methods do you accept?
                  </h4>
                  <p className="text-sm text-slate-600">
                    We accept all major credit cards, UPI, and bank transfers
                    for Indian customers.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Is my data secure?</h4>
                  <p className="text-sm text-slate-600">
                    Absolutely. We use enterprise-grade encryption and secure
                    servers for all customer data.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Do you offer refunds?</h4>
                  <p className="text-sm text-slate-600">
                    Yes, we offer a 14-day money-back guarantee for all paid
                    plans if you're not satisfied.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}