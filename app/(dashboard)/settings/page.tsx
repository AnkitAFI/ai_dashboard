// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@/lib/auth-context";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";

// const LOCATIONS = [
//   { value: "mumbai", label: "Mumbai, India" },
//   { value: "delhi", label: "Delhi, India" },
//   { value: "bangalore", label: "Bangalore, India" },
//   { value: "chennai", label: "Chennai, India" },
//   { value: "kolkata", label: "Kolkata, India" },
//   { value: "pune", label: "Pune, India" },
//   { value: "hyderabad", label: "Hyderabad, India" },
//   { value: "other", label: "Other" },
// ];

// const TARGET_MARKETS = [
//   { value: "national", label: "India (National)" },
//   { value: "regional", label: "Regional (West India)" },
//   { value: "local", label: "Local (Mumbai Metro)" },
// ];

// const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com");

// export default function Settings() {
//   const { toast } = useToast();
//   const { user, refreshUser, isLoading: authLoading } = useAuth();

//   const [profileData, setProfileData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     businessName: "",
//     location: "mumbai",
//   });

//   const [preferences, setPreferences] = useState({
//     emailNotifications: true,
//     priceAlerts: true,
//     trendAlerts: false,
//     targetMarket: "national",
//     shareUsageData: true,
//   });

//   const [isSaving, setIsSaving] = useState(false);

//   // ✅ Load user data from auth context
//   useEffect(() => {
//     if (user) {
//       setProfileData({
//         firstName: user.firstName || "",
//         lastName: user.lastName || "",
//         email: user.email || "",
//         businessName: user.businessName || "",
//         location: user.location || "mumbai",
//       });
//     }
//   }, [user]);

//   // ✅ Handle profile update with session authentication
//   const handleProfileSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!user?.id) {
//       toast({
//         title: "Authentication required",
//         description: "Please login again to update your profile",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsSaving(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
//         method: "PUT",
//         credentials: "include", // ✅ Include session cookie
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           first_name: profileData.firstName,
//           last_name: profileData.lastName,
//           email: profileData.email,
//           business_name: profileData.businessName,
//           location: profileData.location,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || "Failed to update profile");
//       }

//       // ✅ Refresh user data in auth context
//       await refreshUser();

//       toast({
//         title: "Settings saved successfully!",
//         description: "Your profile has been updated.",
//       });
//     } catch (error: any) {
//       console.error("Error saving profile:", error);
//       toast({
//         title: "Failed to save",
//         description: error.message || "Could not update your profile.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
//     setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleLocationChange = (value: string) => {
//     setProfileData((prev) => ({ ...prev, location: value }));
//   };

//   const handlePreferenceChange = (field: string) => (checked: boolean) => {
//     setPreferences((prev) => ({ ...prev, [field]: checked }));
//   };

//   const handleResetSettings = () => {
//     if (user) {
//       setProfileData({
//         firstName: user.firstName || "",
//         lastName: user.lastName || "",
//         email: user.email || "",
//         businessName: user.businessName || "",
//         location: user.location || "mumbai",
//       });
//     }

//     const defaultPrefs = {
//       emailNotifications: true,
//       priceAlerts: true,
//       trendAlerts: false,
//       targetMarket: "national",
//       shareUsageData: true,
//     };

//     setPreferences(defaultPrefs);

//     toast({
//       title: "Settings reset",
//       description: "Preferences have been reset to defaults.",
//     });
//   };

//   // Show loading state while checking authentication
//   if (authLoading) {
//     return (
//       <div className="flex items-center justify-center p-20">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading your settings...</p>
//         </div>
//       </div>
//     );
//   }

