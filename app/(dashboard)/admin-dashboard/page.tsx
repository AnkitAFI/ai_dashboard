// "use client";

// import { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";

// import { useAuth } from "@/lib/auth-context";
// import {
//   RefreshCw, Search, ArrowUpRight, ArrowDownRight,
//   Users, ShieldCheck, ShieldOff, Crown, TrendingUp,
//   Wallet, IndianRupee,
// } from "lucide-react";

// // const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "") || "syatharthdelhi@gmail.com";
// const TIER_PRICE: Record<string, number> = { free: 0, basic: 1999, premium: 2999 };

// const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
// const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

// interface Stats {
//   total_users: number; verified_users: number;
//   unverified_users: number; recent_signups_7days: number;
//   by_tier: { free: number; basic: number; premium: number };
// }
// interface UserRow {
//   id: number; first_name: string; last_name: string;
//   email: string; subscription_tier: "free" | "basic" | "premium";
//   is_verified: boolean; ai_chat_used: number; created_at: string;
// }

// export default function AdminDashboard() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [users, setUsers] = useState<UserRow[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [filterTier, setFilterTier] = useState("all");
//   const [lastUpd, setLastUpd] = useState(new Date());

//   useEffect(() => {
//     if (!user) return;
//     if (user.email !== ADMIN_EMAIL) { router.push("/dashboard"); return; }
//     fetchStats();
//   }, [user]);

//   const fetchStats = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { 
//         credentials: "include",
//         cache: 'no-store'
//       });
//       if (!res.ok) { router.push("/dashboard"); return; }
//       const data = await res.json();
//       setStats(data.stats); setUsers(data.users); setLastUpd(new Date());
//     } catch { router.push("/dashboard"); }
//     finally { setIsLoading(false); }
//   };

//   const basicCount = stats?.by_tier?.basic ?? 0;
//   const premiumCount = stats?.by_tier?.premium ?? 0;
//   const freeCount = stats?.by_tier?.free ?? 0;
//   const tierTotal = freeCount + basicCount + premiumCount;
//   const basicMRR = basicCount * TIER_PRICE.basic;
//   const premiumMRR = premiumCount * TIER_PRICE.premium;
//   const totalMRR = basicMRR + premiumMRR;
//   const paidUsers = basicCount + premiumCount;

//   const filtered = users.filter(u => {
//     const q = search.toLowerCase();
//     return (
//       (!q || u.email.toLowerCase().includes(q) ||
//         `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)) &&
//       (filterTier === "all" || u.subscription_tier === filterTier)
//     );
//   });

//   // â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//   if (isLoading) return (
//     <div style={{
//       display: "flex", flexDirection: "column", alignItems: "center",
//       justifyContent: "center", minHeight: "400px",
//       fontFamily: "Inter, sans-serif"
//     }}>
//       <div style={{
//         width: 38, height: 38, borderRadius: "50%",
//         border: "3px solid #e2e8f0", borderTop: "3px solid #6366f1",
//         animation: "spin 0.8s linear infinite"
//       }} />
//       <p style={{
//         marginTop: 14, color: "#94a3b8", fontSize: 13,
//         letterSpacing: "0.06em"
//       }}>Loading…</p>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   );

//   return (
//     <div className="space-y-8" style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#1e293b" }}>
//       <style>{CSS}</style>

//       {/* Page title & Refresh */}
//       <div className="flex justify-between items-start mb-4">
//         <div className="fade-in">
//           <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
//             Admin Overview
//           </h1>
//           <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
//             Welcome back — here's what's happening today.
//           </p>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//           <span style={{ fontSize: 11, color: "#94a3b8" }}>
//             Updated {lastUpd.toLocaleTimeString("en-IN",
//               { hour: "2-digit", minute: "2-digit" })}
//           </span>
//           <button onClick={fetchStats} className="hdr-btn">
//             <RefreshCw size={13} /> Refresh
//           </button>
//         </div>
//       </div>

//       {/* â”€â”€ KPI CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
//       <div className="kpi-grid fade-in" style={{ animationDelay: "0.04s" }}>
//         {([
//           {
//             label: "Total Users", value: stats?.total_users ?? 0,
//             sub: `+${stats?.recent_signups_7days ?? 0} this week`,
//             up: true, isRupee: false,
//             icon: <Users size={20} />,
//             grad: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             glow: "#6366f133",
//           },
//           {
//             label: "New (7 Days)", value: stats?.recent_signups_7days ?? 0,
//             sub: "recent signups", up: true, isRupee: false,
//             icon: <TrendingUp size={20} />,
//             grad: "linear-gradient(135deg,#06b6d4,#0284c7)",
//             glow: "#06b6d433",
//           },
//           {
//             label: "Verified", value: stats?.verified_users ?? 0,
//             sub: `${pct(stats?.verified_users ?? 0, stats?.total_users ?? 0)}% of total`,
//             up: true, isRupee: false,
//             icon: <ShieldCheck size={20} />,
//             grad: "linear-gradient(135deg,#10b981,#059669)",
//             glow: "#10b98133",
//           },
//           {
//             label: "Unverified", value: stats?.unverified_users ?? 0,
//             sub: "pending verification", up: false, isRupee: false,
//             icon: <ShieldOff size={20} />,
//             grad: "linear-gradient(135deg,#f59e0b,#ef4444)",
//             glow: "#f59e0b33",
//           },
//           {
//             label: "Monthly Revenue", value: totalMRR,
//             sub: `${paidUsers} paid users`, up: true, isRupee: true,
//             icon: <IndianRupee size={20} />,
//             grad: "linear-gradient(135deg,#10b981,#059669)",
//             glow: "#10b98133",
//           },
//           {
//             label: "Paid Users", value: paidUsers,
//             sub: `${pct(paidUsers, tierTotal)}% conversion`,
//             up: true, isRupee: false,
//             icon: <Wallet size={20} />,
//             grad: "linear-gradient(135deg,#f59e0b,#f97316)",
//             glow: "#f59e0b33",
//           },
//         ] as const).map((card, i) => (
//           <div key={i} className="kpi-card"
//             style={{ animationDelay: `${i * 0.05}s` }}>
//             <div style={{ flex: 1 }}>
//               <p style={{
//                 margin: "0 0 10px", fontSize: 11, fontWeight: 600,
//                 color: "#94a3b8", textTransform: "uppercase",
//                 letterSpacing: "0.1em"
//               }}>
//                 {card.label}
//               </p>
//               <p style={{
//                 margin: "0 0 10px",
//                 fontSize: card.isRupee ? 22 : 30,
//                 fontWeight: 700, color: "#1e293b", lineHeight: 1
//               }}>
//                 {card.isRupee
//                   ? "₹" + card.value.toLocaleString("en-IN")
//                   : card.value.toLocaleString("en-IN")}
//               </p>
//               <div style={{
//                 display: "flex", alignItems: "center", gap: 4,
//                 fontSize: 12,
//                 color: card.up ? "#10b981" : "#ef4444"
//               }}>
//                 {card.up
//                   ? <ArrowUpRight size={13} />
//                   : <ArrowDownRight size={13} />}
//                 <span>{card.sub}</span>
//               </div>
//             </div>
//             <div style={{
//               width: 52, height: 52, borderRadius: 14, flexShrink: 0,
//               background: card.grad,
//               display: "flex", alignItems: "center", justifyContent: "center",
//               color: "white",
//               boxShadow: `0 6px 18px ${card.glow}`,
//             }}>
//               {card.icon}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* â”€â”€ MIDDLE ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
//       <div className="mid-grid fade-in" style={{ animationDelay: "0.18s" }}>

