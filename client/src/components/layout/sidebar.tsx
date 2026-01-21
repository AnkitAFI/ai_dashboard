// // ============================================
// // FILE: src/components/layout/sidebar.tsx (UPDATED)
// // ============================================
// import { useState, useEffect } from "react";
// import { Link, useLocation } from "wouter";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { 
//   ChartLine, 
//   Crown,
//   Home, 
//   Info, 
//   Settings, 
//   PieChart,
//   LogOut,
//   Menu,
//   X,
//   TrendingUp,
//   DollarSign,
//   Users,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useToast } from "@/hooks/use-toast";
// import useAuth from "@/App";


// const SECTIONS = [
//   {
//     label: "Navigation",
//     items: [
//       { href: "/dashboard", label: "Dashboard", icon: Home },
//       { href: "/subscription", label: "Subscription", icon: Crown },
//       { href: "/about", label: "About", icon: Info },
//       { href: "/settings", label: "Settings", icon: Settings },
//     ],
//   },
//   {
//     label: "Analytics",
//     items: [
//       { href: "/sales", label: "Sales Analytics", icon: TrendingUp },
//       { href: "/revenue", label: "Revenue", icon: DollarSign },
//       { href: "/categories", label: "Categories", icon: PieChart },
//     ],
//   },
// ];

// export default function Sidebar() {
//   const [location, setLocation] = useLocation();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const { toast } = useToast();

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) setUser(JSON.parse(storedUser));
//   }, [location]);

//   const handleLogout = () => {
//     ["user", "userProfile", "userPreferences", "rememberMe", "access_token"].forEach(k =>
//       localStorage.removeItem(k)
//     );
//     toast({ title: "Logged out", description: "You have been successfully logged out." });
//     setLocation("/login");
//   };

//   const getUserInitials = () => {
//     if (!user?.name) return "U";
//     const names = user.name.split(' ');
//     if (names.length >= 2) {
//       return `${names[0][0]}${names[1][0]}`.toUpperCase();
//     }
//     return user.name[0].toUpperCase();
//   };

//   const getSubscriptionColor = (tier: string) => {
//     switch (tier?.toLowerCase()) {
//       case "premium": return "bg-gradient-to-r from-[#00D4FF] to-[#0099FF] text-white";
//       case "basic": return "bg-[#B3E5FC] text-[#004C75]";
//       default: return "bg-slate-200 text-gray-700";
//     }
//   };

//   const isActive = (href: string) => {
//     if (href === "/dashboard") return location === "/" || location === "/dashboard";
//     return location === href;
//   };

//   return (
//     <>
//       {!isCollapsed && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsCollapsed(true)} />
//       )}

//       <div
//         className={cn(
//           "fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 flex flex-col border-r border-white/20 backdrop-blur-2xl shadow-lg",
//           "bg-gradient-to-b from-[#E8F9FF]/90 via-[#DFF6FF]/80 to-[#C7EFFF]/90",
//           isCollapsed ? "w-16 -translate-x-full lg:translate-x-0" : "w-64 translate-x-0"
//         )}
//       >
//         {/* Header */}
//         <div className="p-6 border-b border-white/20 flex items-center justify-between">
//           <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
//             <div className="w-10 h-10 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] rounded-xl flex items-center justify-center shadow-md">
//               <ChartLine className="text-white h-5 w-5" />
//             </div>
//             {!isCollapsed && (
//               <div>
//                 <h1 className="font-bold text-lg text-[#003366] tracking-tight">Insydz</h1>
//                 <p className="text-xs text-slate-600">Analytics Dashboard</p>
//               </div>
//             )}
//           </div>
//           <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="lg:hidden text-slate-600">
//             {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
//           </Button>
//         </div>

