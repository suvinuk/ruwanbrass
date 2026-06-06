"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "../../lib/store";
import { 
  Plus, Search, ShoppingBag, CreditCard, Sparkles, AlertCircle, 
  CheckCircle, ArrowRight, RefreshCw, Landmark, Trash2, Printer
} from "lucide-react";

export const SalesCredit: React.FC = () => {
  const { customers, inventory, orders, invoices, addOrder, payInvoice, currentProfile } = useAppState();

  // Active sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"orders" | "outstanding" | "crm">("orders");

  // New Order Creation Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "");
  const [priceType, setPriceType] = useState<"wholesale" | "retail" | "credit">("wholesale");
  const [discount, setDiscount] = useState(0);
  const [cart, setCart] = useState<{ itemId: string; quantity: number }[]>([]);

  const isShop = currentProfile.type === "shop";
  const shopId = currentProfile.refId;

  useEffect(() => {
    if (isShop && shopId) {
      setSelectedCustomerId(shopId);
    }
  }, [currentProfile, isShop, shopId]);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState(false);

  // Collection payment state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [collectAmount, setCollectAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Cart actions
  const addToCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.itemId !== itemId));
  };

  const updateCartQty = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity: qty } : i));
  };

  // Calculate cart totals
  const getCartTotal = () => {
    let subtotal = 0;
    cart.forEach(cartItem => {
      const inventoryItem = inventory.find(i => i.id === cartItem.itemId);
      if (inventoryItem) {
        const price = priceType === "wholesale" 
          ? inventoryItem.wholesalePrice 
          : priceType === "retail" 
          ? inventoryItem.retailPrice 
          : inventoryItem.creditPrice;
        subtotal += price * cartItem.quantity;
      }
    });
    return Math.max(0, subtotal - discount);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Convert cart format to fit store action
    const itemsPayload = cart.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      priceType
    }));

    addOrder(selectedCustomerId, itemsPayload, discount);
    setCart([]);
    setDiscount(0);
    setOrderPlacedSuccess(true);
    setTimeout(() => setOrderPlacedSuccess(false), 3000);
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || collectAmount <= 0) return;

    payInvoice(selectedInvoiceId, collectAmount);
    setCollectAmount(0);
    setSelectedInvoiceId("");
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveSubTab("orders")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === "orders"
              ? "border-amber-500 text-amber-500 bg-amber-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Sales & Order Placement
        </button>
        <button
          onClick={() => setActiveSubTab("outstanding")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === "outstanding"
              ? "border-amber-500 text-amber-500 bg-amber-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Outstanding & Credit Ledger
        </button>
        <button
          onClick={() => setActiveSubTab("crm")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === "crm"
              ? "border-amber-500 text-amber-500 bg-amber-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          360° Customer Intelligence
        </button>
      </div>

      {/* RENDER VIEW: Sales & Order Placement */}
      {activeSubTab === "orders" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Placement Form */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
            <h3 className="text-base font-bold text-zinc-200 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              Smart Sales Order Form
            </h3>

            {orderPlacedSuccess && (
              <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Sales order successfully authorized. Live inventory updated and delivery route dispatched.</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1.5">Select Client Customer</label>
                  <select
                    disabled={isShop}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} (Bal: LKR {c.currentBalance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase font-semibold mb-1.5">Select Contract Pricing Tier</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 text-sm focus:outline-none focus:border-amber-500"
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value as any)}
                  >
                    <option value="wholesale">Wholesale Pricing (Minimum Cash Margin)</option>
                    <option value="retail">Retail Pricing (List Price)</option>
                    <option value="credit">Credit Pricing (+30 Day terms markup)</option>
                  </select>
                </div>
              </div>

              {/* Inventory picker */}
              <div>
                <label className="block text-xs text-zinc-500 uppercase font-semibold mb-2">Available Warehouse Inventory</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {inventory.map(item => {
                    const price = priceType === "wholesale" 
                      ? item.wholesalePrice 
                      : priceType === "retail" 
                      ? item.retailPrice 
                      : item.creditPrice;
                    const inCartCount = cart.find(i => i.itemId === item.id)?.quantity || 0;
                    const isLow = item.stock <= 0;

                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-lg border flex items-center justify-between text-sm transition-all ${
                          inCartCount > 0 ? "border-amber-500 bg-amber-500/5" : "border-zinc-800/80 bg-zinc-900/40"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-zinc-200">{item.name}</p>
                          <p className="text-xs text-zinc-500 font-mono mt-0.5">{item.sku} • Bin: {item.binLocation}</p>
                          <p className="text-xs text-zinc-400 mt-1">LKR {price.toFixed(2)} • Stock: <span className={item.stock < item.minStockAlert ? "text-rose-500 font-bold animate-pulse" : "text-emerald-500"}>{item.stock}</span></p>
                        </div>
                        <button
                          type="button"
                          disabled={isLow}
                          onClick={() => addToCart(item.id)}
                          className={`p-1.5 rounded-lg border ${
                            isLow ? "border-zinc-800 text-zinc-600 bg-transparent cursor-not-allowed" : "border-zinc-700 hover:border-amber-500 text-zinc-300 hover:text-amber-500 hover:bg-amber-500/10"
                          } transition-all`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cart review */}
              {cart.length > 0 && (
                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <h4 className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">Shopping Cart Items</h4>
                  <div className="space-y-2">
                    {cart.map(cartItem => {
                      const item = inventory.find(i => i.id === cartItem.itemId);
                      if (!item) return null;
                      const price = priceType === "wholesale" ? item.wholesalePrice : priceType === "retail" ? item.retailPrice : item.creditPrice;

                      return (
                        <div key={cartItem.itemId} className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-lg text-sm">
                          <div>
                            <p className="font-medium text-zinc-300">{item.name}</p>
                            <p className="text-xs text-zinc-500 font-mono mt-0.5">LKR {price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-zinc-800 rounded bg-zinc-950">
                              <button 
                                type="button" 
                                className="px-2 py-0.5 text-zinc-400 hover:text-zinc-200"
                                onClick={() => updateCartQty(cartItem.itemId, cartItem.quantity - 1)}
                              >-</button>
                              <span className="px-3 font-mono text-zinc-200">{cartItem.quantity}</span>
                              <button 
                                type="button" 
                                className="px-2 py-0.5 text-zinc-400 hover:text-zinc-200"
                                onClick={() => updateCartQty(cartItem.itemId, cartItem.quantity + 1)}
                              >+</button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(cartItem.itemId)}
                              className="p-1 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-800 pt-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-1">Add Cash Discount (LKR)</label>
                      <input
                        type="number"
                        className="bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-200 focus:outline-none w-full focus:border-amber-500"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="text-xs text-zinc-500">Order Net Total</p>
                      <p className="text-xl font-bold text-amber-500 font-mono">LKR {getCartTotal().toLocaleString()}</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold p-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
                  >
                    Authorize Order Execution
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
              <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                AI Risk Insight Panel
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Our model maps late collections and credit limits. Current scan indicates:
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Default Risk: Southern Builders</span>
                    <span className="text-rose-500 font-bold">89% (High)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-rose-500 h-full w-[89%]" />
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Default Risk: Lanka Brass</span>
                    <span className="text-amber-500 font-bold">78% (Medium)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full w-[78%]" />
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Default Risk: Apex Hardware</span>
                    <span className="text-emerald-500 font-bold">12% (Low)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[12%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
              <h3 className="text-sm font-bold text-zinc-200 mb-3">Live Orders Feed</h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {orders.map(order => (
                  <div key={order.id} className="p-2.5 rounded bg-zinc-900/30 border border-zinc-800/80 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-zinc-300">{order.orderNumber}</span>
                      <span className="text-amber-500">LKR {order.total.toLocaleString()}</span>
                    </div>
                    <p className="text-zinc-500 mt-1">{order.customerName}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-900">
                      <span className="text-[10px] text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold ${
                        order.status === "Paid" 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : order.status === "Delivered"
                          ? "bg-indigo-500/10 text-indigo-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: Outstanding Ledger & Collection Panel */}
      {activeSubTab === "outstanding" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unpaid Invoices List */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-200 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-500" />
                Outstanding Credit Ledger
              </h3>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-amber-500" />
                Print Report
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500 font-semibold uppercase">
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-3">Client Customer</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Gross Due</th>
                    <th className="py-2.5 px-3">Paid Bal</th>
                    <th className="py-2.5 px-3 text-right font-bold">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {invoices.filter(inv => !isShop || inv.customerId === shopId).map(inv => {
                    const balance = inv.amount - inv.amountPaid;
                    if (balance <= 0) return null;
                    const isOverdue = inv.status === "Overdue";

                    return (
                      <tr 
                        key={inv.id} 
                        className={`group hover:bg-zinc-900/25 cursor-pointer ${
                          selectedInvoiceId === inv.id ? "bg-amber-500/5 text-zinc-200" : "text-zinc-400"
                        }`}
                        onClick={() => {
                          setSelectedInvoiceId(inv.id);
                          setCollectAmount(balance);
                        }}
                      >
                        <td className="py-3 px-3 font-semibold text-zinc-300 font-mono">{inv.invoiceNumber}</td>
                        <td className="py-3 px-3">{inv.customerName}</td>
                        <td className="py-3 px-3">
                          <span className={isOverdue ? "text-rose-500 font-medium" : ""}>
                            {inv.dueDate} {isOverdue && `(${inv.daysOverdue}d over)`}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">LKR {inv.amount.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono">LKR {inv.amountPaid.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-bold text-zinc-200 font-mono">LKR {balance.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Collection Payment Collector Box */}
          <div>
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
              <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-amber-500" />
                Record Invoice Collection
              </h3>

              {paymentSuccess && (
                <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Payment logged. Ledgers and field commissions adjusted instantly.</span>
                </div>
              )}

              {selectedInvoiceId ? (
                isShop ? (
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center space-y-3">
                    <p className="text-xs text-zinc-400">Payment clearings are verified by your account manager Manoj De Silva.</p>
                    <div className="text-[10px] text-zinc-500 bg-zinc-950 p-2.5 rounded font-mono">
                      Please bank-transfer LKR {(invoices.find(i => i.id === selectedInvoiceId)!.amount - invoices.find(i => i.id === selectedInvoiceId)!.amountPaid).toLocaleString()} to Ruwan Brass BoC Account: 984852.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCollectPayment} className="space-y-4">
                    <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs space-y-2">
                      <p className="font-semibold text-zinc-300">Targeting Invoice: {invoices.find(i => i.id === selectedInvoiceId)?.invoiceNumber}</p>
                      <p className="text-zinc-500">Customer: {invoices.find(i => i.id === selectedInvoiceId)?.customerName}</p>
                      <p className="text-zinc-400">Total Outstanding Balance: <span className="font-bold text-amber-500">LKR {(invoices.find(i => i.id === selectedInvoiceId)!.amount - invoices.find(i => i.id === selectedInvoiceId)!.amountPaid).toLocaleString()}</span></p>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-1">Payment Collected Amount (LKR)</label>
                      <input
                        type="number"
                        className="bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-zinc-200 focus:outline-none w-full focus:border-amber-500 font-mono font-bold"
                        value={collectAmount}
                        onChange={(e) => setCollectAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceId("")}
                        className="w-1/3 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold py-2.5 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-zinc-100 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                      >
                        Log Collection
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-zinc-800/80 rounded-lg text-center text-zinc-500">
                  <AlertCircle className="w-8 h-8 mb-2 text-zinc-600" />
                  <p className="text-xs">Select an invoice from the outstanding ledger list to record a cash or credit collection.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: Customer CRM Profile Overview */}
      {activeSubTab === "crm" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.filter(c => !isShop || c.id === shopId).map(c => (
            <div key={c.id} className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20 relative overflow-hidden">
              {/* Highlight bar based on risk */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                c.riskScore > 70 ? "bg-rose-500" : c.riskScore > 30 ? "bg-amber-500" : "bg-emerald-500"
              }`} />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-base font-bold text-zinc-200">{c.businessName}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">Contact: {c.contactName}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold ${
                  c.riskScore > 70 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                }`}>
                  Risk: {c.riskScore}%
                </span>
              </div>

              <div className="space-y-2 border-t border-zinc-800 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Credit Limit:</span>
                  <span className="text-zinc-300 font-mono">LKR {c.creditLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Outstanding Balance:</span>
                  <span className="text-zinc-300 font-mono">LKR {c.currentBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Churn Probability:</span>
                  <span className={`font-semibold ${c.churnProbability > 50 ? "text-rose-400" : "text-emerald-400"}`}>
                    {c.churnProbability}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Loyalty Score:</span>
                  <span className="text-amber-500 font-bold">{c.loyaltyScore}/100</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between">
                <span>GPS coordinates: {c.gps.lat.toFixed(4)}, {c.gps.lng.toFixed(4)}</span>
                <span className="text-amber-500/80 cursor-pointer hover:underline flex items-center gap-0.5">
                  Visit CRM Profile
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