//         {/* Tier Distribution */}
//         <div className="panel">
//           <PanelHead title="Tier Distribution"
//             sub="Users by subscription plan" />
//           <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
//             {([
//               {
//                 label: "Free", val: freeCount, color: "#94a3b8",
//                 bg: "#f1f5f9", border: "#e2e8f0"
//               },
//               {
//                 label: "Basic", val: basicCount, color: "#6366f1",
//                 bg: "#ede9fe", border: "#c4b5fd"
//               },
//               {
//                 label: "Premium", val: premiumCount, color: "#f59e0b",
//                 bg: "#fef3c7", border: "#fde68a"
//               },
//             ]).map(t => (
//               <div key={t.label} style={{
//                 flex: 1, padding: "14px 16px",
//                 background: t.bg, border: `1px solid ${t.border}`,
//                 borderRadius: 12,
//               }}>
//                 <p style={{
//                   margin: "0 0 6px", fontSize: 10, fontWeight: 600,
//                   color: t.color, letterSpacing: "0.1em",
//                   textTransform: "uppercase"
//                 }}>{t.label}</p>
//                 <p style={{
//                   margin: "0 0 3px", fontSize: 24,
//                   fontWeight: 700, color: "#1e293b"
//                 }}>{t.val}</p>
//                 <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
//                   {pct(t.val, tierTotal)}% of users
//                 </p>
//               </div>
//             ))}
//           </div>
//           {/* Stacked bar */}
//           <div style={{
//             height: 8, borderRadius: 6,
//             display: "flex", overflow: "hidden", gap: 2
//           }}>
//             <div style={{
//               width: `${pct(freeCount, tierTotal)}%`,
//               background: "#94a3b8", transition: "width 0.8s ease",
//               borderRadius: "6px 0 0 6px"
//             }} />
//             <div style={{
//               width: `${pct(basicCount, tierTotal)}%`,
//               background: "#6366f1", transition: "width 0.9s ease 0.05s"
//             }} />
//             <div style={{
//               width: `${pct(premiumCount, tierTotal)}%`,
//               background: "#f59e0b", transition: "width 1s ease 0.1s",
//               borderRadius: "0 6px 6px 0"
//             }} />
//           </div>
//           <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
//             {([["#94a3b8", "Free"], ["#6366f1", "Basic"],
//             ["#f59e0b", "Premium"]] as const).map(([c, l]) => (
//               <div key={l} style={{
//                 display: "flex", alignItems: "center",
//                 gap: 6, fontSize: 11, color: "#64748b"
//               }}>
//                 <div style={{
//                   width: 8, height: 8, borderRadius: 2,
//                   background: c
//                 }} />
//                 {l}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Revenue */}
//         <div className="panel">
//           <PanelHead title="Revenue" sub="Monthly & annual breakdown" />

//           <div style={{
//             background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
//             border: "1px solid #bbf7d0",
//             borderRadius: 12, padding: "16px 18px", marginBottom: 16,
//           }}>
//             <p style={{
//               margin: "0 0 5px", fontSize: 10, fontWeight: 600,
//               color: "#16a34a", letterSpacing: "0.14em",
//               textTransform: "uppercase"
//             }}>Monthly Recurring Revenue</p>
//             <p style={{
//               margin: 0, fontSize: 28, fontWeight: 700,
//               color: "#15803d"
//             }}>{inr(totalMRR)}</p>
//           </div>

//           {([
//             {
//               label: "Basic", count: basicCount, mrr: basicMRR,
//               color: "#6366f1", bg: "#ede9fe"
//             },
//             {
//               label: "Premium", count: premiumCount, mrr: premiumMRR,
//               color: "#f59e0b", bg: "#fef3c7"
//             },
//           ]).map((row, i, arr) => (
//             <div key={row.label} style={{
//               display: "flex", justifyContent: "space-between",
//               alignItems: "center", padding: "11px 0",
//               borderBottom: i < arr.length - 1
//                 ? "1px solid #f1f5f9" : "none",
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                 <div style={{
//                   width: 8, height: 8, borderRadius: "50%",
//                   background: row.color
//                 }} />
//                 <span style={{
//                   fontSize: 13, color: "#1e293b",
//                   fontWeight: 500
//                 }}>{row.label}</span>
//                 <span style={{ fontSize: 11, color: "#94a3b8" }}>
//                   {row.count} × {inr(TIER_PRICE[row.label.toLowerCase()])}
//                 </span>
//               </div>
//               <span style={{
//                 fontSize: 13, fontWeight: 700,
//                 color: row.color
//               }}>{inr(row.mrr)}</span>
//             </div>
//           ))}

//           <div style={{
//             display: "flex", justifyContent: "space-between",
//             alignItems: "center", paddingTop: 12, marginTop: 4,
//             borderTop: "1px solid #f1f5f9"
//           }}>
//             <span style={{
//               fontSize: 11, color: "#94a3b8",
//               fontWeight: 600, textTransform: "uppercase",
//               letterSpacing: "0.1em"
//             }}>ARR Projection</span>
//             <span style={{
//               fontSize: 15, fontWeight: 700,
//               color: "#1e293b"
//             }}>{inr(totalMRR * 12)}</span>
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="panel">
//           <PanelHead title="Quick Stats" sub="Key metrics at a glance" />
//           {([
//             {
//               label: "Verification Rate",
//               value: `${pct(stats?.verified_users ?? 0, stats?.total_users ?? 0)}%`,
//               color: "#10b981"
//             },
//             {
//               label: "Paid Users",
//               value: paidUsers, color: "#6366f1"
//             },
//             {
//               label: "Free Users",
//               value: freeCount, color: "#94a3b8"
//             },
//             {
//               label: "Weekly Growth",
//               value: `+${stats?.recent_signups_7days ?? 0}`,
//               color: "#f59e0b"
//             },
//             {
//               label: "ARPU (Paid)",
//               value: paidUsers
//                 ? inr(Math.round(totalMRR / paidUsers)) : "—",
//               color: "#8b5cf6"
//             },
//           ]).map((item, i, arr) => (
//             <div key={item.label} style={{
//               display: "flex", justifyContent: "space-between",
//               alignItems: "center", padding: "11px 0",
//               borderBottom: i < arr.length - 1
//                 ? "1px solid #f1f5f9" : "none",
//             }}>
//               <span style={{ fontSize: 13, color: "#64748b" }}>
//                 {item.label}
//               </span>
//               <span style={{
//                 fontSize: 15, fontWeight: 700,
//                 color: item.color
//               }}>
//                 {item.value}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* â”€â”€ USERS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
//       <div className="panel fade-in"
//         style={{ padding: 0, animationDelay: "0.3s", overflow: "hidden" }}>

//         {/* Toolbar */}
//         <div style={{
//           padding: "18px 24px",
//           borderBottom: "1px solid #f1f5f9",
//           display: "flex", alignItems: "center",
//           justifyContent: "space-between", gap: 14
//         }}>
//           <div>
//             <p style={{
//               margin: "0 0 2px", fontSize: 15,
//               fontWeight: 700, color: "#1e293b"
//             }}>All Users</p>
//             <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
//               {filtered.length} of {users.length} users
//             </p>
//           </div>
//           <div style={{ display: "flex", gap: 8 }}>
//             <div style={{ position: "relative" }}>
//               <Search size={12} style={{
//                 position: "absolute", left: 10,
//                 top: "50%", transform: "translateY(-50%)",
//                 color: "#94a3b8"
//               }} />
//               <input value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 placeholder="Search users..."
//                 className="tbl-input"
//                 style={{ paddingLeft: 28 }} />
//             </div>
//             <select value={filterTier}
//               onChange={e => setFilterTier(e.target.value)}
//               className="tbl-select">
//               <option value="all">All Tiers</option>
//               <option value="free">Free</option>
//               <option value="basic">Basic</option>
//               <option value="premium">Premium</option>
//             </select>
//           </div>
//         </div>

//         {/* Table */}
//         <div style={{ overflowX: "auto" }}>
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ background: "#f8fafc" }}>
//                 {["User", "Email", "Tier", "Status",
//                   "MRR Contribution", "AI Used", "Joined"].map(h => (
//                     <th key={h} style={{
//                       padding: "10px 18px", textAlign: "left",
//                       fontSize: 10, fontWeight: 600, color: "#94a3b8",
//                       textTransform: "uppercase", letterSpacing: "0.1em",
//                       whiteSpace: "nowrap",
//                       borderBottom: "1px solid #f1f5f9",
//                     }}>{h}</th>
//                   ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.length === 0 ? (
//                 <tr><td colSpan={7} style={{
//                   padding: 52, textAlign: "center",
//                   color: "#94a3b8", fontSize: 14,
//                 }}>No users found</td></tr>
//               ) : filtered.map(u => {
//                 const userMRR = TIER_PRICE[u.subscription_tier] ?? 0;
//                 const hue = (u.id * 47) % 360;
//                 const tierMeta = {
//                   free: {
//                     color: "#64748b", bg: "#f1f5f9",
//                     border: "#e2e8f0"
//                   },
//                   basic: {
//                     color: "#6366f1", bg: "#ede9fe",
//                     border: "#c4b5fd"
//                   },
//                   premium: {
//                     color: "#f59e0b", bg: "#fef3c7",
//                     border: "#fde68a"
//                   },
//                 }[u.subscription_tier];

//                 return (
//                   <tr key={u.id} className="tbl-row">

//                     {/* Name */}
//                     <td style={{ padding: "12px 18px" }}>
//                       <div style={{
//                         display: "flex",
//                         alignItems: "center", gap: 10
//                       }}>
//                         <div style={{
//                           width: 34, height: 34, borderRadius: 10,
//                           flexShrink: 0,
//                           background: `hsl(${hue},60%,92%)`,
//                           border: `1px solid hsl(${hue},50%,82%)`,
//                           display: "flex", alignItems: "center",
//                           justifyContent: "center", fontSize: 12,
//                           fontWeight: 700,
//                           color: `hsl(${hue},55%,38%)`,
//                         }}>
//                           {u.first_name?.[0]}{u.last_name?.[0]}
//                         </div>
//                         <div>
//                           <p style={{
//                             margin: 0, fontSize: 13,
//                             fontWeight: 600, color: "#1e293b"
//                           }}>
//                             {u.first_name} {u.last_name}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Email */}
//                     <td style={{
//                       padding: "12px 18px", fontSize: 13,
//                       color: "#64748b"
//                     }}>{u.email}</td>