//         {/* Navigation */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {SECTIONS.map(section => (
//             <div key={section.label}>
//               {!isCollapsed && (
//                 <p className="text-slate-500 font-semibold mb-2 uppercase text-xs tracking-wider">
//                   {section.label}
//                 </p>
//               )}
//               <div className="space-y-1">
//                 {section.items.map(item => {
//                   const Icon = item.icon;
//                   return (
//                     <Link key={item.href} href={item.href}>
//                       <Button
//                         variant={isActive(item.href) ? "default" : "ghost"}
//                         className={cn(
//                           "w-full justify-start transition-all duration-200 rounded-xl font-medium",
//                           isCollapsed && "justify-center px-2",
//                           isActive(item.href)
//                             ? "bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white shadow-md"
//                             : "text-slate-700 hover:bg-white/60"
//                         )}
//                       >
//                         <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
//                         {!isCollapsed && <span>{item.label}</span>}
//                       </Button>
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Profile */}
//         <div className="p-4 border-t border-white/20 backdrop-blur-lg">
//           <div className={cn("flex items-center p-3 bg-white/70 rounded-xl shadow-sm", isCollapsed && "justify-center")}>
//             <Avatar className="h-10 w-10">
//               <AvatarFallback className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white">
//                 {getUserInitials()}
//               </AvatarFallback>
//             </Avatar>
//             {!isCollapsed && (
//               <div className="flex-1 ml-3 min-w-0">
//                 <p className="font-semibold text-sm text-[#003366] truncate">
//                   {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "User" : "User"}
//                 </p>
//                 <Badge
//                   variant="secondary"
//                   className={cn(
//                     "text-xs mt-1 font-medium px-2 py-0.5 rounded-full",
//                     getSubscriptionColor(user?.subscriptionTier || "Free")
//                   )}
//                 >
//                   {user?.subscriptionTier ? `${user.subscriptionTier} Plan` : "Free Plan"}
//                 </Badge>
//               </div>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={handleLogout}
//               className={cn("text-slate-500 hover:text-[#0072FF]", isCollapsed && "p-2")}
//               title="Logout"
//             >
//               <LogOut className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// import { useState, useEffect } from "react";
// import { Link, useLocation } from "wouter";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import {
//   ChartLine,
//   Home,
//   Crown,
//   Info,
//   Settings,
//   LogOut,
//   Menu,
//   X,
//   Target,
//   TrendingUp,
//   DollarSign,
//   PieChart,
//   Users,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useToast } from "@/hooks/use-toast";
 
// const SECTIONS = [
//   {
//     label: "Navigation",
//     items: [
//       { href: "/dashboard", label: "Dashboard", icon: Home },
//       { href: "/subscription", label: "Subscription", icon: Crown },
//       { href: "/about", label: "About", icon: Info },
//       { href: "/settings", label: "Settings", icon: Settings },
//     ],
//   },
//   {
//     label: "Analytics",
//     items: [
//       { href: "/sales", label: "Sales Analytics", icon: TrendingUp },
//       { href: "/revenue", label: "Revenue", icon: DollarSign },
//       { href: "/categories", label: "Categories", icon: PieChart },
//       { href: "/product-tracker", label: "Product Radar", icon: Target },
//     ],
//   },
// ];
 
// export default function Sidebar() {
//   const [location, setLocation] = useLocation();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const { toast } = useToast();
 
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) setUser(JSON.parse(storedUser));
//   }, [location]);
 
//   const handleLogout = () => {
//     ["user", "userProfile", "userPreferences", "rememberMe", "access_token"].forEach(k =>
//       localStorage.removeItem(k)
//     );
//     toast({ title: "Logged out", description: "You have been successfully logged out." });
//     setLocation("/login");
//   };
 
//   const getUserInitials = () => {
//     if (!user) return "U";
//     const first = user.firstName || user.name?.split(" ")[0] || "";
//     const last = user.lastName || user.name?.split(" ")[1] || "";
//     return `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "U";
//   };
 
