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

// 
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
import { API_BASE_URL } from "@/lib/config";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TARGET_MARKETS = [
  { value: "national", label: "India (National)" },
  { value: "regional", label: "Regional (West India)" },
  { value: "local", label: "Local (Mumbai Metro)" },
];


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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // --- DPDP Compliance State ---
  const [consents, setConsents] = useState<any[]>([]);
  const [consentsLoading, setConsentsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete account");
      }

      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated. Your personal data will be permanently deleted within 30 days per our retention policy.",
      });

      // Clear auth state and redirect
      window.location.href = "/signup";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion failed",
        description: error.message || "Could not delete your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteConfirmText("");
    }
  };

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

  const fetchSessions = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/sessions`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSessions(data.sessions || []);
        }
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchConsents = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me/consents`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setConsents(data);
      }
    } catch (error) {
      console.error("Error fetching consents:", error);
    } finally {
      setConsentsLoading(false);
    }
  };

  const handleToggleConsent = async (consentType: string, newStatus: boolean) => {
    try {
      // Optimistic UI update
      setConsents(prev => 
        prev.map(c => c.consent_type === consentType ? { ...c, status: newStatus } : c)
      );
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me/consents`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consents: [{ consent_type: consentType, status: newStatus }]
        }),
      });

      if (!response.ok) throw new Error("Failed to update consent");
      
      toast({
        title: "Preferences Updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error) {
      console.error("Error updating consent:", error);
      toast({
        title: "Update Failed",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
      fetchConsents(); // Revert on error
    }
  };

  const handleDownloadData = async () => {
    if (!user?.id) return;
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/data/export`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const errText = await response.text();
        console.error("Export data failed on backend:", errText);
        throw new Error(`Failed to export data: ${errText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Your data has been downloaded securely.",
      });
    } catch (error) {
      console.error("Error downloading data:", error);
      toast({
        title: "Export Failed",
        description: "Could not export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRevokeSession = async (token: string) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/sessions/${token}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to revoke session");
      }
      toast({
        title: "Session revoked",
        description: "The device has been successfully logged out.",
      });
      fetchSessions();
    } catch (error: any) {
      console.error("Error revoking session:", error);
      toast({
        title: "Revocation failed",
        description: error.message || "Could not log out the device.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSessions();
      fetchConsents();
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
              <Input id="email" type="email" value={profileData.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed directly for security. Please contact support.</p>
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
          {user.subscriptionTier !== "free" && user.subscriptionExpiresAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Plan Expires On</span>
              <span className="text-sm font-medium">
                {new Date(user.subscriptionExpiresAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
          {user.createdAt && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          )}

          {/* Active Sessions Section */}
          <div className="border-t pt-4 mt-6">
            <h4 className="text-sm font-semibold mb-3">Active Sessions</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Devices currently logged into your account. You can log out of any session to keep your account secure.
            </p>
            
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">No active sessions found.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.session_token}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{session.device}</span>
                        {session.is_current ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20 text-[10px] px-1.5 py-0.25">
                            Current Session
                          </Badge>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                        <span>Location: {session.location}</span>
                        {session.created_at && (
                          <>
                            <span>•</span>
                            <span>Logged in: {new Date(session.created_at).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {!session.is_current && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                            Log out
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Log out of device?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This device will be immediately logged out of your account. Any unsaved progress on that device will be lost.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevokeSession(session.session_token)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Log Out Device
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy & Consents */}
          <div className="border-t pt-4 mt-6">
            <h4 className="text-sm font-semibold mb-3">Privacy & Consents</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Manage your legal agreements and privacy preferences.
            </p>
            {consentsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : consents.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">No consent records found.</p>
            ) : (
              <div className="space-y-4">
                {consents.map((consent, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border rounded-lg bg-card shadow-sm">
                    <div>
                      <Label className="capitalize">{consent.consent_type.replace(/_/g, ' ')}</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Recorded on: {consent.created_at ? new Date(consent.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <Switch 
                      checked={consent.status} 
                      onCheckedChange={(checked) => handleToggleConsent(consent.consent_type, checked)}
                      disabled={consent.consent_type === "terms_of_service" || consent.consent_type === "privacy_policy" || consent.consent_type === "data_processing"}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Portability */}
          <div className="border-t pt-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold">Download My Data</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Export a copy of all your personal data in JSON format.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadData} disabled={isDownloading}>
                {isDownloading ? "Downloading..." : "Export Data"}
              </Button>
            </div>
          </div>

          {/* Clean and Simple Danger Zone Row */}
          <div className="border-t pt-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-destructive">Delete Account</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all associated data.</p>
              </div>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) setDeleteConfirmText("");
              }}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" type="button">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <span>
                        This will immediately deactivate your account and cancel all active subscriptions. Your personal data will be permanently and irreversibly deleted from our servers within 30 days, in accordance with our DPDP data retention policy.
                      </span>
                      <span className="block font-medium text-foreground mt-2">
                        Please type <span className="font-mono bg-muted px-1.5 py-0.5 rounded border border-destructive/20 text-destructive font-bold">DELETE</span> to confirm:
                      </span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-4">
                    <Input
                      placeholder="Type DELETE"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="border-destructive/30 focus-visible:ring-destructive"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirmText !== "DELETE" || isDeleting}
                      onClick={handleDeleteAccount}
                    >
                      {isDeleting ? "Deleting..." : "Permanently Delete"}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}