//                     {/* Tier */}
//                     <td style={{ padding: "12px 18px" }}>
//                       <span style={{
//                         padding: "4px 10px", fontSize: 11,
//                         fontWeight: 600, borderRadius: 6,
//                         textTransform: "capitalize",
//                         background: tierMeta.bg,
//                         color: tierMeta.color,
//                         border: `1px solid ${tierMeta.border}`,
//                       }}>
//                         {u.subscription_tier}
//                       </span>
//                     </td>

//                     {/* Status */}
//                     <td style={{ padding: "12px 18px" }}>
//                       <div style={{
//                         display: "flex",
//                         alignItems: "center", gap: 6
//                       }}>
//                         <div style={{
//                           width: 7, height: 7,
//                           borderRadius: "50%",
//                           background: u.is_verified
//                             ? "#10b981" : "#f59e0b"
//                         }} />
//                         <span style={{
//                           fontSize: 12, fontWeight: 500,
//                           color: u.is_verified
//                             ? "#10b981" : "#f59e0b"
//                         }}>
//                           {u.is_verified ? "Verified" : "Pending"}
//                         </span>
//                       </div>
//                     </td>

//                     {/* MRR */}
//                     <td style={{ padding: "12px 18px" }}>
//                       {userMRR > 0 ? (
//                         <span style={{
//                           fontSize: 13, fontWeight: 700,
//                           color: "#6366f1"
//                         }}>
//                           {inr(userMRR)}
//                           <span style={{
//                             fontSize: 11,
//                             color: "#94a3b8", fontWeight: 400
//                           }}>
//                             /mo
//                           </span>
//                         </span>
//                       ) : (
//                         <span style={{
//                           color: "#cbd5e1",
//                           fontSize: 13
//                         }}>—</span>
//                       )}
//                     </td>

//                     {/* AI Used */}
//                     <td style={{
//                       padding: "12px 18px", fontSize: 13,
//                       color: "#64748b"
//                     }}>
//                       {u.ai_chat_used ?? 0}
//                     </td>

//                     {/* Joined */}
//                     <td style={{
//                       padding: "12px 18px", fontSize: 12,
//                       color: "#94a3b8", whiteSpace: "nowrap"
//                     }}>
//                       {new Date(u.created_at).toLocaleDateString("en-IN",
//                         { day: "numeric", month: "short", year: "numeric" })}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         <div style={{
//           padding: "12px 24px",
//           borderTop: "1px solid #f1f5f9",
//           display: "flex", justifyContent: "space-between",
//           alignItems: "center", background: "#f8fafc"
//         }}>
//           <span style={{ fontSize: 12, color: "#94a3b8" }}>
//             Showing {filtered.length} result
//             {filtered.length !== 1 ? "s" : ""}
//           </span>
//           <span style={{
//             fontSize: 11, color: "#cbd5e1",
//             letterSpacing: "0.1em", textTransform: "uppercase"
//           }}>
//             Insydz · Restricted Access
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // â”€â”€â”€ PanelHead â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// function PanelHead({ title, sub }: { title: string; sub: string }) {
//   return (
//     <div style={{ marginBottom: 18 }}>
//       <p style={{
//         margin: "0 0 2px", fontSize: 15,
//         fontWeight: 700, color: "#1e293b"
//       }}>{title}</p>
//       <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{sub}</p>
//     </div>
//   );
// }

// // â”€â”€â”€ CSS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// const CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//   * { box-sizing: border-box; }

//   ::-webkit-scrollbar       { width: 5px; height: 5px; }
//   ::-webkit-scrollbar-track { background: #f8fafc; }
//   ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

//   @keyframes spin   { to { transform: rotate(360deg); } }
//   @keyframes fadeIn {
//     from { opacity: 0; transform: translateY(10px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   @keyframes cellIn {
//     from { opacity: 0; transform: translateY(14px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }

//   .fade-in { animation: fadeIn 0.45s ease forwards; }

//   /* KPI grid */
//   .kpi-grid {
//     display: grid;
//     grid-template-columns: repeat(6, 1fr);
//     gap: 16px;
//     margin-bottom: 20px;
//   }
//   .kpi-card {
//     background: white;
//     border-radius: 14px;
//     padding: 20px 18px;
//     display: flex; align-items: center; gap: 14px;
//     box-shadow: 0 1px 8px rgba(0,0,0,0.06);
//     border: 1px solid #f1f5f9;
//     animation: cellIn 0.45s ease forwards;
//     opacity: 0;
//     transition: box-shadow 0.2s, transform 0.2s;
//   }
//   .kpi-card:hover {
//     box-shadow: 0 6px 22px rgba(0,0,0,0.1);
//     transform: translateY(-2px);
//   }

//   /* Middle row */
//   .mid-grid {
//     display: grid;
//     grid-template-columns: 1.5fr 1.3fr 1fr;
//     gap: 16px;
//     margin-bottom: 20px;
//   }

//   /* Shared panel */
//   .panel {
//     background: white;
//     border-radius: 14px;
//     padding: 22px 24px;
//     box-shadow: 0 1px 8px rgba(0,0,0,0.06);
//     border: 1px solid #f1f5f9;
//   }

//   /* Header refresh button */
//   .hdr-btn {
//     display: flex; align-items: center; gap: 6px;
//     background: white; border: 1px solid #e2e8f0;
//     border-radius: 8px; padding: 6px 14px;
//     color: #64748b; font-size: 12px; cursor: pointer;
//     font-family: inherit; font-weight: 500;
//     transition: all 0.15s ease;
//   }
//   .hdr-btn:hover {
//     background: #f8fafc; border-color: #6366f1; color: #6366f1;
//   }

//   /* Table inputs */
//   .tbl-input {
//     background: #f8fafc; border: 1px solid #e2e8f0;
//     border-radius: 8px; padding: 7px 12px;
//     color: #1e293b; font-size: 13px; width: 185px;
//     font-family: inherit; outline: none;
//   }
//   .tbl-input::placeholder { color: #94a3b8; }
//   .tbl-input:focus { border-color: #6366f1; }

//   .tbl-select {
//     background: #f8fafc; border: 1px solid #e2e8f0;
//     border-radius: 8px; padding: 7px 12px;
//     color: #64748b; font-size: 13px; cursor: pointer;
//     font-family: inherit; outline: none;
//   }
//   .tbl-select:focus { border-color: #6366f1; }

//   /* Table rows */
//   .tbl-row { border-top: 1px solid #f8fafc; transition: background 0.12s; }
//   .tbl-row:hover { background: #f8fafc; }

//   /* Responsive */
//   @media (max-width: 1280px) {
//     .kpi-grid { grid-template-columns: repeat(3, 1fr); }
//   }
//   @media (max-width: 768px) {
//     .kpi-grid { grid-template-columns: repeat(2, 1fr); }
//     .mid-grid { grid-template-columns: 1fr; }
//   }
// `;



"use client";
import { API_BASE_URL } from "@/lib/config";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  RefreshCw, Search, ArrowUpRight, ArrowDownRight,
  Users, ShieldCheck, ShieldOff, TrendingUp,
  Wallet, IndianRupee, ChevronDown, ChevronUp,
  MessageSquare, BarChart2, Globe, Tag,
  Activity, MousePointerClick, AlertOctagon, Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "") || "syatharthdelhi@gmail.com";
const TIER_PRICE: Record<string, number> = { free: 0, basic: 1999, premium: 2999 };

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const fmt = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));

interface Stats {
  total_users: number;
  verified_users: number;
  unverified_users: number;
  recent_signups_7days: number;
  by_tier: { free: number; basic: number; premium: number };
}

interface PromoCode {
  id: number;
  code: string;
  discount_percentage: number;
  max_uses_per_user: number;
  marketing_channel: string;
  is_active: boolean;
  valid_from: string | null;
  expires_at: string | null;
  created_at: string;
  total_redemptions: number;
  redemptions: {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    redeemed_at: string;
  }[];
}

interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  subscription_tier: "free" | "basic" | "premium";
  is_verified: boolean;
  is_active: boolean;
  ai_chat_used: number;
  ai_chat_month: string;
  analysis_used: number;
  analysis_month: string | null;
  sov_used: number;
  sov_month: string | null;
  keyword_tracker_used: number;
  keyword_tracker_month: string | null;
  ki_searches_used: number;
  ki_cycle_start: string | null;
  created_at: string;
  updated_at: string;
  business_name: string | null;
  location: string | null;
  business_interests: string[] | null;
  subscription_expires_at: string | null;
  scheduled_downgrade_to: string | null;
  onboarding_completed: boolean;
  onboarding_goal: string | null;
  onboarding_marketplace: string | null;
  onboarding_details: string | null;
  seller_id: string | null;
  seller_sync_status: string | null;
  mobile_number: string | null;
}