//   const getSubscriptionColor = (tier: string) => {
//     switch (tier?.toLowerCase()) {
//       case "premium": return "bg-gradient-to-r from-[#00D4FF] to-[#0099FF] text-white";
//       case "basic": return "bg-[#B3E5FC] text-[#004C75]";
//       default: return "bg-slate-200 text-gray-700";
//     }
//   };
 
//   const isActive = (href: string) => {
//     if (href === "/dashboard") return location === "/" || location === "/dashboard";
//     return location === href;
//   };
 
//   return (
//     <>
//       {!isCollapsed && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsCollapsed(true)} />
//       )}
 
//       <div
//         className={cn(
//           "fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 flex flex-col border-r border-white/20 backdrop-blur-2xl shadow-lg",
//           "bg-gradient-to-b from-[#E8F9FF]/90 via-[#DFF6FF]/80 to-[#C7EFFF]/90",
//           isCollapsed ? "w-16 -translate-x-full lg:translate-x-0" : "w-64 translate-x-0"
//         )}
//       >
//         {/* Header */}
//         <div className="p-6 border-b border-white/20 flex items-center justify-between">
//           <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
 
 
//             {/* ✅ CLICKABLE LOGO */}
//             <Link href="/" className="cursor-pointer">
//               <img
//                 src="/logo.png"
//     alt="Insydz Logo"
//     className="w-10 h-10 object-contain rounded-xl shadow-md hover:scale-105 transition"
//   />
             
//             </Link>
 
 
//             {!isCollapsed && (
//               <div>
//                 <h1 className="font-bold text-lg text-[#003366] tracking-tight">Insydz</h1>
//                 <p className="text-xs text-slate-600">Analytics Dashboard</p>
//               </div>
//             )}
//           </div>
 
//           <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="lg:hidden text-slate-600">
//             {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
//           </Button>
//         </div>
 
//         {/* Navigation */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {SECTIONS.map(section => (
//             <div key={section.label}>
//               {!isCollapsed && (
//                 <p className="text-slate-500 font-semibold mb-2 uppercase text-xs tracking-wider">
//                   {section.label}
//                 </p>
//               )}
//               <div className="space-y-1">
//                 {section.items.map(item => {
//                   const Icon = item.icon;
//                   return (
//                     <Link key={item.href} href={item.href}>
//                       <Button
//                         variant={isActive(item.href) ? "default" : "ghost"}
//                         className={cn(
//                           "w-full justify-start transition-all duration-200 rounded-xl font-medium",
//                           isCollapsed && "justify-center px-2",
//                           isActive(item.href)
//                             ? "bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white shadow-md"
//                             : "text-slate-700 hover:bg-white/60"
//                         )}
//                       >
//                         <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
//                         {!isCollapsed && <span>{item.label}</span>}
//                       </Button>
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>
 
//         {/* Profile */}
//         <div className="p-4 border-t border-white/20 backdrop-blur-lg">
//           <div className={cn("flex items-center p-3 bg-white/70 rounded-xl shadow-sm", isCollapsed && "justify-center")}>
//             <Avatar className="h-10 w-10">
//               <AvatarFallback className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white">
//                 {getUserInitials()}
//               </AvatarFallback>
//             </Avatar>
//             {!isCollapsed && (
//               <div className="flex-1 ml-3 min-w-0">
//                 <p className="font-semibold text-sm text-[#003366] truncate">
//                   {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "User" : "User"}
//                 </p>
//                 <Badge
//                   variant="secondary"
//                   className={cn(
//                     "text-xs mt-1 font-medium px-2 py-0.5 rounded-full",
//                     getSubscriptionColor(user?.subscriptionTier || "Free")
//                   )}
//                 >
//                   {user?.subscriptionTier ? `${user.subscriptionTier} Plan` : "Free Plan"}
//                 </Badge>
//               </div>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={handleLogout}
//               className={cn("text-slate-500 hover:text-[#0072FF]", isCollapsed && "p-2")}
//               title="Logout"
//             >
//               <LogOut className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }




import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/App";
import {
  ChartLine,
  Home,
  Crown,
  Info,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  History,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  {
    label: "Navigation",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/subscription", label: "Subscription", icon: Crown },
      { href: "/about", label: "About", icon: Info },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/sales", label: "Sales Analytics", icon: TrendingUp },
      { href: "/overview", label: "Overview", icon: DollarSign },
      { href: "/categories", label: "Categories", icon: PieChart },
      { href: "/product-tracker", label: "Product Radar", icon: Target },
    ],
  },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();

  // ✅ REMOVED: localStorage effect - now using auth context
  // User data comes directly from the auth context

  const handleLogout = async () => {
    try {
      await logout(); // ✅ Calls backend to clear session
      toast({ 
        title: "Logged out", 
        description: "You have been successfully logged out." 
      });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    
    // Try firstName and lastName first
    if (user.firstName || user.lastName) {
      const first = user.firstName?.[0] || "";
      const last = user.lastName?.[0] || "";
      return `${first}${last}`.toUpperCase() || "U";
    }
    
    // Fallback to name field
    if (user.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    
    // Final fallback
    return "U";
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "premium": 
        return "bg-gradient-to-r from-[#00D4FF] to-[#0099FF] text-white";
      case "basic": 
        return "bg-[#B3E5FC] text-[#004C75]";
      default: 
        return "bg-slate-200 text-gray-700";
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location === href;
  };

  const getDisplayName = () => {
    if (!user) return "User";
    
    // Try firstName and lastName
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    
    // Fallback to name field
    if (user.name) {
      return user.name;
    }
    
    // Final fallback
    return "User";
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="fixed left-0 top-0 h-full w-64 z-50 flex items-center justify-center border-r border-white/20 backdrop-blur-2xl bg-gradient-to-b from-[#E8F9FF]/90 via-[#DFF6FF]/80 to-[#C7EFFF]/90">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0072FF] mx-auto"></div>
          <p className="text-sm text-slate-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsCollapsed(true)} 
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 flex flex-col border-r border-white/20 backdrop-blur-2xl shadow-lg",
          "bg-gradient-to-b from-[#E8F9FF]/90 via-[#DFF6FF]/80 to-[#C7EFFF]/90",
          isCollapsed ? "w-16 -translate-x-full lg:translate-x-0" : "w-64 translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
            {/* ✅ CLICKABLE LOGO */}
            <Link href="/">
              <a className="cursor-pointer">
                <img
                  src="/logo.png" 
                  alt="Insydz Logo" 
                  className="w-10 h-10 object-contain rounded-xl shadow-md hover:scale-105 transition"
                />
              </a>
            </Link>

            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-[#003366] tracking-tight">Insydz</h1>
                <p className="text-xs text-slate-600">Analytics Dashboard</p>
              </div>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="lg:hidden text-slate-600"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {SECTIONS.map(section => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className="text-slate-500 font-semibold mb-2 uppercase text-xs tracking-wider">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <a>
                        <Button
                          variant={isActive(item.href) ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start transition-all duration-200 rounded-xl font-medium",
                            isCollapsed && "justify-center px-2",
                            isActive(item.href)
                              ? "bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white shadow-md"
                              : "text-slate-700 hover:bg-white/60"
                          )}
                        >
                          <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Button>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Profile */}
        <div className="p-4 border-t border-white/20 backdrop-blur-lg">
          <div className={cn(
            "flex items-center p-3 bg-white/70 rounded-xl shadow-sm", 
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            {!isCollapsed && (
              <div className="flex-1 ml-3 min-w-0">
                <p className="font-semibold text-sm text-[#003366] truncate">
                  {getDisplayName()}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs mt-1 font-medium px-2 py-0.5 rounded-full",
                    getSubscriptionColor(user?.subscriptionTier || "free")
                  )}
                >
                  {user?.subscriptionTier 
                    ? `${user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan` 
                    : "Free Plan"
                  }
                </Badge>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn("text-slate-500 hover:text-[#0072FF]", isCollapsed && "p-2")}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}