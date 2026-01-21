// import { useState } from "react";
// import Sidebar from "@/components/layout/sidebar";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
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

// export default function Settings() {
//   const { toast } = useToast();
  
//   // Local state only - no backend API calls since your backend doesn't have user endpoints
//   const [profileData, setProfileData] = useState({
//     firstName: "Demo",
//     lastName: "User",
//     email: "demo@example.com",
//     businessName: "Demo Store",
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

//   const handleProfileSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Simulate saving with local storage
//     setIsSaving(true);
    
//     setTimeout(() => {
//       // Save to localStorage for persistence
//       localStorage.setItem('userProfile', JSON.stringify(profileData));
//       localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
//       setIsSaving(false);
//       toast({
//         title: "Settings saved",
//         description: "Your preferences have been saved locally.",
//       });
//     }, 500);
//   };

//   const handleInputChange = (field: string) => (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setProfileData(prev => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleLocationChange = (value: string) => {
//     setProfileData(prev => ({ ...prev, location: value }));
//   };

//   const handlePreferenceChange = (field: string) => (checked: boolean) => {
//     setPreferences(prev => ({ ...prev, [field]: checked }));
//   };

//   const handleExportData = async () => {
//     try {
//       // Export reviews data from your backend
//       const response = await fetch('https://api.insydz.com/Amazon_Reviews/reviews?limit=1000');
//       const data = await response.json();
      
//       // Create CSV or JSON file
//       const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `amazon-reviews-export-${new Date().toISOString()}.json`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
      
//       toast({
//         title: "Data exported",
//         description: "Your reviews data has been downloaded.",
//       });
//     } catch (error) {
//       toast({
//         title: "Export failed",
//         description: "Failed to export data. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleResetSettings = () => {
//     setProfileData({
//       firstName: "Demo",
//       lastName: "User",
//       email: "demo@example.com",
//       businessName: "Demo Store",
//       location: "mumbai",
//     });
    
//     setPreferences({
//       emailNotifications: true,
//       priceAlerts: true,
//       trendAlerts: false,
//       targetMarket: "national",
//       shareUsageData: true,
//     });
    
//     localStorage.removeItem('userProfile');
//     localStorage.removeItem('userPreferences');
    
//     toast({
//       title: "Settings reset",
//       description: "All settings have been reset to defaults.",
//     });
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Sidebar />
      
//       <div className="ml-64 min-h-screen">
//         {/* Header */}
//         <header className="bg-card border-b border-border px-6 py-4">
//           <div>
//             <h2 className="text-xl font-semibold" data-testid="text-pageTitle">
//               Settings
//             </h2>
//             <p className="text-sm text-muted-foreground">
//               Manage your preferences and configurations
//             </p>
//           </div>
//         </header>

//         <div className="p-6">
//           <div className="max-w-4xl mx-auto space-y-6">
//             {/* Info Banner */}
//             <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
//               <CardContent className="pt-6">
//                 <p className="text-sm text-blue-800 dark:text-blue-200">
//                   <strong>Note:</strong> Settings are saved locally in your browser. 
//                   Your backend focuses on Amazon Reviews data and doesn't include user management.
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Profile Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center justify-between">
//                   Profile Settings
//                   <Badge variant="secondary">Local Storage</Badge>
//                 </CardTitle>
//                 <CardDescription>
//                   Update your personal information (saved locally)
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleProfileSubmit} className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="firstName">First Name</Label>
//                       <Input
//                         id="firstName"
//                         value={profileData.firstName}
//                         onChange={handleInputChange("firstName")}
//                         data-testid="input-firstName"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="lastName">Last Name</Label>
//                       <Input
//                         id="lastName"
//                         value={profileData.lastName}
//                         onChange={handleInputChange("lastName")}
//                         data-testid="input-lastName"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={profileData.email}
//                         onChange={handleInputChange("email")}
//                         data-testid="input-email"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="businessName">Business Name</Label>
//                       <Input
//                         id="businessName"
//                         value={profileData.businessName}
//                         onChange={handleInputChange("businessName")}
//                         data-testid="input-businessName"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Primary Location</Label>
//                     <Select value={profileData.location} onValueChange={handleLocationChange}>
//                       <SelectTrigger data-testid="select-location">
//                         <SelectValue placeholder="Select your location" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {LOCATIONS.map((location) => (
//                           <SelectItem key={location.value} value={location.value}>
//                             {location.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button 
//                       type="submit" 
//                       disabled={isSaving}
//                       data-testid="button-save-profile"
//                     >
//                       {isSaving ? "Saving..." : "Save Changes"}
//                     </Button>
//                     <Button 
//                       type="button"
//                       variant="outline"
//                       onClick={handleResetSettings}
//                     >
//                       Reset to Defaults
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>