interface BehaviorLog {
  id: number;
  user_id: number | null;
  session_id: string;
  event_type: string;
  page_path: string;
  properties: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_email: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [lastUpd, setLastUpd] = useState(new Date());
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedPromoId, setExpandedPromoId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof UserRow>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Tab & User Behavior logs state
  const [activeTab, setActiveTab] = useState<"overview" | "behavior" | "promo">("overview");
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>([]);
  const [behaviorLimit, setBehaviorLimit] = useState<number>(100);
  const [behaviorSearch, setBehaviorSearch] = useState<string>("");
  const [behaviorFilterType, setBehaviorFilterType] = useState<string>("all");
  const [behaviorLoading, setBehaviorLoading] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [behaviorEmailFilter, setBehaviorEmailFilter] = useState<string>("");
  const [behaviorPathFilter, setBehaviorPathFilter] = useState<string>("");
  const [behaviorHidePageViews, setBehaviorHidePageViews] = useState<boolean>(false);
  const [behaviorPage, setBehaviorPage] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) { router.push("/dashboard"); return; }
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (activeTab === "behavior" && user?.email === ADMIN_EMAIL) {
      fetchBehaviorLogs();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users);
      setPromoCodes(data.promo_codes || []);
      setLastUpd(new Date());
    } catch { router.push("/dashboard"); }
    finally { setIsLoading(false); }
  };

  const fetchBehaviorLogs = async (limitVal: number = behaviorLimit) => {
    setBehaviorLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/behavior-logs?limit=${limitVal}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setBehaviorLogs(data);
        setLastUpd(new Date());
      }
    } catch (err) {
      console.error("Error fetching behavior logs:", err);
    } finally {
      setBehaviorLoading(false);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setBehaviorLimit(newLimit);
    fetchBehaviorLogs(newLimit);
  };

  const toggleSort = (field: keyof UserRow) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleRecoverUser = async (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/recover`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        toast({
          title: "Account Recovered",
          description: "The user account is now active again.",
        });
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: true } : u));
      } else {
        toast({ title: "Recovery failed", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error recovering account", variant: "destructive" });
    }
  };

  const togglePromoStatus = async (e: React.MouseEvent, promoId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/promo/${promoId}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(prev => prev.map(p =>
          p.id === promoId ? { ...p, is_active: data.is_active } : p
        ));
      }
    } catch (err) {
      console.error("Failed to toggle promo code status", err);
    }
  };

  const basicCount = stats?.by_tier?.basic ?? 0;
  const premiumCount = stats?.by_tier?.premium ?? 0;
  const freeCount = stats?.by_tier?.free ?? 0;
  const tierTotal = freeCount + basicCount + premiumCount;
  const totalMRR = basicCount * TIER_PRICE.basic + premiumCount * TIER_PRICE.premium;
  const paidUsers = basicCount + premiumCount;

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const nameMatch = `${u.first_name} ${u.last_name}`.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      const bizMatch = (u.business_name || "").toLowerCase().includes(q);
      const locMatch = (u.location || "").toLowerCase().includes(q);
      const matchesSearch = !q || nameMatch || emailMatch || bizMatch || locMatch;
      const matchesTier = filterTier === "all" || u.subscription_tier === filterTier;
      const matchesVerified =
        filterVerified === "all" ||
        (filterVerified === "verified" && u.is_verified) ||
        (filterVerified === "unverified" && !u.is_verified);
      const matchesActive = 
        filterActive === "all" ||
        (filterActive === "active" && u.is_active !== false) ||
        (filterActive === "deleted" && u.is_active === false);
      return matchesSearch && matchesTier && matchesVerified && matchesActive;
    })
    .sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  if (isLoading) return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 400, fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid #e2e8f0", borderTop: "3px solid #6366f1",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ marginTop: 12, color: "#94a3b8", fontSize: 13 }}>Loading…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const SortIcon = ({ field }: { field: keyof UserRow }) =>
    sortField === field
      ? sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      : <span style={{ opacity: 0.3 }}><ChevronDown size={11} /></span>;

  const Th = ({ label, field }: { label: string; field?: keyof UserRow }) => (
    <th
      onClick={() => field && toggleSort(field)}
      style={{
        padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
        color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em",
        whiteSpace: "nowrap", borderBottom: "1px solid #f1f5f9",
        background: "#f8fafc", cursor: field ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {label} {field && <SortIcon field={field} />}
      </span>
    </th>
  );

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#1e293b" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div className="flex-between mb-6 fade-in">
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            {activeTab === "overview" ? "Admin Overview" : activeTab === "behavior" ? "User Behavior Analytics" : "Promo Codes & Marketing"}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
            {activeTab === "overview"
              ? "Full user database — all columns visible."
              : activeTab === "behavior"
                ? "Detailed clickstreams, page views, and user journeys."
                : "Track active promotional campaigns and redemptions."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            Updated {lastUpd.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button onClick={activeTab === "overview" ? fetchStats : () => fetchBehaviorLogs()} className="hdr-btn">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: "inline-flex",
        background: "#f1f5f9",
        padding: 4,
        borderRadius: 10,
        marginBottom: 22,
        border: "1px solid #e2e8f0"
      }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            background: activeTab === "overview" ? "white" : "transparent",
            color: activeTab === "overview" ? "#4f46e5" : "#64748b",
            boxShadow: activeTab === "overview" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          User Count
        </button>
        <button
          onClick={() => setActiveTab("behavior")}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            background: activeTab === "behavior" ? "white" : "transparent",
            color: activeTab === "behavior" ? "#4f46e5" : "#64748b",
            boxShadow: activeTab === "behavior" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          User Behavior & Journeys
        </button>
        <button
          onClick={() => setActiveTab("promo")}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            background: activeTab === "promo" ? "white" : "transparent",
            color: activeTab === "promo" ? "#4f46e5" : "#64748b",
            boxShadow: activeTab === "promo" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Promo Codes
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid fade-in" style={{ animationDelay: "0.04s" }}>
            {[
              { label: "Total Users", value: stats?.total_users ?? 0, sub: `+${stats?.recent_signups_7days ?? 0} this week`, up: true, isRupee: false, icon: <Users size={19} />, grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", glow: "#6366f133" },
              { label: "New (7 Days)", value: stats?.recent_signups_7days ?? 0, sub: "recent signups", up: true, isRupee: false, icon: <TrendingUp size={19} />, grad: "linear-gradient(135deg,#06b6d4,#0284c7)", glow: "#06b6d433" },
              { label: "Verified", value: stats?.verified_users ?? 0, sub: `${pct(stats?.verified_users ?? 0, stats?.total_users ?? 0)}% of total`, up: true, isRupee: false, icon: <ShieldCheck size={19} />, grad: "linear-gradient(135deg,#10b981,#059669)", glow: "#10b98133" },
              { label: "Unverified", value: stats?.unverified_users ?? 0, sub: "pending verification", up: false, isRupee: false, icon: <ShieldOff size={19} />, grad: "linear-gradient(135deg,#f59e0b,#ef4444)", glow: "#f59e0b33" },
              { label: "Monthly Revenue", value: totalMRR, sub: `${paidUsers} paid users`, up: true, isRupee: true, icon: <IndianRupee size={19} />, grad: "linear-gradient(135deg,#10b981,#059669)", glow: "#10b98133" },
              { label: "Paid Users", value: paidUsers, sub: `${pct(paidUsers, tierTotal)}% conversion`, up: true, isRupee: false, icon: <Wallet size={19} />, grad: "linear-gradient(135deg,#f59e0b,#f97316)", glow: "#f59e0b33" },
            ].map((c, i) => (
              <div key={i} className="kpi-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.label}</p>
                  <p style={{ margin: "0 0 8px", fontSize: c.isRupee ? 20 : 28, fontWeight: 700, color: "#1e293b", lineHeight: 1 }}>
                    {c.isRupee ? "₹" + c.value.toLocaleString("en-IN") : c.value.toLocaleString("en-IN")}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: c.up ? "#10b981" : "#ef4444" }}>
                    {c.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{c.sub}</span>
                  </div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, background: c.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: `0 6px 18px ${c.glow}` }}>
                  {c.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Tier + Revenue row */}
          <div className="mid-grid fade-in" style={{ animationDelay: "0.18s" }}>
            {/* Tier */}
            <div className="panel">
              <PanelHead title="Tier Distribution" sub="Users by subscription plan" />
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                {[
                  { label: "Free", val: freeCount, color: "#94a3b8", bg: "#f1f5f9", border: "#e2e8f0" },
                  { label: "Basic", val: basicCount, color: "#6366f1", bg: "#ede9fe", border: "#c4b5fd" },
                  { label: "Premium", val: premiumCount, color: "#f59e0b", bg: "#fef3c7", border: "#fde68a" },
                ].map(t => (
                  <div key={t.label} style={{ flex: 1, padding: "12px 14px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10 }}>
                    <p style={{ margin: "0 0 5px", fontSize: 10, fontWeight: 600, color: t.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.label}</p>
                    <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{t.val}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{pct(t.val, tierTotal)}%</p>
                  </div>
                ))}
              </div>
              <div style={{ height: 7, borderRadius: 5, display: "flex", overflow: "hidden", gap: 2 }}>
                <div style={{ width: `${pct(freeCount, tierTotal)}%`, background: "#94a3b8", transition: "width 0.8s ease" }} />
                <div style={{ width: `${pct(basicCount, tierTotal)}%`, background: "#6366f1", transition: "width 0.9s ease" }} />
                <div style={{ width: `${pct(premiumCount, tierTotal)}%`, background: "#f59e0b", transition: "width 1s ease" }} />
              </div>
            </div>

            {/* Revenue */}
            <div className="panel">
              <PanelHead title="Revenue" sub="Monthly recurring & annual" />
              <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 600, color: "#16a34a", letterSpacing: "0.12em", textTransform: "uppercase" }}>MRR</p>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#15803d" }}>{inr(totalMRR)}</p>
              </div>
              {[
                { label: "Basic", count: basicCount, mrr: basicCount * TIER_PRICE.basic, color: "#6366f1" },
                { label: "Premium", count: premiumCount, mrr: premiumCount * TIER_PRICE.premium, color: "#f59e0b" },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{row.label} <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>× {row.count}</span></span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{inr(row.mrr)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, marginTop: 4, borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>ARR Projection</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{inr(totalMRR * 12)}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="panel">
              <PanelHead title="Quick Stats" sub="Key metrics at a glance" />
              {[
                { label: "Verification Rate", value: `${pct(stats?.verified_users ?? 0, stats?.total_users ?? 0)}%`, color: "#10b981" },
                { label: "Paid Users", value: paidUsers, color: "#6366f1" },
                { label: "Free Users", value: freeCount, color: "#94a3b8" },
                { label: "Weekly Growth", value: `+${stats?.recent_signups_7days ?? 0}`, color: "#f59e0b" },
                { label: "ARPU (Paid)", value: paidUsers ? inr(Math.round(totalMRR / paidUsers)) : "—", color: "#8b5cf6" },
              ].map((item, i, arr) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ Full Users Table â”€â”€ */}
          <div className="panel fade-in" style={{ padding: 0, animationDelay: "0.3s", overflow: "hidden" }}>

            {/* Toolbar */}
            <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>All Users</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{filtered.length} of {users.length} users · click a row to expand</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, biz, location…" className="tbl-input" style={{ paddingLeft: 28, width: 220 }} />
                </div>
                <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="tbl-select">
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                </select>
                <select value={filterVerified} onChange={e => setFilterVerified(e.target.value)} className="tbl-select">
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
                <select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="tbl-select">
                  <option value="all">All Accounts</option>
                  <option value="active">Active</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="table-scroll-container">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <Th label="User" field="first_name" />
                    <Th label="Email" field="email" />
                    <Th label="Mobile" />
                    <Th label="Tier" field="subscription_tier" />
                    <Th label="Status" field="is_verified" />
                    <Th label="Business" field="business_name" />
                    <Th label="Location" field="location" />
                    <Th label="Marketplace" field="onboarding_marketplace" />
                    <Th label="Seller ID" field="seller_id" />
                    <Th label="Sync" field="seller_sync_status" />
                    <Th label="AI Chats" field="ai_chat_used" />
                    <Th label="Analysis" field="analysis_used" />
                    <Th label="SOV" field="sov_used" />
                    <Th label="KW Tracker" field="keyword_tracker_used" />
                    <Th label="KI Searches" field="ki_searches_used" />
                    <Th label="MRR" />
                    <Th label="Expires" field="subscription_expires_at" />
                    <Th label="Joined" field="created_at" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={18} style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No users found</td></tr>
                  ) : filtered.map(u => {
                    const hue = (u.id * 47) % 360;
                    const tierMeta = {
                      free: { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" },
                      basic: { color: "#6366f1", bg: "#ede9fe", border: "#c4b5fd" },
                      premium: { color: "#f59e0b", bg: "#fef3c7", border: "#fde68a" },
                    }[u.subscription_tier];
                    const isOpen = expandedId === u.id;
                    const syncColor = {
                      COMPLETED: "#10b981", IDLE: "#94a3b8", PENDING: "#f59e0b", FAILED: "#ef4444",
                    }[u.seller_sync_status ?? "IDLE"] ?? "#94a3b8";

                    return (
                      <Fragment key={u.id}>
                        <tr key={u.id} className="tbl-row" onClick={() => setExpandedId(isOpen ? null : u.id)} style={{ cursor: "pointer" }}>

                          {/* User */}
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: `hsl(${hue},60%,92%)`, border: `1px solid hsl(${hue},50%,82%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: `hsl(${hue},55%,38%)` }}>
                                {u.first_name?.[0]}{u.last_name?.[0]}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{u.first_name} {u.last_name}</p>
                                <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>#{u.id}</p>
                              </div>
                              <span style={{ marginLeft: 2, color: "#94a3b8" }}>{isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{u.email}</td>

                          {/* Mobile */}
                          <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{fmt(u.mobile_number)}</td>

                          {/* Tier */}
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{ padding: "3px 9px", fontSize: 10, fontWeight: 600, borderRadius: 5, textTransform: "capitalize", background: tierMeta.bg, color: tierMeta.color, border: `1px solid ${tierMeta.border}` }}>
                              {u.subscription_tier}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "11px 14px" }}>
                            {!u.is_active ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                                  <span style={{ fontSize: 11, fontWeight: 500, color: "#ef4444" }}>Deleted</span>
                                </div>
                                <button
                                  onClick={(e) => handleRecoverUser(e, u.id)}
                                  style={{ fontSize: 10, padding: "2px 6px", background: "#3b82f6", color: "white", borderRadius: 4, cursor: "pointer", border: "none" }}
                                >
                                  Recover
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: u.is_verified ? "#10b981" : "#f59e0b" }} />
                                <span style={{ fontSize: 11, fontWeight: 500, color: u.is_verified ? "#10b981" : "#f59e0b" }}>
                                  {u.is_verified ? "Verified" : "Pending"}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Business */}
                          <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{fmt(u.business_name)}</td>

                          {/* Location */}
                          <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{fmt(u.location)}</td>

                          {/* Marketplace */}
                          <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748b" }}>{fmt(u.onboarding_marketplace)}</td>

                          {/* Seller ID */}
                          <td style={{ padding: "11px 14px", fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                            {u.seller_id ? <span title={u.seller_id}>{u.seller_id.slice(0, 12)}…</span> : "—"}
                          </td>

                          {/* Sync */}
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: syncColor, background: syncColor + "18", padding: "2px 7px", borderRadius: 4 }}>
                              {fmt(u.seller_sync_status)}
                            </span>
                          </td>

                          {/* AI Chats */}
                          <td style={{ padding: "11px 14px", textAlign: "center" }}>
                            <UsagePill used={u.ai_chat_used} color="#6366f1" />
                          </td>

                          {/* Analysis */}
                          <td style={{ padding: "11px 14px", textAlign: "center" }}>
                            <UsagePill used={u.analysis_used} color="#06b6d4" />
                          </td>

                          {/* SOV */}
                          <td style={{ padding: "11px 14px", textAlign: "center" }}>
                            <UsagePill used={u.sov_used} color="#8b5cf6" />
                          </td>

                          {/* KW Tracker */}
                          <td style={{ padding: "11px 14px", textAlign: "center" }}>
                            <UsagePill used={u.keyword_tracker_used} color="#f59e0b" />
                          </td>

                          {/* KI Searches */}
                          <td style={{ padding: "11px 14px", textAlign: "center" }}>
                            <UsagePill used={u.ki_searches_used} color="#ec4899" />
                          </td>

                          {/* MRR */}
                          <td style={{ padding: "11px 14px" }}>
                            {TIER_PRICE[u.subscription_tier] > 0
                              ? <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>{inr(TIER_PRICE[u.subscription_tier])}<span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>/mo</span></span>
                              : <span style={{ color: "#cbd5e1", fontSize: 12 }}>—</span>
                            }
                          </td>

                          {/* Expires */}
                          <td style={{ padding: "11px 14px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                            {u.subscription_expires_at
                              ? new Date(u.subscription_expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </td>

                          {/* Joined */}
                          <td style={{ padding: "11px 14px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                            {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>

                        {/* Expanded Detail Row */}
                        {isOpen && (
                          <tr key={`exp-${u.id}`}>
                            <td colSpan={18} style={{ padding: 0, background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "2px solid #e2e8f0" }}>
                              <div style={{ padding: "18px 24px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>

                                  {/* Onboarding */}
                                  <DetailCard title="Onboarding" icon={<TrendingUp size={14} />} color="#6366f1">
                                    <DetailRow label="Completed" value={u.onboarding_completed ? "Yes" : "No"} />
                                    <DetailRow label="Goal" value={u.onboarding_goal} />
                                    <DetailRow label="Marketplace" value={u.onboarding_marketplace} />
                                    <DetailRow label="Details" value={u.onboarding_details} mono />
                                  </DetailCard>

                                  {/* Seller Info */}
                                  <DetailCard title="Seller Info" icon={<Globe size={14} />} color="#06b6d4">
                                    <DetailRow label="Seller ID" value={u.seller_id} mono />
                                    <DetailRow label="Sync Status" value={u.seller_sync_status} />
                                    <DetailRow label="Active" value={u.is_active ? "Yes" : "No"} />
                                    <DetailRow label="Downgrade To" value={u.scheduled_downgrade_to} />
                                  </DetailCard>

                                  {/* Business */}
                                  <DetailCard title="Business" icon={<BarChart2 size={14} />} color="#10b981">
                                    <DetailRow label="Name" value={u.business_name} />
                                    <DetailRow label="Location" value={u.location} />
                                    <DetailRow label="Mobile" value={u.mobile_number} />
                                    <DetailRow label="Interests" value={u.business_interests?.join(", ")} />
                                  </DetailCard>

                                  {/* Usage This Month */}
                                  <DetailCard title="Usage (This Month)" icon={<MessageSquare size={14} />} color="#f59e0b">
                                    <DetailRow label="AI Chat" value={`${u.ai_chat_used} (${u.ai_chat_month ?? "—"})`} />
                                    <DetailRow label="Analysis" value={u.analysis_used > 0 ? `${u.analysis_used} (${u.analysis_month ?? "—"})` : "0"} />
                                    <DetailRow label="SOV" value={u.sov_used > 0 ? `${u.sov_used} (${u.sov_month ?? "—"})` : "0"} />
                                    <DetailRow label="KW Tracker" value={u.keyword_tracker_used > 0 ? `${u.keyword_tracker_used} (${u.keyword_tracker_month ?? "—"})` : "0"} />
                                    <DetailRow label="KI Searches" value={u.ki_searches_used > 0 ? `${u.ki_searches_used} (Cycle start: ${u.ki_cycle_start ? new Date(u.ki_cycle_start).toLocaleDateString("en-IN") : "—"})` : "0"} />
                                  </DetailCard>

                                  {/* Subscription */}
                                  <DetailCard title="Subscription" icon={<Tag size={14} />} color="#8b5cf6">
                                    <DetailRow label="Tier" value={u.subscription_tier} />
                                    <DetailRow label="Expires" value={u.subscription_expires_at ? new Date(u.subscription_expires_at).toLocaleDateString("en-IN") : null} />
                                    <DetailRow label="Downgrade To" value={u.scheduled_downgrade_to} />
                                    <DetailRow label="MRR" value={TIER_PRICE[u.subscription_tier] > 0 ? inr(TIER_PRICE[u.subscription_tier]) : "Free"} />
                                  </DetailCard>

                                  {/* Timestamps */}
                                  <DetailCard title="Timestamps" icon={<RefreshCw size={14} />} color="#94a3b8">
                                    <DetailRow label="Joined" value={u.created_at ? new Date(u.created_at).toLocaleString("en-IN") : "—"} />
                                    <DetailRow label="Updated" value={u.updated_at ? new Date(u.updated_at).toLocaleString("en-IN") : "—"} />
                                  </DetailCard>

                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding: "11px 22px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Showing {filtered.length} of {users.length} users</span>
              <span style={{ fontSize: 11, color: "#cbd5e1", letterSpacing: "0.1em", textTransform: "uppercase" }}>Insydz · Restricted Access</span>
            </div>
          </div>
        </>
      ) : activeTab === "promo" ? (
        <div className="fade-in">
          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Promo Codes & Campaigns</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{promoCodes.length} tracking codes found</p>
              </div>
            </div>
            <div className="table-scroll-container">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Code", "Channel", "Discount", "Valid From", "Expires At", "Redemptions", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: 52, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No promo codes found</td></tr>
                  ) : promoCodes.map(p => {
                    const isDateValid = !p.expires_at || new Date(p.expires_at).getTime() > Date.now();
                    const isActive = p.is_active && isDateValid;
                    const statusText = isActive ? "Active" : (p.is_active ? "Expired" : "Disabled");
                    const statusBg = isActive ? "#dcfce7" : (p.is_active ? "#fef2f2" : "#f1f5f9");
                    const statusColor = isActive ? "#16a34a" : (p.is_active ? "#ef4444" : "#64748b");

                    const isOpen = expandedPromoId === p.id;
                    return (
                      <Fragment key={p.id}>
                        <tr onClick={() => setExpandedPromoId(isOpen ? null : p.id)} className="tbl-row" style={{ cursor: "pointer", background: isOpen ? "#f8fafc" : "transparent" }}>
                          <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{p.code}</td>
                          <td style={{ padding: "12px 18px", fontSize: 12, color: "#64748b" }}>{p.marketing_channel || "—"}</td>
                          <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "#10b981" }}>{p.discount_percentage}% OFF</td>
                          <td style={{ padding: "12px 18px", fontSize: 12, color: "#94a3b8" }}>{p.valid_from ? new Date(p.valid_from).toLocaleString("en-IN", { timeZone: "UTC" }) : "—"}</td>
                          <td style={{ padding: "12px 18px", fontSize: 12, color: "#94a3b8" }}>{p.expires_at ? new Date(p.expires_at).toLocaleString("en-IN", { timeZone: "UTC" }) : "—"}</td>
                          <td style={{ padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>{p.total_redemptions}</td>
                          <td style={{ padding: "12px 18px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 6, background: statusBg, color: statusColor }}>{statusText}</span>
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <div
                              onClick={(e) => togglePromoStatus(e, p.id)}
                              style={{
                                width: 44, height: 24, borderRadius: 12,
                                background: p.is_active ? "#10b981" : "#e2e8f0",
                                cursor: "pointer", position: "relative",
                                transition: "background 0.3s ease",
                                border: "1px solid",
                                borderColor: p.is_active ? "#10b981" : "#cbd5e1"
                              }}
                            >
                              <div style={{
                                width: 18, height: 18, borderRadius: "50%",
                                background: "white", position: "absolute",
                                top: 2, left: p.is_active ? 22 : 2,
                                transition: "left 0.3s ease",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
                              }} />
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`exp-promo-${p.id}`}>
                            <td colSpan={8} style={{ padding: 0, background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "2px solid #e2e8f0" }}>
                              <div style={{ padding: "18px 24px" }}>
                                <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Redemption History</p>
                                {p.redemptions && p.redemptions.length > 0 ? (
                                  <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                    <thead>
                                      <tr style={{ background: "#f1f5f9" }}>
                                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>User</th>
                                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Email</th>
                                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Times Used</th>
                                        <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Latest Redemption (IST)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Object.values(
                                        p.redemptions.reduce((acc, r) => {
                                          if (!acc[r.user_id]) acc[r.user_id] = { ...r, times_used: 1 };
                                          else {
                                            acc[r.user_id].times_used += 1;
                                            if (new Date(r.redeemed_at) > new Date(acc[r.user_id].redeemed_at)) {
                                              acc[r.user_id].redeemed_at = r.redeemed_at;
                                            }
                                          }
                                          return acc;
                                        }, {} as Record<number, typeof p.redemptions[0] & { times_used: number }>)
                                      )
                                        .sort((a, b) => new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime())
                                        .map((r, i) => (
                                          <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: 500, color: "#1e293b" }}>{r.first_name || ""} {r.last_name || ""}</td>
                                            <td style={{ padding: "8px 12px", fontSize: 12, color: "#64748b" }}>{r.email}</td>
                                            <td style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#4f46e5" }}>{r.times_used} / {p.max_uses_per_user}</td>
                                            <td style={{ padding: "8px 12px", fontSize: 12, color: "#94a3b8" }}>{new Date(r.redeemed_at).toLocaleString("en-IN", { timeZone: "UTC" })}</td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div style={{ padding: "16px", background: "white", borderRadius: 8, border: "1px dashed #cbd5e1", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                                    No redemptions yet
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* â”€â”€ BEHAVIOR TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
        (() => {
          // â”€â”€ derived filter data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          const uniqueEmails = Array.from(new Set(behaviorLogs.map(l => l.user_email).filter(Boolean))) as string[];
          const uniquePaths = Array.from(new Set(behaviorLogs.map(l => l.page_path))).sort();
          const uniqueSessions = new Set(behaviorLogs.map(l => l.session_id)).size;

          const filteredLogs = behaviorLogs.filter(log => {
            const q = behaviorSearch.toLowerCase();
            const matchesSearch = !q ||
              (log.user_email || "").toLowerCase().includes(q) ||
              log.page_path.toLowerCase().includes(q) ||
              (log.properties?.track_id || "").toLowerCase().includes(q) ||
              log.event_type.toLowerCase().includes(q);
            const matchesType = behaviorFilterType === "all" || log.event_type === behaviorFilterType;
            const matchesEmail = !behaviorEmailFilter || log.user_email === behaviorEmailFilter;
            const matchesPath = !behaviorPathFilter || log.page_path === behaviorPathFilter;
            const matchesHide = !behaviorHidePageViews || log.event_type !== "page_view";
            return matchesSearch && matchesType && matchesEmail && matchesPath && matchesHide;
          });

          const PAGE_SIZE = 25;
          const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
          const safePage = Math.min(behaviorPage, totalPages - 1);
          const pageLogs = filteredLogs.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

          return (
            <div className="fade-in" style={{ animationDelay: "0.05s" }}>

              {/* Stats bar */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                {[
                  { label: "Unique Users", value: uniqueEmails.length },
                  { label: "Unique Paths", value: uniquePaths.length },
                  { label: "Unique Sessions", value: uniqueSessions },
                  { label: "Total Events", value: behaviorLogs.length },
                ].map(s => (
                  <div key={s.label} style={{ background: "white", border: "1px solid #f1f5f9", borderRadius: 10, padding: "8px 14px", display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Toolbar row 1 — search + event type + limit */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flexGrow: 1, maxWidth: 260 }}>
                  <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input value={behaviorSearch} onChange={e => setBehaviorSearch(e.target.value)} placeholder="Search email, path, track ID…" className="tbl-input" style={{ paddingLeft: 28, width: "100%" }} />
                </div>
                <select value={behaviorFilterType} onChange={e => setBehaviorFilterType(e.target.value)} className="tbl-select">
                  <option value="all">All Events</option>
                  <option value="page_view">Page Views</option>
                  <option value="element_click">Clicks</option>
                  <option value="rage_click">Rage Clicks</option>
                </select>
                <select value={String(behaviorLimit)} onChange={handleLimitChange} className="tbl-select">
                  <option value="100">Last 100</option>
                  <option value="250">Last 250</option>
                  <option value="500">Last 500</option>
                  <option value="1000">Last 1000</option>
                </select>
                <button onClick={() => fetchBehaviorLogs()} disabled={behaviorLoading} className="hdr-btn" style={{ opacity: behaviorLoading ? 0.6 : 1 }}>
                  <RefreshCw size={13} style={{ animation: behaviorLoading ? "spin 0.8s linear infinite" : "none" }} />
                  {behaviorLoading ? "Loading…" : "Refresh"}
                </button>
              </div>

              {/* Toolbar row 2 — user + path filters + hide toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <select value={behaviorEmailFilter} onChange={e => { setBehaviorEmailFilter(e.target.value); setBehaviorPage(0); }} className="tbl-select">
                  <option value="">All Users ({uniqueEmails.length})</option>
                  {uniqueEmails.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
                <select value={behaviorPathFilter} onChange={e => { setBehaviorPathFilter(e.target.value); setBehaviorPage(0); }} className="tbl-select">
                  <option value="">All Pages ({uniquePaths.length})</option>
                  {uniquePaths.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={behaviorHidePageViews}
                    onChange={e => { setBehaviorHidePageViews(e.target.checked); setBehaviorPage(0); }}
                    style={{ accentColor: "#6366f1", width: 13, height: 13 }}
                  />
                  Hide page_views
                </label>
                {(behaviorEmailFilter || behaviorPathFilter || behaviorSearch || behaviorFilterType !== "all" || behaviorHidePageViews) && (
                  <button
                    className="hdr-btn"
                    onClick={() => { setBehaviorEmailFilter(""); setBehaviorPathFilter(""); setBehaviorSearch(""); setBehaviorFilterType("all"); setBehaviorHidePageViews(false); setBehaviorPage(0); }}
                    style={{ fontSize: 11, color: "#ef4444", borderColor: "#fca5a5" }}
                  >
                    Clear filters
                  </button>
                )}
                <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
                  {filteredLogs.length} of {behaviorLogs.length} events
                </span>
              </div>

              {/* Behavior Table */}
              <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
                {behaviorLoading && behaviorLogs.length === 0 ? (
                  <div style={{ padding: 60, textAlign: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #e2e8f0", borderTop: "3px solid #6366f1", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                    <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>Loading behavior logs…</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                      <colgroup>
                        <col style={{ width: 48 }} />{/* # */}
                        <col style={{ width: 90 }} />{/* Time */}
                        <col style={{ width: 170 }} />{/* User */}
                        <col style={{ width: 100 }} />{/* Event */}
                        <col style={{ width: 160 }} />{/* Path */}
                        <col style={{ width: 160 }} />{/* Track ID */}
                        <col style={{ width: 130 }} />{/* Filter Val */}
                        <col style={{ width: 32 }} />{/* Chevron */}
                      </colgroup>
                      <thead>
                        <tr style={{ background: "#f8fafc" }}>
                          {["#", "Time", "User", "Event", "Page", "Track ID", "Filter Value", ""].map(h => (
                            <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", borderBottom: "1px solid #f1f5f9", overflow: "hidden" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageLogs.length === 0 ? (
                          <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No events match the current filters.</td></tr>
                        ) : pageLogs.map(log => {
                          const isLogOpen = expandedLogId === log.id;
                          const eventMeta: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
                            page_view: { color: "#4f46e5", bg: "#ede9fe", icon: <Activity size={10} />, label: "Page View" },
                            page_exit: { color: "#0f766e", bg: "#ccfbf1", icon: <Clock size={10} />, label: "Exit/Dwell" },
                            element_click: { color: "#0284c7", bg: "#e0f2fe", icon: <MousePointerClick size={10} />, label: "Click" },
                            rage_click: { color: "#dc2626", bg: "#fee2e2", icon: <AlertOctagon size={10} />, label: "Rage" },
                          };
                          const meta = eventMeta[log.event_type] ?? { color: "#64748b", bg: "#f1f5f9", icon: null, label: log.event_type };
                          const props = log.properties || {};
                          const trackId = props.track_id ?? props.id ?? null;
                          const filterVal = props.filter_value ?? null;
                          const tagName = props.tagName ?? null;
                          const ts = new Date(log.created_at);
                          const timeStr = ts.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                          const dateStr = ts.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

                          return (
                            <Fragment key={log.id}>
                              <tr className="tbl-row" style={{ cursor: "pointer" }} onClick={() => setExpandedLogId(isLogOpen ? null : log.id)}>
                                {/* # */}
                                <td style={{ padding: "7px 10px", fontSize: 10, color: "#cbd5e1", fontFamily: "monospace", overflow: "hidden" }}>{log.id}</td>
                                {/* Time */}
                                <td style={{ padding: "7px 10px", overflow: "hidden" }}>
                                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#1e293b" }}>{timeStr}</p>
                                  <p style={{ margin: 0, fontSize: 9, color: "#94a3b8" }}>{dateStr}</p>
                                </td>
                                {/* User */}
                                <td style={{ padding: "7px 10px", fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.user_email ?? ""}>
                                  {log.user_email ?? <span style={{ color: "#cbd5e1" }}>anon</span>}
                                </td>
                                {/* Event */}
                                <td style={{ padding: "7px 10px", overflow: "hidden" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: meta.bg, color: meta.color }}>
                                    {meta.icon}{meta.label}
                                  </span>
                                </td>
                                {/* Path */}
                                <td style={{ padding: "7px 10px", fontSize: 11, color: "#475569", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.page_path}>
                                  {log.page_path}
                                </td>
                                {/* Track ID */}
                                <td style={{ padding: "7px 10px", overflow: "hidden" }}>
                                  {trackId
                                    ? <span style={{ display: "block", fontSize: 10, fontWeight: 600, color: "#0284c7", background: "#e0f2fe", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={String(trackId)}>{trackId}</span>
                                    : <span style={{ fontSize: 10, color: "#e2e8f0" }}>—</span>
                                  }
                                </td>
                                {/* Filter Value */}
                                <td style={{ padding: "7px 10px", fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={filterVal ?? ""}>
                                  {log.event_type === "page_view" && props.duration_seconds !== undefined
                                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, color: "#0f766e", fontWeight: 600 }} title={`Dwell time: ${props.duration_seconds}s`}><Clock size={10} /> {props.duration_seconds}s dwell</span>
                                    : (filterVal ?? <span style={{ color: "#e2e8f0" }}>—</span>)
                                  }
                                </td>
                                {/* Chevron */}
                                <td style={{ padding: "7px 10px", color: "#94a3b8", textAlign: "center" }}>
                                  {isLogOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </td>
                              </tr>

                              {/* Expanded detail row — plain English summary */}
                              {isLogOpen && (() => {
                                // Parse browser & OS from user agent
                                const ua = log.user_agent ?? "";
                                const browser =
                                  ua.includes("Edg/") ? "Edge" :
                                    ua.includes("OPR/") ? "Opera" :
                                      ua.includes("Chrome/") ? "Chrome" :
                                        ua.includes("Safari/") && !ua.includes("Chrome") ? "Safari" :
                                          ua.includes("Firefox/") ? "Firefox" : "Browser";
                                const os =
                                  ua.includes("Windows NT 10") ? "Windows 10/11" :
                                    ua.includes("Windows NT 6") ? "Windows 7/8" :
                                      ua.includes("Mac OS X") ? "macOS" :
                                        ua.includes("Android") ? "Android" :
                                          ua.includes("iPhone") ? "iPhone" :
                                            ua.includes("Linux") ? "Linux" : "Unknown OS";

                                // Human readable label for track ID
                                const tidLabel = trackId
                                  ? String(trackId)
                                    .replace(/_/g, " ")
                                    .replace(/\bbtn\b/g, "button")
                                    .replace(/\bsidebar nav\b/g, "sidebar →")
                                    .replace(/\bselect\b/g, "dropdown")
                                    .replace(/\binput\b/g, "field")
                                    .replace(/^(.)/, (c: string) => c.toUpperCase())
                                  : null;

                                // What action label
                                const actionLabel =
                                  log.event_type === "page_view" ? "Visited a page" :
                                    log.event_type === "page_exit" ? "Left page (Dwell Time)" :
                                      log.event_type === "element_click" ? "Clicked something" :
                                        log.event_type === "rage_click" ? "Clicked repeatedly (frustrated)" :
                                          log.event_type;

                                // Is filterVal a navigation path?
                                const navTarget = filterVal && String(filterVal).startsWith("/") ? String(filterVal) : null;

                                const pill = (text: string, color: string, bg: string) => (
                                  <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: bg, color, marginRight: 6, marginBottom: 4 }}>{text}</span>
                                );

                                return (
                                  <tr key={`bexp-${log.id}`}>
                                    <td colSpan={8} style={{ padding: 0, background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "2px solid #e2e8f0" }}>
                                      <div style={{ padding: "14px 20px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>

                                        {/* Action sentence */}
                                        <div style={{ flex: "1 1 260px", minWidth: 220 }}>
                                          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>What happened</p>
                                          <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{actionLabel}</p>
                                          <div>
                                            {tidLabel && pill(tidLabel, "#0284c7", "#e0f2fe")}
                                            {navTarget && pill(`→ ${navTarget}`, "#10b981", "#f0fdf4")}
                                            {(log.event_type === "page_exit" || log.event_type === "page_view") && props.duration_seconds && pill(`⏱️ Stayed ${props.duration_seconds}s`, "#0f766e", "#ccfbf1")}
                                            {props.text && !tidLabel && pill(String(props.text).slice(0, 40), "#64748b", "#f1f5f9")}
                                          </div>
                                        </div>

                                        {/* Page */}
                                        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
                                          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>On page</p>
                                          <p style={{ margin: 0, fontSize: 12, color: "#475569", fontFamily: "monospace", fontWeight: 500 }}>{log.page_path}</p>
                                        </div>

                                        {/* Device */}
                                        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
                                          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Device</p>
                                          <p style={{ margin: 0, fontSize: 12, color: "#1e293b", fontWeight: 600 }}>{browser}</p>
                                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>{os}</p>
                                        </div>

                                        {/* Time */}
                                        <div style={{ flex: "1 1 130px", minWidth: 110 }}>
                                          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Time</p>
                                          <p style={{ margin: 0, fontSize: 12, color: "#1e293b", fontWeight: 600 }}>{timeStr}</p>
                                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>{dateStr}</p>
                                        </div>

                                        {/* User */}
                                        <div style={{ flex: "1 1 180px", minWidth: 160 }}>
                                          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>User</p>
                                          <p style={{ margin: 0, fontSize: 12, color: "#1e293b", fontWeight: 600, wordBreak: "break-all" }}>{log.user_email ?? "Anonymous"}</p>

                                        </div>

                                      </div>
                                    </td>
                                  </tr>
                                );
                              })()}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination footer */}
                <div style={{ padding: "10px 18px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    Page {safePage + 1} of {totalPages} · {filteredLogs.length} events
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setBehaviorPage(0)} disabled={safePage === 0} className="hdr-btn" style={{ opacity: safePage === 0 ? 0.4 : 1, fontSize: 11 }}>«</button>
                    <button onClick={() => setBehaviorPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="hdr-btn" style={{ opacity: safePage === 0 ? 0.4 : 1, fontSize: 11 }}>‹ Prev</button>
                    <button onClick={() => setBehaviorPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} className="hdr-btn" style={{ opacity: safePage >= totalPages - 1 ? 0.4 : 1, fontSize: 11 }}>Next ›</button>
                    <button onClick={() => setBehaviorPage(totalPages - 1)} disabled={safePage >= totalPages - 1} className="hdr-btn" style={{ opacity: safePage >= totalPages - 1 ? 0.4 : 1, fontSize: 11 }}>»</button>
                  </div>
                  <span style={{ fontSize: 11, color: "#cbd5e1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Insydz · Behavior Analytics</span>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function UsagePill({ used, color }: { used: number; color: string }) {
  if (!used) return <span style={{ fontSize: 11, color: "#cbd5e1" }}>0</span>;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", padding: "2px 8px", borderRadius: 4 }}>
      {used}
    </span>
  );
}

function DetailCard({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid #f1f5f9", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ color }}>{icon}</span>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "4px 0", borderBottom: "1px solid #f8fafc" }}>
      <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, color: value ? "#1e293b" : "#cbd5e1", fontWeight: value ? 500 : 400, textAlign: "right", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>
        {value === null || value === undefined || value === "" ? "—" : String(value)}
      </span>
    </div>
  );
}

function PanelHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{title}</p>
      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{sub}</p>
    </div>
  );
}

// â”€â”€ CSS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar       { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f8fafc; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

  /* Beautiful Table Slider (Scrollbar) */
  .table-scroll-container {
    overflow-x: auto;
    overflow-y: auto;
    max-height: calc(100vh - 240px);
    padding-bottom: 8px;
  }
  .table-scroll-container::-webkit-scrollbar {
    height: 14px;
  }
  .table-scroll-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }
  .table-scroll-container::-webkit-scrollbar-thumb {
    background: #94a3b8;
    border-radius: 10px;
    border: 3px solid #f1f5f9;
  }
  .table-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }

  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cellIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

  .fade-in { animation: fadeIn 0.45s ease forwards; }
  .flex-between { display:flex; justify-content:space-between; align-items:flex-start; }
  .mb-6 { margin-bottom: 24px; }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }
  .kpi-card {
    background: white; border-radius: 14px; padding: 18px 16px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;
    animation: cellIn 0.45s ease forwards; opacity: 0;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .kpi-card:hover { box-shadow: 0 6px 22px rgba(0,0,0,0.1); transform: translateY(-2px); }

  .mid-grid {
    display: grid;
    grid-template-columns: 1.5fr 1.2fr 1fr;
    gap: 14px;
    margin-bottom: 18px;
  }

  .panel {
    background: white; border-radius: 14px; padding: 20px 22px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;
    margin-bottom: 18px;
  }

  .hdr-btn {
    display: flex; align-items: center; gap: 6px;
    background: white; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 6px 13px; color: #64748b; font-size: 12px; cursor: pointer;
    font-family: inherit; font-weight: 500; transition: all 0.15s;
  }
  .hdr-btn:hover { background: #f8fafc; border-color: #6366f1; color: #6366f1; }

  .tbl-input {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 7px 12px; color: #1e293b; font-size: 12px;
    font-family: inherit; outline: none;
  }
  .tbl-input::placeholder { color: #94a3b8; }
  .tbl-input:focus { border-color: #6366f1; }

  .tbl-select {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 7px 12px; color: #64748b; font-size: 12px; cursor: pointer;
    font-family: inherit; outline: none;
  }
  .tbl-select:focus { border-color: #6366f1; }

  /* Table styling */
  table thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8fafc;
    box-shadow: 0 1px 0 #f1f5f9;
  }
  
  .tbl-row { border-top: 1px solid #f8fafc; transition: background 0.12s; }
  .tbl-row:hover { background: #f0f4ff; }

  @media (max-width: 1280px) { .kpi-grid { grid-template-columns: repeat(3,1fr); } }
  @media (max-width: 900px)  { .mid-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px)  { .kpi-grid { grid-template-columns: repeat(2,1fr); } }
`;