//   // Redirect if not authenticated
//   if (!user) {
//     return (
//       <div className="flex items-center justify-center p-20">
//         <Card className="w-full max-w-md">
//           <CardHeader>
//             <CardTitle>Authentication Required</CardTitle>
//             <CardDescription>Please login to access settings</CardDescription>
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
//     <div className="space-y-6">
//       {/* Profile Card */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center justify-between">
//             Profile Settings
//             <Badge variant="secondary">Session Authenticated</Badge>
//           </CardTitle>
//           <CardDescription>Update your personal information</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="firstName">First Name</Label>
//               <Input
//                 id="firstName"
//                 value={profileData.firstName}
//                 onChange={handleInputChange("firstName")}
//               />
//             </div>
//             <div>
//               <Label htmlFor="lastName">Last Name</Label>
//               <Input
//                 id="lastName"
//                 value={profileData.lastName}
//                 onChange={handleInputChange("lastName")}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={profileData.email}
//                 onChange={handleInputChange("email")}
//               />
//             </div>
//             <div>
//               <Label htmlFor="businessName">Business Name</Label>
//               <Input
//                 id="businessName"
//                 value={profileData.businessName}
//                 onChange={handleInputChange("businessName")}
//                 placeholder="Optional"
//               />
//             </div>
//           </div>

//           <div>
//             <Label>Primary Location</Label>
//             <Select value={profileData.location} onValueChange={handleLocationChange}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select your location" />
//               </SelectTrigger>
//               <SelectContent>
//                 {LOCATIONS.map((loc) => (
//                   <SelectItem key={loc.value} value={loc.value}>
//                     {loc.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-2">
//             <Button onClick={handleProfileSubmit} disabled={isSaving}>
//               {isSaving ? "Saving..." : "Save Changes"}
//             </Button>
//             <Button type="button" variant="outline" onClick={handleResetSettings}>
//               Reset to Defaults
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Display Preferences */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Display Preferences</CardTitle>
//           <CardDescription>Configure how you want to view data</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {[
//             {
//               key: "emailNotifications",
//               title: "Show Email Notifications",
//               description: "Display notification indicators in the interface",
//             },
//             {
//               key: "priceAlerts",
//               title: "Price Alerts",
//               description: "Highlight products with significant rating changes",
//             },
//             {
//               key: "trendAlerts",
//               title: "Trend Alerts",
//               description: "Highlight trending products in dashboard",
//             },
//           ].map((pref) => (
//             <div
//               key={pref.key}
//               className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
//             >
//               <div>
//                 <Label>{pref.title}</Label>
//                 <p className="text-sm text-muted-foreground">{pref.description}</p>
//               </div>
//               <Switch
//                 checked={(preferences as any)[pref.key]}
//                 onCheckedChange={handlePreferenceChange(pref.key)}
//               />
//             </div>
//           ))}
//         </CardContent>
//       </Card>

//       {/* Target Market */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Target Market Focus</CardTitle>
//           <CardDescription>Choose your primary market focus</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Select
//             value={preferences.targetMarket}
//             onValueChange={(value) =>
//               setPreferences((prev) => ({ ...prev, targetMarket: value }))
//             }
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select target market" />
//             </SelectTrigger>
//             <SelectContent>
//               {TARGET_MARKETS.map((market) => (
//                 <SelectItem key={market.value} value={market.value}>
//                   {market.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </CardContent>
//       </Card>

//       {/* Account Info Card */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Account Information</CardTitle>
//           <CardDescription>Your account details and subscription</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-muted-foreground">Account ID</span>
//             <Badge variant="outline">{user.id}</Badge>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-muted-foreground">Subscription</span>
//             <Badge>
//               {user.subscriptionTier
//                 ? `${user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan`
//                 : "Free Plan"
//               }
//             </Badge>
//           </div>
//           {user.createdAt && (
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-muted-foreground">Member Since</span>
//               <span className="text-sm">
//                 {new Date(user.createdAt).toLocaleDateString()}
//               </span>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LOCATIONS } from "@/lib/locations";