//             {/* Display Preferences */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Display Preferences</CardTitle>
//                 <CardDescription>
//                   Configure how you want to view data
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Show Email Notifications</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Display notification indicators in the interface
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.emailNotifications}
//                     onCheckedChange={handlePreferenceChange("emailNotifications")}
//                     data-testid="switch-email-notifications"
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Price Alerts</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Highlight products with significant rating changes
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.priceAlerts}
//                     onCheckedChange={handlePreferenceChange("priceAlerts")}
//                     data-testid="switch-price-alerts"
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Trend Alerts</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Highlight trending products in dashboard
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.trendAlerts}
//                     onCheckedChange={handlePreferenceChange("trendAlerts")}
//                     data-testid="switch-trend-alerts"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Target Market */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Target Market Focus</CardTitle>
//                 <CardDescription>
//                   Choose your primary market focus
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Target Market</Label>
//                   <Select 
//                     value={preferences.targetMarket} 
//                     onValueChange={(value) => setPreferences(prev => ({ ...prev, targetMarket: value }))}
//                   >
//                     <SelectTrigger data-testid="select-target-market">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {TARGET_MARKETS.map((market) => (
//                         <SelectItem key={market.value} value={market.value}>
//                           {market.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Data Export */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Data Management</CardTitle>
//                 <CardDescription>
//                   Export your Amazon reviews data
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <Button 
//                     variant="outline"
//                     onClick={handleExportData}
//                     data-testid="button-export-data"
//                   >
//                     Export Reviews Data (JSON)
//                   </Button>
                  
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       toast({
//                         title: "API Documentation",
//                         description: "Access API docs at https://api.insydz.com/docs",
//                       });
//                       window.open('https://api.insydz.com/docs', '_blank');
//                     }}
//                   >
//                     View API Documentation
//                   </Button>
//                 </div>
                
//                 <p className="text-sm text-muted-foreground">
//                   Export data directly from your Amazon Reviews database via the API
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Backend Info */}
//             <Card className="bg-muted/50">
//               <CardHeader>
//                 <CardTitle className="text-lg">Backend Connection</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">API Endpoint:</span>
//                   <span className="font-mono">https://api.insydz.com</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Database:</span>
//                   <span className="font-mono">Amazon_Reviews</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Available Endpoints:</span>
//                   <span>/Amazon_Reviews/*</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import Sidebar from "@/components/layout/sidebar";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
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

// export default function Settings() {
//   const { toast } = useToast();
  
//   // Local state only - no backend API calls since your backend doesn't have user endpoints
//   const [profileData, setProfileData] = useState({
//     firstName: "Demo",
//     lastName: "User",
//     email: "demo@example.com",
//     businessName: "Demo Store",
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

//   const handleProfileSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Simulate saving with local storage
//     setIsSaving(true);
    
//     setTimeout(() => {
//       // Save to localStorage for persistence
//       localStorage.setItem('userProfile', JSON.stringify(profileData));
//       localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
//       setIsSaving(false);
//       toast({
//         title: "Settings saved",
//         description: "Your preferences have been saved locally.",
//       });
//     }, 500);
//   };

//   const handleInputChange = (field: string) => (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setProfileData(prev => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleLocationChange = (value: string) => {
//     setProfileData(prev => ({ ...prev, location: value }));
//   };

//   const handlePreferenceChange = (field: string) => (checked: boolean) => {
//     setPreferences(prev => ({ ...prev, [field]: checked }));
//   };

//   const handleResetSettings = () => {
//     setProfileData({
//       firstName: "Demo",
//       lastName: "User",
//       email: "demo@example.com",
//       businessName: "Demo Store",
//       location: "mumbai",
//     });
    
//     setPreferences({
//       emailNotifications: true,
//       priceAlerts: true,
//       trendAlerts: false,
//       targetMarket: "national",
//       shareUsageData: true,
//     });
    
//     localStorage.removeItem('userProfile');
//     localStorage.removeItem('userPreferences');
    
//     toast({
//       title: "Settings reset",
//       description: "All settings have been reset to defaults.",
//     });
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Sidebar />
      
//       <div className="ml-64 min-h-screen">
//         {/* Header */}
//         <header className="bg-card border-b border-border px-6 py-4">
//           <div>
//             <h2 className="text-xl font-semibold" data-testid="text-pageTitle">
//               Settings
//             </h2>
//             <p className="text-sm text-muted-foreground">
//               Manage your preferences and configurations
//             </p>
//           </div>
//         </header>

//         <div className="p-6">
//           <div className="max-w-4xl mx-auto space-y-6">
//             {/* Info Banner */}
//             <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
//               <CardContent className="pt-6">
//                 <p className="text-sm text-blue-800 dark:text-blue-200">
//                   <strong>Note:</strong> Settings are saved locally in your browser. 
//                   Your backend focuses on Amazon Reviews data and doesn't include user management.
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Profile Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center justify-between">
//                   Profile Settings
//                   <Badge variant="secondary">Local Storage</Badge>
//                 </CardTitle>
//                 <CardDescription>
//                   Update your personal information (saved locally)
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleProfileSubmit} className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="firstName">First Name</Label>
//                       <Input
//                         id="firstName"
//                         value={profileData.firstName}
//                         onChange={handleInputChange("firstName")}
//                         data-testid="input-firstName"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="lastName">Last Name</Label>
//                       <Input
//                         id="lastName"
//                         value={profileData.lastName}
//                         onChange={handleInputChange("lastName")}
//                         data-testid="input-lastName"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={profileData.email}
//                         onChange={handleInputChange("email")}
//                         data-testid="input-email"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="businessName">Business Name</Label>
//                       <Input
//                         id="businessName"
//                         value={profileData.businessName}
//                         onChange={handleInputChange("businessName")}
//                         data-testid="input-businessName"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Primary Location</Label>
//                     <Select value={profileData.location} onValueChange={handleLocationChange}>
//                       <SelectTrigger data-testid="select-location">
//                         <SelectValue placeholder="Select your location" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {LOCATIONS.map((location) => (
//                           <SelectItem key={location.value} value={location.value}>
//                             {location.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button 
//                       type="submit" 
//                       disabled={isSaving}
//                       data-testid="button-save-profile"
//                     >
//                       {isSaving ? "Saving..." : "Save Changes"}
//                     </Button>
//                     <Button 
//                       type="button"
//                       variant="outline"
//                       onClick={handleResetSettings}
//                     >
//                       Reset to Defaults
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>

