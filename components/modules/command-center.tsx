"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Users, Package, CreditCard, ShieldAlert, 
  ArrowUpRight, ArrowDownRight, Award, Zap, Bell, CheckCircle,
  Printer
} from "lucide-react";
import { useAppState } from "../../lib/store";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

export const CommandCenter: React.FC = () => {
  const { orders, customers, inventory, invoices, alerts, clearAlert, setCurrentTab, currentProfile } = useAppState();
  
  // Real-time Ticking Revenue state
  const [liveRevenue, setLiveRevenue] = useState(1485230);

  useEffect(() => {
    // Ticking revenue simulator: adds between LKR 50 and LKR 400 every few seconds
    const interval = setInterval(() => {
      setLiveRevenue(prev => prev + Math.floor(50 + Math.random() * 350));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isShop = currentProfile.type === "shop";
  const shopId = currentProfile.refId;
  const activeCustomer = customers.find(c => c.id === shopId);
  const availableCredit = activeCustomer ? activeCustomer.creditLimit - activeCustomer.currentBalance : 0;

  // Filter lists based on role
  const filteredOrders = isShop ? orders.filter(o => o.customerId === shopId) : orders;
  const filteredInvoices = isShop ? invoices.filter(i => i.customerId === shopId) : invoices;
  const filteredAlerts = isShop ? alerts.filter(a => a.message.includes(currentProfile.name) || a.type === "stock") : alerts;

  // Compute stats
  const totalOrdersVal = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = inventory.filter(i => i.stock < i.minStockAlert).length;
  const overdueInvoices = filteredInvoices.filter(i => i.status === "Overdue");
  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);

  // Sales velocity graph mock data
  const chartData = [
    { name: "09:00", sales: isShop ? Math.floor(120000 * 0.15) : 120000, margin: isShop ? Math.floor(38000 * 0.15) : 38000 },
    { name: "11:00", sales: isShop ? Math.floor(240000 * 0.15) : 240000, margin: isShop ? Math.floor(76000 * 0.15) : 76000 },
    { name: "13:00", sales: isShop ? Math.floor(180000 * 0.15) : 180000, margin: isShop ? Math.floor(55000 * 0.15) : 55000 },
    { name: "15:00", sales: isShop ? Math.floor(310000 * 0.15) : 310000, margin: isShop ? Math.floor(92000 * 0.15) : 92000 },
    { name: "17:00", sales: isShop ? Math.floor((310000 + totalOrdersVal) * 0.15) : (totalOrdersVal > 0 ? 310000 + totalOrdersVal : 280000), margin: isShop ? Math.floor(85000 * 0.15) : 85000 },
    { name: "19:00", sales: isShop ? Math.floor(420000 * 0.15) : 420000, margin: isShop ? Math.floor(125000 * 0.15) : 125000 }
  ];

  // Outstanding aging distribution for graph
  const agingData = [
    { name: "0-30 Days", amount: filteredInvoices.filter(i => i.daysOverdue <= 30 && i.status !== "Paid").reduce((sum, i) => sum + i.amount, 0) || (isShop ? 0 : 45000) },
    { name: "31-60 Days", amount: isShop ? 0 : 29500 },
    { name: "61-90 Days", amount: isShop ? 0 : 15000 },
    { name: "90+ Days", amount: isShop ? 24000 : 24000 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Panel with Ticking Revenue */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-md relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none rounded-full animate-ambient" />
        
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              Executive Command Center
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Real-time operations, supply chain performance, and risk metrics.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="no-print self-start sm:self-center flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            Print PDF Report
          </button>
        </div>

        {/* Live Ticker Widget */}
        <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 px-5 py-3 rounded-lg shadow-inner">
          <div className="p-2 rounded bg-amber-500/10 text-amber-500">
            <Zap className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold font-bold">
              {isShop ? "Available Credit Limit" : "Live Est. Daily Gross Revenue"}
            </p>
            <div className="text-xl font-bold text-zinc-50 font-mono tracking-tight transition-all duration-300">
              LKR {isShop ? availableCredit.toLocaleString() : liveRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue / Purchases */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700/80 transition-all cursor-pointer"
          onClick={() => setCurrentTab("sales")}
        >
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isShop ? "Your Gross Purchases" : "Gross Sales Achieved"}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
              LKR {isShop 
                ? totalOrdersVal.toLocaleString() 
                : (1685230 + totalOrdersVal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </h3>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isShop ? "Accrued order volumes" : "+18.4% from yesterday"}</span>
            </p>
          </div>
        </motion.div>

        {/* Card 2: Customers / Standings */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700/80 transition-all cursor-pointer"
          onClick={() => setCurrentTab("sales")}
        >
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isShop ? "Your Account Tier" : "Active Distributors"}
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-100 font-mono truncate">
              {isShop ? (availableCredit > 50000 ? "Platinum Grade" : "Standard Cash") : `${customers.length} Accounts`}
            </h3>
            <p className="text-xs text-indigo-400 flex items-center gap-1 mt-1 font-medium">
              <span>{isShop ? `Loyalty Score: ${activeCustomer?.loyaltyScore || 100}/100` : "98% visit attendance"}</span>
            </p>
          </div>
        </motion.div>

        {/* Card 3: Stock Status */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700/80 transition-all cursor-pointer"
          onClick={() => setCurrentTab("inventory")}
        >
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Alert Lines</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
              {lowStockCount} SKUs Critical
            </h3>
            <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
              {lowStockCount > 0 ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Immediate reorder advised</span>
                </>
              ) : (
                <span>All warehouse stocks healthy</span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Card 4: Outstanding */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700/80 transition-all cursor-pointer"
          onClick={() => setCurrentTab("sales")}
        >
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Outstanding</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
              LKR {overdueTotal.toLocaleString()}
            </h3>
            <p className="text-xs text-amber-500 flex items-center gap-1 mt-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{overdueInvoices.length} invoices overdue</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph 1: Sales Velocity Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Live Sales Intraday Velocity</h3>
              <p className="text-xs text-zinc-500">Hourly sales volume vs profit margins</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 font-mono">Real-time</span>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px", color: "#f4f4f5" }}
                  formatter={(val: any) => [`LKR ${Number(val).toLocaleString()}`]}
                />
                <Area type="monotone" dataKey="sales" name="Sales Volume" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="margin" name="Profit Margin" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#marginGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Outstanding Aging Bar Chart */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
          <h3 className="text-sm font-bold text-zinc-200 mb-1">Aging Credit Allocation</h3>
          <p className="text-xs text-zinc-500 mb-4">Outstanding balances distributed by overdue duration</p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "8px" }}
                  formatter={(val: any) => [`LKR ${Number(val).toLocaleString()}`]}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {agingData.map((entry, index) => {
                    const colors = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"];
                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-4 border-t border-zinc-800/80 pt-3">
            <span>Critical overdue (90+ Days):</span>
            <span className="font-bold text-rose-500">LKR 24,000</span>
          </div>
        </div>
      </div>

      {/* AI Risk Panel & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Risk Panel */}
        <div className={`${isShop ? "lg:col-span-3" : "lg:col-span-2"} p-5 rounded-xl border border-zinc-800 bg-zinc-950/20 relative`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-zinc-200">AI Risk Alerts & Insights</h3>
            </div>
            <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3 text-amber-500" />
              Decision Engine V2.0
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filteredAlerts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-sm"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>No active risk alerts detected. The operating ecosystem is fully synchronized.</span>
                </motion.div>
              ) : (
                filteredAlerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className={`flex items-start justify-between p-3.5 rounded-lg border ${
                      alert.severity === "critical"
                        ? "bg-rose-500/5 border-rose-500/15 text-rose-300"
                        : "bg-amber-500/5 border-amber-500/15 text-amber-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 ${
                        alert.severity === "critical" ? "bg-rose-500" : "bg-amber-500"
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{alert.message}</p>
                        <span className="text-[10px] text-zinc-500 block mt-1">{alert.time}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => clearAlert(alert.id)}
                      className="text-xs px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-all"
                    >
                      Clear
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Performance Leaderboard */}
        {!isShop && (
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-zinc-200">Employee Ranking (CRM Velocity)</h3>
            </div>
            <div className="space-y-4">
              {/* Sales rep 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500 bg-zinc-900 w-5 h-5 rounded-full flex items-center justify-center border border-zinc-800">1</span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Manoj De Silva</p>
                    <p className="text-[10px] text-zinc-500">Sales achieved: LKR 850,000</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-500">+12% over target</span>
              </div>

              {/* Sales rep 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500 bg-zinc-900 w-5 h-5 rounded-full flex items-center justify-center border border-zinc-800">2</span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Nishan Alwis</p>
                    <p className="text-[10px] text-zinc-500">Sales achieved: LKR 520,000</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-400">On Target</span>
              </div>

              {/* Sales rep 3 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500 bg-zinc-900 w-5 h-5 rounded-full flex items-center justify-center border border-zinc-800">3</span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Priyanga Silva</p>
                    <p className="text-[10px] text-zinc-500">Sales achieved: LKR 310,000</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-500">-5% under target</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
