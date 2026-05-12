"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import {
  RefreshCw, Search, ArrowUpRight, ArrowDownRight,
  Users, ShieldCheck, ShieldOff, Crown, TrendingUp,
  Wallet, IndianRupee,
} from "lucide-react";

const API_BASE_URL = ((process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com")) || (process.env.NEXT_PUBLIC_API_URL || "https://api.insydz.com");
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "") || "syatharthdelhi@gmail.com";
const TIER_PRICE: Record<string, number> = { free: 0, basic: 1999, premium: 2999 };

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

interface Stats {
  total_users: number; verified_users: number;
  unverified_users: number; recent_signups_7days: number;
  by_tier: { free: number; basic: number; premium: number };
}
interface UserRow {
  id: number; first_name: string; last_name: string;
  email: string; subscription_tier: "free" | "basic" | "premium";
  is_verified: boolean; ai_chat_used: number; created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [lastUpd, setLastUpd] = useState(new Date());

  useEffect(() => {
    if (!user) return;
    if (user.email !== ADMIN_EMAIL) { router.push("/dashboard"); return; }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { 
        credentials: "include",
        cache: 'no-store'
      });
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();
      setStats(data.stats); setUsers(data.users); setLastUpd(new Date());
    } catch { router.push("/dashboard"); }
    finally { setIsLoading(false); }
  };

  const basicCount = stats?.by_tier?.basic ?? 0;
  const premiumCount = stats?.by_tier?.premium ?? 0;
  const freeCount = stats?.by_tier?.free ?? 0;
  const tierTotal = freeCount + basicCount + premiumCount;
  const basicMRR = basicCount * TIER_PRICE.basic;
  const premiumMRR = premiumCount * TIER_PRICE.premium;
  const totalMRR = basicMRR + premiumMRR;
  const paidUsers = basicCount + premiumCount;

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (!q || u.email.toLowerCase().includes(q) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)) &&
      (filterTier === "all" || u.subscription_tier === filterTier)
    );
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "400px",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        border: "3px solid #e2e8f0", borderTop: "3px solid #6366f1",
        animation: "spin 0.8s linear infinite"
      }} />
      <p style={{
        marginTop: 14, color: "#94a3b8", fontSize: 13,
        letterSpacing: "0.06em"
      }}>Loading…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="space-y-8" style={{ fontFamily: "Inter, -apple-system, sans-serif", color: "#1e293b" }}>
      <style>{CSS}</style>

      {/* Page title & Refresh */}
      <div className="flex justify-between items-start mb-4">
        <div className="fade-in">
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
            Admin Overview
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
            Welcome back — here's what's happening today.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            Updated {lastUpd.toLocaleTimeString("en-IN",
              { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button onClick={fetchStats} className="hdr-btn">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────────── */}
      <div className="kpi-grid fade-in" style={{ animationDelay: "0.04s" }}>
        {([
          {
            label: "Total Users", value: stats?.total_users ?? 0,
            sub: `+${stats?.recent_signups_7days ?? 0} this week`,
            up: true, isRupee: false,
            icon: <Users size={20} />,
            grad: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            glow: "#6366f133",
          },
          {
            label: "New (7 Days)", value: stats?.recent_signups_7days ?? 0,
            sub: "recent signups", up: true, isRupee: false,
            icon: <TrendingUp size={20} />,
            grad: "linear-gradient(135deg,#06b6d4,#0284c7)",
            glow: "#06b6d433",
          },
          {
            label: "Verified", value: stats?.verified_users ?? 0,
            sub: `${pct(stats?.verified_users ?? 0, stats?.total_users ?? 0)}% of total`,
            up: true, isRupee: false,
            icon: <ShieldCheck size={20} />,
            grad: "linear-gradient(135deg,#10b981,#059669)",
            glow: "#10b98133",
          },
          {
            label: "Unverified", value: stats?.unverified_users ?? 0,
            sub: "pending verification", up: false, isRupee: false,
            icon: <ShieldOff size={20} />,
            grad: "linear-gradient(135deg,#f59e0b,#ef4444)",
            glow: "#f59e0b33",
          },
          {
            label: "Monthly Revenue", value: totalMRR,
            sub: `${paidUsers} paid users`, up: true, isRupee: true,
            icon: <IndianRupee size={20} />,
            grad: "linear-gradient(135deg,#10b981,#059669)",
            glow: "#10b98133",
          },
          {
            label: "Paid Users", value: paidUsers,
            sub: `${pct(paidUsers, tierTotal)}% conversion`,
            up: true, isRupee: false,
            icon: <Wallet size={20} />,
            grad: "linear-gradient(135deg,#f59e0b,#f97316)",
            glow: "#f59e0b33",
          },
        ] as const).map((card, i) => (
          <div key={i} className="kpi-card"
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ flex: 1 }}>
              <p style={{
                margin: "0 0 10px", fontSize: 11, fontWeight: 600,
                color: "#94a3b8", textTransform: "uppercase",
                letterSpacing: "0.1em"
              }}>
                {card.label}
              </p>
              <p style={{
                margin: "0 0 10px",
                fontSize: card.isRupee ? 22 : 30,
                fontWeight: 700, color: "#1e293b", lineHeight: 1
              }}>
                {card.isRupee
                  ? "₹" + card.value.toLocaleString("en-IN")
                  : card.value.toLocaleString("en-IN")}
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 12,
                color: card.up ? "#10b981" : "#ef4444"
              }}>
                {card.up
                  ? <ArrowUpRight size={13} />
                  : <ArrowDownRight size={13} />}
                <span>{card.sub}</span>
              </div>
            </div>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: card.grad,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white",
              boxShadow: `0 6px 18px ${card.glow}`,
            }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* ── MIDDLE ROW ──────────────────────────────────────────────── */}
      <div className="mid-grid fade-in" style={{ animationDelay: "0.18s" }}>

        {/* Tier Distribution */}
        <div className="panel">
          <PanelHead title="Tier Distribution"
            sub="Users by subscription plan" />
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {([
              {
                label: "Free", val: freeCount, color: "#94a3b8",
                bg: "#f1f5f9", border: "#e2e8f0"
              },
              {
                label: "Basic", val: basicCount, color: "#6366f1",
                bg: "#ede9fe", border: "#c4b5fd"
              },
              {
                label: "Premium", val: premiumCount, color: "#f59e0b",
                bg: "#fef3c7", border: "#fde68a"
              },
            ]).map(t => (
              <div key={t.label} style={{
                flex: 1, padding: "14px 16px",
                background: t.bg, border: `1px solid ${t.border}`,
                borderRadius: 12,
              }}>
                <p style={{
                  margin: "0 0 6px", fontSize: 10, fontWeight: 600,
                  color: t.color, letterSpacing: "0.1em",
                  textTransform: "uppercase"
                }}>{t.label}</p>
                <p style={{
                  margin: "0 0 3px", fontSize: 24,
                  fontWeight: 700, color: "#1e293b"
                }}>{t.val}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                  {pct(t.val, tierTotal)}% of users
                </p>
              </div>
            ))}
          </div>
          {/* Stacked bar */}
          <div style={{
            height: 8, borderRadius: 6,
            display: "flex", overflow: "hidden", gap: 2
          }}>
            <div style={{
              width: `${pct(freeCount, tierTotal)}%`,
              background: "#94a3b8", transition: "width 0.8s ease",
              borderRadius: "6px 0 0 6px"
            }} />
            <div style={{
              width: `${pct(basicCount, tierTotal)}%`,
              background: "#6366f1", transition: "width 0.9s ease 0.05s"
            }} />
            <div style={{
              width: `${pct(premiumCount, tierTotal)}%`,
              background: "#f59e0b", transition: "width 1s ease 0.1s",
              borderRadius: "0 6px 6px 0"
            }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            {([["#94a3b8", "Free"], ["#6366f1", "Basic"],
            ["#f59e0b", "Premium"]] as const).map(([c, l]) => (
              <div key={l} style={{
                display: "flex", alignItems: "center",
                gap: 6, fontSize: 11, color: "#64748b"
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: c
                }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Revenue */}
        <div className="panel">
          <PanelHead title="Revenue" sub="Monthly & annual breakdown" />

          <div style={{
            background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
            border: "1px solid #bbf7d0",
            borderRadius: 12, padding: "16px 18px", marginBottom: 16,
          }}>
            <p style={{
              margin: "0 0 5px", fontSize: 10, fontWeight: 600,
              color: "#16a34a", letterSpacing: "0.14em",
              textTransform: "uppercase"
            }}>Monthly Recurring Revenue</p>
            <p style={{
              margin: 0, fontSize: 28, fontWeight: 700,
              color: "#15803d"
            }}>{inr(totalMRR)}</p>
          </div>

          {([
            {
              label: "Basic", count: basicCount, mrr: basicMRR,
              color: "#6366f1", bg: "#ede9fe"
            },
            {
              label: "Premium", count: premiumCount, mrr: premiumMRR,
              color: "#f59e0b", bg: "#fef3c7"
            },
          ]).map((row, i, arr) => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "11px 0",
              borderBottom: i < arr.length - 1
                ? "1px solid #f1f5f9" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: row.color
                }} />
                <span style={{
                  fontSize: 13, color: "#1e293b",
                  fontWeight: 500
                }}>{row.label}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {row.count} × {inr(TIER_PRICE[row.label.toLowerCase()])}
                </span>
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: row.color
              }}>{inr(row.mrr)}</span>
            </div>
          ))}

          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", paddingTop: 12, marginTop: 4,
            borderTop: "1px solid #f1f5f9"
          }}>
            <span style={{
              fontSize: 11, color: "#94a3b8",
              fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.1em"
            }}>ARR Projection</span>
            <span style={{
              fontSize: 15, fontWeight: 700,
              color: "#1e293b"
            }}>{inr(totalMRR * 12)}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="panel">
          <PanelHead title="Quick Stats" sub="Key metrics at a glance" />
          {([
            {
              label: "Verification Rate",
              value: `${pct(stats?.verified_users ?? 0, stats?.total_users ?? 0)}%`,
              color: "#10b981"
            },
            {
              label: "Paid Users",
              value: paidUsers, color: "#6366f1"
            },
            {
              label: "Free Users",
              value: freeCount, color: "#94a3b8"
            },
            {
              label: "Weekly Growth",
              value: `+${stats?.recent_signups_7days ?? 0}`,
              color: "#f59e0b"
            },
            {
              label: "ARPU (Paid)",
              value: paidUsers
                ? inr(Math.round(totalMRR / paidUsers)) : "—",
              color: "#8b5cf6"
            },
          ]).map((item, i, arr) => (
            <div key={item.label} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "11px 0",
              borderBottom: i < arr.length - 1
                ? "1px solid #f1f5f9" : "none",
            }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                {item.label}
              </span>
              <span style={{
                fontSize: 15, fontWeight: 700,
                color: item.color
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── USERS TABLE ─────────────────────────────────────────────── */}
      <div className="panel fade-in"
        style={{ padding: 0, animationDelay: "0.3s", overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 14
        }}>
          <div>
            <p style={{
              margin: "0 0 2px", fontSize: 15,
              fontWeight: 700, color: "#1e293b"
            }}>All Users</p>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
              {filtered.length} of {users.length} users
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search size={12} style={{
                position: "absolute", left: 10,
                top: "50%", transform: "translateY(-50%)",
                color: "#94a3b8"
              }} />
              <input value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="tbl-input"
                style={{ paddingLeft: 28 }} />
            </div>
            <select value={filterTier}
              onChange={e => setFilterTier(e.target.value)}
              className="tbl-select">
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["User", "Email", "Tier", "Status",
                  "MRR Contribution", "AI Used", "Joined"].map(h => (
                    <th key={h} style={{
                      padding: "10px 18px", textAlign: "left",
                      fontSize: 10, fontWeight: 600, color: "#94a3b8",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #f1f5f9",
                    }}>{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{
                  padding: 52, textAlign: "center",
                  color: "#94a3b8", fontSize: 14,
                }}>No users found</td></tr>
              ) : filtered.map(u => {
                const userMRR = TIER_PRICE[u.subscription_tier] ?? 0;
                const hue = (u.id * 47) % 360;
                const tierMeta = {
                  free: {
                    color: "#64748b", bg: "#f1f5f9",
                    border: "#e2e8f0"
                  },
                  basic: {
                    color: "#6366f1", bg: "#ede9fe",
                    border: "#c4b5fd"
                  },
                  premium: {
                    color: "#f59e0b", bg: "#fef3c7",
                    border: "#fde68a"
                  },
                }[u.subscription_tier];

                return (
                  <tr key={u.id} className="tbl-row">

                    {/* Name */}
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center", gap: 10
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 10,
                          flexShrink: 0,
                          background: `hsl(${hue},60%,92%)`,
                          border: `1px solid hsl(${hue},50%,82%)`,
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 12,
                          fontWeight: 700,
                          color: `hsl(${hue},55%,38%)`,
                        }}>
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <div>
                          <p style={{
                            margin: 0, fontSize: 13,
                            fontWeight: 600, color: "#1e293b"
                          }}>
                            {u.first_name} {u.last_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{
                      padding: "12px 18px", fontSize: 13,
                      color: "#64748b"
                    }}>{u.email}</td>

                    {/* Tier */}
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{
                        padding: "4px 10px", fontSize: 11,
                        fontWeight: 600, borderRadius: 6,
                        textTransform: "capitalize",
                        background: tierMeta.bg,
                        color: tierMeta.color,
                        border: `1px solid ${tierMeta.border}`,
                      }}>
                        {u.subscription_tier}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center", gap: 6
                      }}>
                        <div style={{
                          width: 7, height: 7,
                          borderRadius: "50%",
                          background: u.is_verified
                            ? "#10b981" : "#f59e0b"
                        }} />
                        <span style={{
                          fontSize: 12, fontWeight: 500,
                          color: u.is_verified
                            ? "#10b981" : "#f59e0b"
                        }}>
                          {u.is_verified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </td>

                    {/* MRR */}
                    <td style={{ padding: "12px 18px" }}>
                      {userMRR > 0 ? (
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: "#6366f1"
                        }}>
                          {inr(userMRR)}
                          <span style={{
                            fontSize: 11,
                            color: "#94a3b8", fontWeight: 400
                          }}>
                            /mo
                          </span>
                        </span>
                      ) : (
                        <span style={{
                          color: "#cbd5e1",
                          fontSize: 13
                        }}>—</span>
                      )}
                    </td>

                    {/* AI Used */}
                    <td style={{
                      padding: "12px 18px", fontSize: 13,
                      color: "#64748b"
                    }}>
                      {u.ai_chat_used ?? 0}
                    </td>

                    {/* Joined */}
                    <td style={{
                      padding: "12px 18px", fontSize: 12,
                      color: "#94a3b8", whiteSpace: "nowrap"
                    }}>
                      {new Date(u.created_at).toLocaleDateString("en-IN",
                        { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 24px",
          borderTop: "1px solid #f1f5f9",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", background: "#f8fafc"
        }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            Showing {filtered.length} result
            {filtered.length !== 1 ? "s" : ""}
          </span>
          <span style={{
            fontSize: 11, color: "#cbd5e1",
            letterSpacing: "0.1em", textTransform: "uppercase"
          }}>
            Insydz · Restricted Access
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── PanelHead ────────────────────────────────────────────────────────────────
function PanelHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{
        margin: "0 0 2px", fontSize: 15,
        fontWeight: 700, color: "#1e293b"
      }}>{title}</p>
      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{sub}</p>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  ::-webkit-scrollbar       { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f8fafc; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cellIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fade-in { animation: fadeIn 0.45s ease forwards; }

  /* KPI grid */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .kpi-card {
    background: white;
    border-radius: 14px;
    padding: 20px 18px;
    display: flex; align-items: center; gap: 14px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    border: 1px solid #f1f5f9;
    animation: cellIn 0.45s ease forwards;
    opacity: 0;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .kpi-card:hover {
    box-shadow: 0 6px 22px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  /* Middle row */
  .mid-grid {
    display: grid;
    grid-template-columns: 1.5fr 1.3fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  /* Shared panel */
  .panel {
    background: white;
    border-radius: 14px;
    padding: 22px 24px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
    border: 1px solid #f1f5f9;
  }

  /* Header refresh button */
  .hdr-btn {
    display: flex; align-items: center; gap: 6px;
    background: white; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 6px 14px;
    color: #64748b; font-size: 12px; cursor: pointer;
    font-family: inherit; font-weight: 500;
    transition: all 0.15s ease;
  }
  .hdr-btn:hover {
    background: #f8fafc; border-color: #6366f1; color: #6366f1;
  }

  /* Table inputs */
  .tbl-input {
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 7px 12px;
    color: #1e293b; font-size: 13px; width: 185px;
    font-family: inherit; outline: none;
  }
  .tbl-input::placeholder { color: #94a3b8; }
  .tbl-input:focus { border-color: #6366f1; }

  .tbl-select {
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 7px 12px;
    color: #64748b; font-size: 13px; cursor: pointer;
    font-family: inherit; outline: none;
  }
  .tbl-select:focus { border-color: #6366f1; }

  /* Table rows */
  .tbl-row { border-top: 1px solid #f8fafc; transition: background 0.12s; }
  .tbl-row:hover { background: #f8fafc; }

  /* Responsive */
  @media (max-width: 1280px) {
    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 768px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .mid-grid { grid-template-columns: 1fr; }
  }
`;
