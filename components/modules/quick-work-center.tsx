"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, ShoppingBag, Users, Truck, Map, CreditCard, BarChart3, Search, 
  Plus, ChevronRight, AlertTriangle, TrendingUp, CheckCircle, X, DollarSign,
  Briefcase, UserPlus, FileText, Compass
} from "lucide-react";
import { useAppState } from "../../lib/store";

interface QuickWorkCenterProps {
  setSearchOpen: (open: boolean) => void;
}

export const QuickWorkCenter: React.FC<QuickWorkCenterProps> = ({ setSearchOpen }) => {
  const { 
    customers, inventory, orders, invoices, deliveries, routes,
    setCurrentTab, addCustomer, addInventoryItem, addOrder 
  } = useAppState();

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  
  // Success toast states
  const [successMsg, setSuccessMsg] = useState("");

  // Add Product Form State
  const [prodName, setProdName] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodCat, setProdCat] = useState("Valves");
  const [prodStock, setProdStock] = useState(10);
  const [prodMinStock, setProdMinStock] = useState(5);
  const [prodPrice, setProdPrice] = useState(15.0);
  const [prodBin, setProdBin] = useState("A-01-01");

  // Add Customer Form State
  const [custName, setCustName] = useState("");
  const [custContact, setCustContact] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custCredit, setCustCredit] = useState(20000);
  const [custLat, setCustLat] = useState(6.9271);
  const [custLng, setCustLng] = useState(79.8612);

  // Quick Order Form State
  const [ordCustomer, setOrdCustomer] = useState(customers[0]?.id || "");
  const [ordProduct, setOrdProduct] = useState(inventory[0]?.id || "");
  const [ordQty, setOrdQty] = useState(5);
  const [ordPriceType, setOrdPriceType] = useState<"wholesale" | "retail" | "credit">("wholesale");

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSku) return;

    addInventoryItem({
      sku: prodSku,
      name: prodName,
      category: prodCat,
      stock: prodStock,
      minStockAlert: prodMinStock,
      binLocation: prodBin,
      wholesalePrice: prodPrice,
      retailPrice: Number((prodPrice * 1.2).toFixed(2)),
      creditPrice: Number((prodPrice * 1.1).toFixed(2))
    });

    // Reset Form
    setProdName("");
    setProdSku("");
    setProdStock(10);
    setProdPrice(15.0);
    setProductModalOpen(false);
    showSuccess(`Product "${prodName}" added successfully to inventory!`);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custContact || !custPhone) return;

    addCustomer({
      businessName: custName,
      contactName: custContact,
      email: custEmail || `${custContact.toLowerCase().replace(" ", "")}@ruwanbrass.lk`,
      phone: custPhone,
      creditLimit: custCredit,
      gps: { lat: custLat, lng: custLng }
    });

    // Reset Form
    setCustName("");
    setCustContact("");
    setCustEmail("");
    setCustPhone("");
    setCustCredit(20000);
    setCustomerModalOpen(false);
    showSuccess(`Customer "${custName}" registered successfully!`);
  };

  const handleQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordCustomer || !ordProduct || ordQty <= 0) return;

    addOrder(ordCustomer, [{ itemId: ordProduct, quantity: ordQty, priceType: ordPriceType }], 0);
    
    setOrderModalOpen(false);
    showSuccess(`Quick order created successfully! Dispatched delivery automatically.`);
  };

  // Metrics calculations
  const totalStockItems = inventory.reduce((acc, item) => acc + item.stock, 0);
  const lowStockCount = inventory.filter(item => item.stock < item.minStockAlert).length;
  const pendingOrders = orders.filter(o => o.status === "Approved" || o.status === "Draft").length;
  const transitOrders = orders.filter(o => o.status === "Shipped" || o.status === "In-Transit").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered" || o.status === "Paid").length;
  const activeRoutesCount = routes.filter(r => r.status === "In-Progress").length;
  const pendingDeliveries = deliveries.filter(d => d.status !== "Delivered" && d.status !== "Failed").length;
  
  // Finance Metrics
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.amount - inv.amountPaid), 0);
  const collectionsToday = invoices.filter(inv => inv.status === "Paid").reduce((acc, inv) => acc + inv.amountPaid, 0) || 128500; // fallback default
  const todaySales = orders.filter(o => {
    const today = new Date().toISOString().split("T")[0];
    return o.createdAt.startsWith(today);
  }).reduce((acc, o) => acc + o.total, 0);

  const modules = [
    {
      id: "stock",
      title: "Stock / Inventory",
      icon: Package,
      color: "border-l-emerald-500 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10",
      tab: "inventory",
      metrics: [
        { label: "Total Stocks", value: `${totalStockItems} items` },
        { label: "Alert Level Items", value: `${lowStockCount} lines`, isAlert: lowStockCount > 0 }
      ],
      quickActions: [
        { label: "Add Product", icon: Plus, action: () => setProductModalOpen(true) }
      ]
    },
    {
      id: "orders",
      title: "Orders Desk",
      icon: ShoppingBag,
      color: "border-l-amber-500 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10",
      tab: "sales",
      metrics: [
        { label: "Pending Orders", value: `${pendingOrders} orders` },
        { label: "Delivered", value: `${deliveredOrders} orders` }
      ],
      quickActions: [
        { label: "New Order", icon: Plus, action: () => setOrderModalOpen(true) }
      ]
    },
    {
      id: "customers",
      title: "Customer List",
      icon: Users,
      color: "border-l-indigo-500 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10",
      tab: "sales",
      metrics: [
        { label: "Total Customers", value: `${customers.length} registered` },
        { label: "At Churn Risk", value: `${customers.filter(c => c.churnProbability > 50).length} accounts`, isAlert: customers.some(c => c.churnProbability > 70) }
      ],
      quickActions: [
        { label: "Add Customer", icon: UserPlus, action: () => setCustomerModalOpen(true) }
      ]
    },
    {
      id: "deliveries",
      title: "Deliveries / Fleet",
      icon: Truck,
      color: "border-l-sky-500 text-sky-400 bg-sky-500/5 hover:bg-sky-500/10",
      tab: "fleet",
      metrics: [
        { label: "Active Shipments", value: `${pendingDeliveries} in transit` },
        { label: "Assigned Drivers", value: "Pradeep Perera" }
      ],
      quickActions: [
        { label: "Dispatch Map", icon: Compass, action: () => setCurrentTab("fleet") }
      ]
    },
    {
      id: "sales_team",
      title: "Sales Routes",
      icon: Map,
      color: "border-l-violet-500 text-violet-400 bg-violet-500/5 hover:bg-violet-500/10",
      tab: "routes",
      metrics: [
        { label: "Routes Running", value: `${activeRoutesCount} active rep(s)` },
        { label: "Covered Zones", value: "Colombo, Negombo, Kandy" }
      ],
      quickActions: [
        { label: "Route Planner", icon: Compass, action: () => setCurrentTab("routes") }
      ]
    },
    {
      id: "finance",
      title: "Finance & Ledger",
      icon: CreditCard,
      color: "border-l-rose-500 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10",
      tab: "commissions",
      metrics: [
        { label: "Today's Sales", value: `LKR ${todaySales.toLocaleString()}` },
        { label: "Outstanding Dues", value: `LKR ${totalOutstanding.toLocaleString()}`, isAlert: totalOutstanding > 40000 }
      ],
      quickActions: [
        { label: "Collections Info", icon: DollarSign, action: () => setCurrentTab("sales") }
      ]
    },
    {
      id: "reports",
      title: "Executive Reports",
      icon: BarChart3,
      color: "border-l-teal-500 text-teal-400 bg-teal-500/5 hover:bg-teal-500/10",
      tab: "dashboard",
      metrics: [
        { label: "Daily Revenue", value: `LKR ${(1485230).toLocaleString()}` },
        { label: "Commission Payouts", value: "LKR 48,750" }
      ],
      quickActions: [
        { label: "Analytical Dashboard", icon: FileText, action: () => setCurrentTab("dashboard") }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Success Alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-semibold rounded-xl flex items-center gap-3 shadow-lg"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Panel */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-amber-500/5 blur-[80px] pointer-events-none rounded-full" />
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-2">
          Simple Dashboard
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold uppercase font-mono tracking-wider">Quick Work Center</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1 leading-relaxed max-w-xl">
          One-click navigation and simplified controls designed for non-technical office staff. Add items, check metrics, and run routing.
        </p>
      </div>

      {/* Global Search shortcut card */}
      <div 
        onClick={() => setSearchOpen(true)}
        className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-700/80 cursor-pointer flex items-center transition-all shadow-md group"
      >
        <Search className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 transition-colors mr-3" />
        <span className="text-zinc-400 text-sm font-medium">Click here or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-xs font-mono">Ctrl+K</kbd> to search clients, orders, inventory...</span>
        <ChevronRight className="w-4 h-4 text-zinc-600 ml-auto group-hover:translate-x-1 transition-all" />
      </div>

      {/* Modules Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {modules.map(mod => (
          <motion.div
            key={mod.id}
            whileHover={{ y: -2 }}
            className={`p-5 rounded-xl border border-zinc-800/80 transition-all border-l-4 flex flex-col justify-between min-h-[200px] cursor-pointer shadow-md ${mod.color}`}
            onClick={() => setCurrentTab(mod.tab)}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wide">{mod.title}</h3>
              <div className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/50">
                <mod.icon className="w-5 h-5" />
              </div>
            </div>

            {/* Metrics List */}
            <div className="my-4 space-y-2.5">
              {mod.metrics.map((met, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">{met.label}</span>
                  <span className={`font-semibold font-mono ${
                    met.isAlert ? "text-rose-500 font-bold animate-pulse" : "text-zinc-300"
                  }`}>{met.value}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex gap-2 pt-3 border-t border-zinc-850">
              {mod.quickActions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation(); // don't trigger card click navigation
                    act.action();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-sm"
                >
                  <act.icon className="w-3.5 h-3.5" />
                  {act.label}
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Global Search Card representation */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setSearchOpen(true)}
          className="p-5 rounded-xl border border-zinc-850 bg-zinc-900/5 border-l-4 border-l-amber-500 flex flex-col justify-between hover:bg-amber-500/5 transition-all cursor-pointer min-h-[200px]"
        >
          <div className="flex justify-between items-start text-amber-400">
            <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wide">Universal Search</h3>
            <div className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/50">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed my-3">
            Search all database modules in one place. Instant results for parts, order records, or CRM profiles.
          </p>
          <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1">
            Trigger Finder Desk
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* MODALS */}
      
      {/* 1. Add Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={() => setProductModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-emerald-500" />
              Quick Add Inventory Item
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs text-zinc-300">
              <div>
                <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brass equal tee connector 1/2 inch"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">SKU Reference</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. R-BRS-TEE-05"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Category</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                  >
                    <option value="Valves">Valves</option>
                    <option value="Fittings">Fittings</option>
                    <option value="Taps & Faucets">Taps & Faucets</option>
                    <option value="Connectors">Connectors</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Stock Quantity</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                    value={prodStock}
                    onChange={(e) => setProdStock(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Alert Min</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                    value={prodMinStock}
                    onChange={(e) => setProdMinStock(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Wholesale (LKR)</label>
                  <input
                    type="number"
                    min={0.1}
                    step={0.01}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Bin Storage Location</label>
                <input
                  type="text"
                  placeholder="e.g. A-12-04"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                  value={prodBin}
                  onChange={(e) => setProdBin(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="w-1/3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Confirm Insert
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Add Customer Modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={() => setCustomerModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              Register New Distributor Account
            </h3>
            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs text-zinc-300">
              <div>
                <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Hardware Distributors"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Contact Person Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ruwan Wijetunga"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500"
                  value={custContact}
                  onChange={(e) => setCustContact(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Phone number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +94 77 123 4567"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Credit Limit (LKR)</label>
                  <input
                    type="number"
                    min={5000}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                    value={custCredit}
                    onChange={(e) => setCustCredit(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. contact@apexhardware.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Lat Coord</label>
                  <input
                    type="number"
                    step={0.0001}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                    value={custLat}
                    onChange={(e) => setCustLat(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Lng Coord</label>
                  <input
                    type="number"
                    step={0.0001}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                    value={custLng}
                    onChange={(e) => setCustLng(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="w-1/3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                >
                  Confirm Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Quick Order Modal */}
      {orderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              Smart Instant Order Creation
            </h3>
            <form onSubmit={handleQuickOrder} className="space-y-3.5 text-xs text-zinc-300">
              <div>
                <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Customer Account</label>
                <select
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
                  value={ordCustomer}
                  onChange={(e) => setOrdCustomer(e.target.value)}
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.businessName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Select Product</label>
                <select
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
                  value={ordProduct}
                  onChange={(e) => setOrdProduct(e.target.value)}
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - Stock: {item.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                    value={ordQty}
                    onChange={(e) => setOrdQty(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1 font-bold">Price Slab</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
                    value={ordPriceType}
                    onChange={(e) => setOrdPriceType(e.target.value as any)}
                  >
                    <option value="wholesale">Wholesale</option>
                    <option value="retail">Retail</option>
                    <option value="credit">Credit terms</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="w-1/3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