//             {/* Display Preferences */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Display Preferences</CardTitle>
//                 <CardDescription>
//                   Configure how you want to view data
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Show Email Notifications</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Display notification indicators in the interface
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.emailNotifications}
//                     onCheckedChange={handlePreferenceChange("emailNotifications")}
//                     data-testid="switch-email-notifications"
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Price Alerts</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Highlight products with significant rating changes
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.priceAlerts}
//                     onCheckedChange={handlePreferenceChange("priceAlerts")}
//                     data-testid="switch-price-alerts"
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Trend Alerts</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Highlight trending products in dashboard
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.trendAlerts}
//                     onCheckedChange={handlePreferenceChange("trendAlerts")}
//                     data-testid="switch-trend-alerts"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Target Market */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Target Market Focus</CardTitle>
//                 <CardDescription>
//                   Choose your primary market focus
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Target Market</Label>
//                   <Select 
//                     value={preferences.targetMarket} 
//                     onValueChange={(value) => setPreferences(prev => ({ ...prev, targetMarket: value }))}
//                   >
//                     <SelectTrigger data-testid="select-target-market">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {TARGET_MARKETS.map((market) => (
//                         <SelectItem key={market.value} value={market.value}>
//                           {market.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import Sidebar from "@/components/layout/sidebar";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
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