const TARGET_MARKETS = [
  { value: "national", label: "India (National)" },
  { value: "regional", label: "Regional (West India)" },
  { value: "local", label: "Local (Mumbai Metro)" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com";

export default function Settings() {
  const { toast } = useToast();
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
    location: "",
    mobileNumber: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    priceAlerts: true,
    trendAlerts: false,
    targetMarket: "national",
    shareUsageData: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        businessName: user.businessName || "",
        location: user.location || "",
        mobileNumber: user.mobileNumber || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.mobileNumber) {
      toast({ title: "Mobile number required", description: "Please enter your mobile number.", variant: "destructive" });
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(profileData.mobileNumber.replace(/\s+/g, ""))) {
      toast({ title: "Invalid mobile number", description: "Enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }

    if (!user?.id) {
      toast({ title: "Authentication required", description: "Please login again to update your profile", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          business_name: profileData.businessName,
          location: profileData.location,
          mobile_number: profileData.mobileNumber.replace(/\s+/g, ""),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      await refreshUser();

      toast({ title: "Settings saved successfully!", description: "Your profile has been updated." });
    } catch (error: any) {
      toast({ title: "Couldn't save changes", description: "Please try again — previous settings are intact.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLocationChange = (value: string) => {
    setProfileData((prev) => ({ ...prev, location: value }));
  };

  const handlePreferenceChange = (field: string) => (checked: boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: checked }));
  };

  const handleResetSettings = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        businessName: user.businessName || "",
        location: user.location || "",
        mobileNumber: user.mobileNumber || "",
      });
    }
    setPreferences({ emailNotifications: true, priceAlerts: true, trendAlerts: false, targetMarket: "national", shareUsageData: true });
    toast({ title: "Settings reset", description: "Preferences have been reset to defaults." });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to access settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/login"} className="w-full">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Profile Settings
            <Badge variant="secondary">Session Authenticated</Badge>
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={profileData.firstName} onChange={handleInputChange("firstName")} />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={profileData.lastName} onChange={handleInputChange("lastName")} />
            </div>
          </div>

          {/* Email + Business Name row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profileData.email} onChange={handleInputChange("email")} />
            </div>
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" value={profileData.businessName} onChange={handleInputChange("businessName")} placeholder="Optional" />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 border rounded-md bg-muted text-muted-foreground text-sm">+91</span>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={handleInputChange("mobileNumber")}
                  placeholder="98765 43210"
                  maxLength={10}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">10-digit Indian mobile number</p>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label>Primary Location</Label>
            <Select value={profileData.location} onValueChange={handleLocationChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select state or city" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleProfileSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={handleResetSettings}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>Configure how you want to view data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { key: "emailNotifications", title: "Show Email Notifications", description: "Display notification indicators in the interface" },
            { key: "priceAlerts", title: "Price Alerts", description: "Highlight products with significant rating changes" },
            { key: "trendAlerts", title: "Trend Alerts", description: "Highlight trending products in dashboard" },
          ].map((pref) => (
            <div key={pref.key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <Label>{pref.title}</Label>
                <p className="text-sm text-muted-foreground">{pref.description}</p>
              </div>
              <Switch checked={(preferences as any)[pref.key]} onCheckedChange={handlePreferenceChange(pref.key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Target Market */}
      <Card>
        <CardHeader>
          <CardTitle>Target Market Focus</CardTitle>
          <CardDescription>Choose your primary market focus</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={preferences.targetMarket} onValueChange={(value) => setPreferences((prev) => ({ ...prev, targetMarket: value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select target market" />
            </SelectTrigger>
            <SelectContent>
              {TARGET_MARKETS.map((market) => (
                <SelectItem key={market.value} value={market.value}>{market.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account ID</span>
            <Badge variant="outline">{user.id}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Mobile</span>
            <span className="text-sm">+91 {user.mobileNumber || "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subscription</span>
            <Badge>
              {user.subscriptionTier
                ? `${user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan`
                : "Free Plan"}
            </Badge>
          </div>
          {user.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}