// const API_BASE_URL = "https://api.insydz.com";

// export default function Settings() {
//   const { toast } = useToast();
  
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
//   const [isLoading, setIsLoading] = useState(true);
//   const [userId, setUserId] = useState<string | null>(null);

//   // Load user data on mount
//   useEffect(() => {
//     const loadUserData = () => {
//       try {
//         // Get user from localStorage (set during login/signup)
//         const userStr = localStorage.getItem('user');
        
//         if (userStr) {
//           const user = JSON.parse(userStr);
          
//           // Extract first and last name from full name
//           const nameParts = user.name?.split(' ') || [];
//           const firstName = nameParts[0] || '';
//           const lastName = nameParts.slice(1).join(' ') || '';
          
//           setProfileData({
//             firstName: firstName,
//             lastName: lastName,
//             email: user.email || '',
//             businessName: user.businessName || '',
//             location: user.location || 'mumbai',
//           });
          
//           setUserId(user.id);
//         }
        
//         // Load preferences from localStorage
//         const prefsStr = localStorage.getItem('userPreferences');
//         if (prefsStr) {
//           setPreferences(JSON.parse(prefsStr));
//         }
//       } catch (error) {
//         console.error('Error loading user data:', error);
//         toast({
//           title: "Error loading data",
//           description: "Could not load your profile data",
//           variant: "destructive"
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     loadUserData();
//   }, [toast]);

//   const handleProfileSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSaving(true);

//     try {
//       if (!userId) {
//         throw new Error("User ID not found. Please login again.");
//       }

//       // Update backend
//       const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           first_name: profileData.firstName,
//           last_name: profileData.lastName,
//           email: profileData.email,
//           business_name: profileData.businessName,
//           location: profileData.location,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update profile");
//       }

//       const updatedUser = await response.json();

//       // Update localStorage with new data
//       const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
//       const updatedUserData = {
//         ...currentUser,
//         name: `${updatedUser.first_name} ${updatedUser.last_name}`,
//         email: updatedUser.email,
//         businessName: updatedUser.business_name,
//         location: updatedUser.location,
//       };
      
//       localStorage.setItem('user', JSON.stringify(updatedUserData));
//       localStorage.setItem('userPreferences', JSON.stringify(preferences));

//       toast({
//         title: "Settings saved successfully!",
//         description: "Your profile has been updated.",
//       });
//     } catch (error: any) {
//       console.error('Error saving profile:', error);
//       toast({
//         title: "Failed to save",
//         description: error.message || "Could not update your profile. Please try again.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleInputChange = (field: string) => (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setProfileData(prev => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleLocationChange = (value: string) => {
//     setProfileData(prev => ({ ...prev, location: value }));
//   };

//   const handlePreferenceChange = (field: string) => (checked: boolean) => {
//     setPreferences(prev => ({ ...prev, [field]: checked }));
//   };

//   const handleResetSettings = () => {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       const user = JSON.parse(userStr);
//       const nameParts = user.name?.split(' ') || [];
      
//       setProfileData({
//         firstName: nameParts[0] || '',
//         lastName: nameParts.slice(1).join(' ') || '',
//         email: user.email || '',
//         businessName: user.businessName || '',
//         location: user.location || 'mumbai',
//       });
//     }
    
//     setPreferences({
//       emailNotifications: true,
//       priceAlerts: true,
//       trendAlerts: false,
//       targetMarket: "national",
//       shareUsageData: true,
//     });
    
//     localStorage.setItem('userPreferences', JSON.stringify({
//       emailNotifications: true,
//       priceAlerts: true,
//       trendAlerts: false,
//       targetMarket: "national",
//       shareUsageData: true,
//     }));
    
//     toast({
//       title: "Settings reset",
//       description: "Preferences have been reset to defaults.",
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Sidebar />
//         <div className="ml-64 min-h-screen flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//             <p className="text-muted-foreground">Loading your settings...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Sidebar />
      
//       <div className="ml-64 min-h-screen">
//         <header className="bg-card border-b border-border px-6 py-4">
//           <div>
//             <h2 className="text-xl font-semibold" data-testid="text-pageTitle">
//               Settings
//             </h2>
//             <p className="text-sm text-muted-foreground">
//               Manage your preferences and configurations
//             </p>
//           </div>
//         </header>

//         <div className="p-6">
//           <div className="max-w-4xl mx-auto space-y-6">
//             <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
//               <CardContent className="pt-6">
//                 <p className="text-sm text-blue-800 dark:text-blue-200">
//                   <strong>💡 Info:</strong> Your profile data is synced with the backend database. 
//                   Changes made here will be saved to your account.
//                 </p>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center justify-between">
//                   Profile Settings
//                   <Badge variant="secondary">Synced with Backend</Badge>
//                 </CardTitle>
//                 <CardDescription>
//                   Update your personal information
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="firstName">First Name</Label>
//                       <Input
//                         id="firstName"
//                         value={profileData.firstName}
//                         onChange={handleInputChange("firstName")}
//                         data-testid="input-firstName"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="lastName">Last Name</Label>
//                       <Input
//                         id="lastName"
//                         value={profileData.lastName}
//                         onChange={handleInputChange("lastName")}
//                         data-testid="input-lastName"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={profileData.email}
//                         onChange={handleInputChange("email")}
//                         data-testid="input-email"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="businessName">Business Name</Label>
//                       <Input
//                         id="businessName"
//                         value={profileData.businessName}
//                         onChange={handleInputChange("businessName")}
//                         data-testid="input-businessName"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Primary Location</Label>
//                     <Select value={profileData.location} onValueChange={handleLocationChange}>
//                       <SelectTrigger data-testid="select-location">
//                         <SelectValue placeholder="Select your location" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {LOCATIONS.map((location) => (
//                           <SelectItem key={location.value} value={location.value}>
//                             {location.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="flex gap-2">
//                     <Button 
//                       onClick={handleProfileSubmit}
//                       disabled={isSaving}
//                       data-testid="button-save-profile"
//                     >
//                       {isSaving ? "Saving..." : "Save Changes"}
//                     </Button>
//                     <Button 
//                       type="button"
//                       variant="outline"
//                       onClick={handleResetSettings}
//                     >
//                       Reset to Defaults
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Display Preferences</CardTitle>
//                 <CardDescription>
//                   Configure how you want to view data
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Show Email Notifications</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Display notification indicators in the interface
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.emailNotifications}
//                     onCheckedChange={handlePreferenceChange("emailNotifications")}
//                     data-testid="switch-email-notifications"
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Price Alerts</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Highlight products with significant rating changes
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.priceAlerts}
//                     onCheckedChange={handlePreferenceChange("priceAlerts")}
//                     data-testid="switch-price-alerts"
//                   />
//                 </div>

//                 <Separator />

//                 <div className="flex items-center justify-between">
//                   <div className="space-y-1">
//                     <Label className="text-sm font-medium">Trend Alerts</Label>
//                     <p className="text-sm text-muted-foreground">
//                       Highlight trending products in dashboard
//                     </p>
//                   </div>
//                   <Switch
//                     checked={preferences.trendAlerts}
//                     onCheckedChange={handlePreferenceChange("trendAlerts")}
//                     data-testid="switch-trend-alerts"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Target Market Focus</CardTitle>
//                 <CardDescription>
//                   Choose your primary market focus
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label>Target Market</Label>
//                   <Select 
//                     value={preferences.targetMarket} 
//                     onValueChange={(value) => setPreferences(prev => ({ ...prev, targetMarket: value }))}
//                   >
//                     <SelectTrigger data-testid="select-target-market">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {TARGET_MARKETS.map((market) => (
//                         <SelectItem key={market.value} value={market.value}>
//                           {market.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import Sidebar from "@/components/layout/sidebar";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { Menu, X } from "lucide-react";

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

// const API_BASE_URL = "https://api.insydz.com";

// export default function Settings() {
//   const { toast } = useToast();

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
//   const [isLoading, setIsLoading] = useState(true);
//   const [userId, setUserId] = useState<string | null>(null);

//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   // Load user data
//   useEffect(() => {
//     try {
//       const userStr = localStorage.getItem("user");
//       if (userStr) {
//         const user = JSON.parse(userStr);
//         const nameParts = user.name?.split(" ") || [];
//         setProfileData({
//           firstName: nameParts[0] || "",
//           lastName: nameParts.slice(1).join(" ") || "",
//           email: user.email || "",
//           businessName: user.businessName || "",
//           location: user.location || "mumbai",
//         });
//         setUserId(user.id);
//       }

//       const prefsStr = localStorage.getItem("userPreferences");
//       if (prefsStr) setPreferences(JSON.parse(prefsStr));
//     } catch (error) {
//       console.error("Error loading user data:", error);
//       toast({
//         title: "Error loading data",
//         description: "Could not load your profile data",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [toast]);

//   // Handlers
//   const handleProfileSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSaving(true);
//     try {
//       if (!userId) throw new Error("User ID not found. Please login again.");

//       const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           first_name: profileData.firstName,
//           last_name: profileData.lastName,
//           email: profileData.email,
//           business_name: profileData.businessName,
//           location: profileData.location,
//         }),
//       });

//       if (!response.ok) throw new Error("Failed to update profile");

//       const updatedUser = await response.json();
//       const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
//       localStorage.setItem(
//         "user",
//         JSON.stringify({
//           ...currentUser,
//           name: `${updatedUser.first_name} ${updatedUser.last_name}`,
//           email: updatedUser.email,
//           businessName: updatedUser.business_name,
//           location: updatedUser.location,
//         })
//       );
//       localStorage.setItem("userPreferences", JSON.stringify(preferences));

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
//     const userStr = localStorage.getItem("user");
//     if (userStr) {
//       const user = JSON.parse(userStr);
//       const nameParts = user.name?.split(" ") || [];
//       setProfileData({
//         firstName: nameParts[0] || "",
//         lastName: nameParts.slice(1).join(" ") || "",
//         email: user.email || "",
//         businessName: user.businessName || "",
//         location: user.location || "mumbai",
//       });
//     }

//     setPreferences({
//       emailNotifications: true,
//       priceAlerts: true,
//       trendAlerts: false,
//       targetMarket: "national",
//       shareUsageData: true,
//     });

//     localStorage.setItem(
//       "userPreferences",
//       JSON.stringify({
//         emailNotifications: true,
//         priceAlerts: true,
//         trendAlerts: false,
//         targetMarket: "national",
//         shareUsageData: true,
//       })
//     );

//     toast({
//       title: "Settings reset",
//       description: "Preferences have been reset to defaults.",
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading your settings...</p>
//         </div>
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
//                 <X className="w-6 h-6" />
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
//         <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg 
//           rounded-none sm:rounded-2xl 
//           px-4 sm:px-6 lg:px-8 
//           py-4 sm:py-5 
//           mb-4 sm:mb-6 
//           flex flex-col sm:flex-row items-start sm:items-center 
//           justify-between gap-4 sm:gap-0 
//           sticky top-0 sm:top-4 
//           z-20 mx-0 sm:mx-6">
//           <div className="flex items-center gap-3 w-full sm:w-auto">
//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setIsMobileMenuOpen(true)}
//               className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
//             >
//               <Menu className="w-5 h-5 text-sky-900" />
//             </button>

//             <div className="flex-1 sm:flex-none">
//               <h2 className="text-xl sm:text-2xl font-bold text-sky-900 flex items-center gap-2">
//                 Settings
//               </h2>
//               <p className="text-slate-600 text-xs sm:text-sm">
//                 Manage your preferences and profile
//               </p>
//             </div>
//           </div>
//         </header>

//         {/* Main Form Content */}
//         <main className="px-4 sm:px-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto pb-6">
//           {/* Profile Card */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center justify-between">
//                 Profile Settings
//                 <Badge variant="secondary">Synced with Backend</Badge>
//               </CardTitle>
//               <CardDescription>Update your personal information</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     value={profileData.firstName}
//                     onChange={handleInputChange("firstName")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     value={profileData.lastName}
//                     onChange={handleInputChange("lastName")}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={profileData.email}
//                     onChange={handleInputChange("email")}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="businessName">Business Name</Label>
//                   <Input
//                     id="businessName"
//                     value={profileData.businessName}
//                     onChange={handleInputChange("businessName")}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <Label>Primary Location</Label>
//                 <Select value={profileData.location} onValueChange={handleLocationChange}>
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select your location" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {LOCATIONS.map((loc) => (
//                       <SelectItem key={loc.value} value={loc.value}>
//                         {loc.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-2">
//                 <Button onClick={handleProfileSubmit} disabled={isSaving}>
//                   {isSaving ? "Saving..." : "Save Changes"}
//                 </Button>
//                 <Button type="button" variant="outline" onClick={handleResetSettings}>
//                   Reset to Defaults
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Display Preferences */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Display Preferences</CardTitle>
//               <CardDescription>Configure how you want to view data</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {["emailNotifications", "priceAlerts", "trendAlerts"].map((key) => (
//                 <div
//                   key={key}
//                   className="flex flex-col sm:flex-row items-center justify-between"
//                 >
//                   <div>
//                     <Label>
//                       {key === "emailNotifications"
//                         ? "Show Email Notifications"
//                         : key === "priceAlerts"
//                         ? "Price Alerts"
//                         : "Trend Alerts"}
//                     </Label>
//                     <p className="text-sm text-muted-foreground">
//                       {key === "emailNotifications"
//                         ? "Display notification indicators in the interface"
//                         : key === "priceAlerts"
//                         ? "Highlight products with significant rating changes"
//                         : "Highlight trending products in dashboard"}
//                     </p>
//                   </div>
//                   <Switch
//                     checked={(preferences as any)[key]}
//                     onCheckedChange={handlePreferenceChange(key)}
//                   />
//                 </div>
//               ))}
//             </CardContent>
//           </Card>

//           {/* Target Market */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Target Market Focus</CardTitle>
//               <CardDescription>Choose your primary market focus</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Select
//                 value={preferences.targetMarket}
//                 onValueChange={(value) =>
//                   setPreferences((prev) => ({ ...prev, targetMarket: value }))
//                 }
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Select target market" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {TARGET_MARKETS.map((market) => (
//                     <SelectItem key={market.value} value={market.value}>
//                       {market.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </CardContent>
//           </Card>
//         </main>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { useAuth } from "@/App";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";

const LOCATIONS = [
  { value: "mumbai", label: "Mumbai, India" },
  { value: "delhi", label: "Delhi, India" },
  { value: "bangalore", label: "Bangalore, India" },
  { value: "chennai", label: "Chennai, India" },
  { value: "kolkata", label: "Kolkata, India" },
  { value: "pune", label: "Pune, India" },
  { value: "hyderabad", label: "Hyderabad, India" },
  { value: "other", label: "Other" },
];

const TARGET_MARKETS = [
  { value: "national", label: "India (National)" },
  { value: "regional", label: "Regional (West India)" },
  { value: "local", label: "Local (Mumbai Metro)" },
];

const API_BASE_URL = "https://api.insydz.com";

export default function Settings() {
  const { toast } = useToast();
  const { user, refreshUser, isLoading: authLoading } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    businessName: "",
    location: "mumbai",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    priceAlerts: true,
    trendAlerts: false,
    targetMarket: "national",
    shareUsageData: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Load user data from auth context
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        businessName: user.businessName || "",
        location: user.location || "mumbai",
      });
    }
  }, [user]);

  // ✅ Handle profile update with session authentication
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please login again to update your profile",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "PUT",
        credentials: "include", // ✅ Include session cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
          business_name: profileData.businessName,
          location: profileData.location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      // ✅ Refresh user data in auth context
      await refreshUser();

      toast({
        title: "Settings saved successfully!",
        description: "Your profile has been updated.",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Failed to save",
        description: error.message || "Could not update your profile.",
        variant: "destructive",
      });
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
        location: user.location || "mumbai",
      });
    }

    const defaultPrefs = {
      emailNotifications: true,
      priceAlerts: true,
      trendAlerts: false,
      targetMarket: "national",
      shareUsageData: true,
    };

    setPreferences(defaultPrefs);

    toast({
      title: "Settings reset",
      description: "Preferences have been reset to defaults.",
    });
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to access settings</CardDescription>
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
                <X className="w-6 h-6" />
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
        <header className="bg-white/70 backdrop-blur-xl border border-sky-100 shadow-lg 
          rounded-none sm:rounded-2xl 
          px-4 sm:px-6 lg:px-8 
          py-4 sm:py-5 
          mb-4 sm:mb-6 
          flex flex-col sm:flex-row items-start sm:items-center 
          justify-between gap-4 sm:gap-0 
          sticky top-0 sm:top-4 
          z-20 mx-0 sm:mx-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-sky-900" />
            </button>

            <div className="flex-1 sm:flex-none">
              <h2 className="text-xl sm:text-2xl font-bold text-sky-900 flex items-center gap-2">
                Settings
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Manage your preferences and profile
              </p>
            </div>
          </div>

          {/* User Info Badge */}
          <Badge variant="secondary" className="hidden sm:flex">
            {user.email}
          </Badge>
        </header>

        {/* Main Form Content */}
        <main className="px-4 sm:px-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto pb-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange("firstName")}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange("lastName")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleInputChange("email")}
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={profileData.businessName}
                    onChange={handleInputChange("businessName")}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label>Primary Location</Label>
                <Select value={profileData.location} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
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
                {
                  key: "emailNotifications",
                  title: "Show Email Notifications",
                  description: "Display notification indicators in the interface",
                },
                {
                  key: "priceAlerts",
                  title: "Price Alerts",
                  description: "Highlight products with significant rating changes",
                },
                {
                  key: "trendAlerts",
                  title: "Trend Alerts",
                  description: "Highlight trending products in dashboard",
                },
              ].map((pref) => (
                <div
                  key={pref.key}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                >
                  <div>
                    <Label>{pref.title}</Label>
                    <p className="text-sm text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    checked={(preferences as any)[pref.key]}
                    onCheckedChange={handlePreferenceChange(pref.key)}
                  />
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
              <Select
                value={preferences.targetMarket}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, targetMarket: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target market" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_MARKETS.map((market) => (
                    <SelectItem key={market.value} value={market.value}>
                      {market.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Account Info Card */}
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
                <span className="text-sm text-muted-foreground">Subscription</span>
                <Badge>
                  {user.subscriptionTier 
                    ? `${user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan`
                    : "Free Plan"
                  }
                </Badge>
              </div>
              {user.createdAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}