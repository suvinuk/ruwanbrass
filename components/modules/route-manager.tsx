"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Navigation, Calendar, User, Compass, Play, CheckCircle2, AlertTriangle, 
  Plus, ArrowUp, ArrowDown, Map, RefreshCw, BarChart2, ShieldAlert, Check, 
  Trash2, Phone, FileText, Camera, ShoppingBag, Clock, Sparkles, Send
} from "lucide-react";
import { useAppState, Route, RouteStop } from "../../lib/store";

export const RouteManager: React.FC = () => {
  const { 
    currentProfile, customers, inventory, routes, territories, routeTemplates,
    addRoute, checkInStop, checkOutStop, optimizeRouteStops, reassignRoute, 
    saveRouteTemplate, loadRouteTemplate, addTerritory, assignTerritory, availableProfiles
  } = useAppState();

  const isSales = currentProfile.type === "sales";
  const repId = currentProfile.id;

  // Tabs for Admin View
  const [activeAdminTab, setActiveAdminTab] = useState<"planner" | "territories" | "analytics" | "live">("planner");

  // Planner States
  const [selectedRep, setSelectedRep] = useState(availableProfiles.find(p => p.type === "sales")?.id || "manoj");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [routeMsg, setRouteMsg] = useState("");
  const [optimizeSuccess, setOptimizeSuccess] = useState("");

  // New Territory States
  const [newTerrName, setNewTerrName] = useState("");
  const [newTerrArea, setNewTerrArea] = useState("");
  const [territoryMsg, setTerritoryMsg] = useState("");

  // Active Salesperson Route
  const salespersonRoute = routes.find(r => r.salesPersonId === repId && r.date === new Date().toISOString().split("T")[0]);
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);

  // Visit Verification form state
  const [notes, setNotes] = useState("");
  const [mockPhoto, setMockPhoto] = useState<string | null>(null);
  
  // Visit Order placement state
  const [orderItem, setOrderItem] = useState(inventory[0]?.id || "");
  const [orderQty, setOrderQty] = useState(10);
  const [priceType, setPriceType] = useState<"wholesale" | "retail" | "credit">("wholesale");
  const [orderPlacedVal, setOrderPlacedVal] = useState<number>(0);

  // Directions Compass simulation state
  const [showCompassStopId, setShowCompassStopId] = useState<string | null>(null);
  const [compassAngle, setCompassAngle] = useState(45);

  // Real-time map simulation state
  const [liveLocation, setLiveLocation] = useState({ lat: 6.9271, lng: 79.8612 }); // Colombo Hub
  const [liveLog, setLiveLog] = useState<string[]>([]);

  // Ticking effect for compass and live simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showCompassStopId) {
      interval = setInterval(() => {
        setCompassAngle(prev => (prev + Math.floor(-10 + Math.random() * 21) + 360) % 360);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [showCompassStopId]);

  useEffect(() => {
    // Simulated active rep coordinates movement
    const activeRoute = routes.find(r => r.status === "In-Progress");
    if (activeRoute) {
      const currentStop = activeRoute.stops.find(s => s.status === "Checked-In");
      if (currentStop) {
        const customer = customers.find(c => c.id === currentStop.customerId);
        if (customer) {
          setLiveLocation(customer.gps);
        }
      }
    }
  }, [routes, customers]);

  const handleToggleCustomer = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleMoveStop = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedCustomers.length) return;
    
    const copy = [...selectedCustomers];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setSelectedCustomers(copy);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomers.length === 0) return;

    const repProfile = availableProfiles.find(p => p.id === selectedRep);
    if (!repProfile) return;

    const stops: RouteStop[] = selectedCustomers.map((cId, idx) => {
      const cust = customers.find(c => c.id === cId)!;
      return {
        id: `s-${Date.now()}-${idx}`,
        customerId: cId,
        customerName: cust.businessName,
        visitOrder: idx + 1,
        status: "Pending"
      };
    });

    addRoute({
      salesPersonId: selectedRep,
      salesPersonName: repProfile.name,
      date: selectedDate,
      stops,
      status: "Planned",
      currentStopIndex: 0,
      totalDistance: Number((5 + selectedCustomers.length * 4.5).toFixed(1)),
      totalDuration: 15 + selectedCustomers.length * 20
    });

    setSelectedCustomers([]);
    setRouteMsg(`Route successfully dispatched for ${repProfile.name} on ${selectedDate}!`);
    setTimeout(() => setRouteMsg(""), 4000);
  };

  const handleOptimizeRoute = (routeId: string) => {
    optimizeRouteStops(routeId);
    setOptimizeSuccess("Smart Route Optimization algorithm completed. Route coordinates sorted.");
    setTimeout(() => setOptimizeSuccess(""), 4000);
  };

  const handleSaveAsTemplate = (routeId: string) => {
    if (!newTemplateName) return;
    saveRouteTemplate(routeId, newTemplateName);
    setNewTemplateName("");
    setRouteMsg("Saved active route configuration as a template successfully!");
    setTimeout(() => setRouteMsg(""), 4000);
  };

  const handleLoadTemplate = (templateId: string) => {
    loadRouteTemplate(templateId, selectedDate, selectedRep);
    setRouteMsg("Loaded route template coordinates into active planner date!");
    setTimeout(() => setRouteMsg(""), 4000);
  };

  const handleAddTerritory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerrName || !newTerrArea) return;
    addTerritory(newTerrName, newTerrArea);
    setNewTerrName("");
    setNewTerrArea("");
    setTerritoryMsg("Territory created successfully.");
    setTimeout(() => setTerritoryMsg(""), 3000);
  };

  // Salesperson verification triggers
  const handleCheckIn = (routeId: string, stopId: string) => {
    checkInStop(routeId, stopId, { lat: 6.9271, lng: 79.8612 }); // Simulated coords
    setNotes("");
    setMockPhoto(null);
    setOrderPlacedVal(0);
  };

  const handlePlaceVisitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find(i => i.id === orderItem);
    if (!item) return;
    
    const price = priceType === "wholesale" ? item.wholesalePrice : priceType === "retail" ? item.retailPrice : item.creditPrice;
    const total = price * orderQty;
    
    // Add value to simulated order creation
    setOrderPlacedVal(prev => prev + total);
  };

  const handleCheckOut = (routeId: string, stopId: string) => {
    const photo = mockPhoto || "/assets/mock_visit_check.jpg";
    checkOutStop(routeId, stopId, notes || "Visits completed.", photo, orderPlacedVal, { lat: 6.9271, lng: 79.8612 });
    setNotes("");
    setMockPhoto(null);
    setOrderPlacedVal(0);
    setExpandedStopId(null);
  };

  const handleSimulatePhoto = () => {
    setMockPhoto("https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80"); // beautiful delivery bay mock photo
  };

  // Check territory assignments overlaps
  const checkOverlapWarnings = () => {
    const warnings: string[] = [];
    const repMap = new Map<string, string>();
    
    territories.forEach(t => {
      if (t.assignedRepId) {
        if (repMap.has(t.assignedRepId)) {
          const firstTerr = repMap.get(t.assignedRepId);
          warnings.push(`Warning: Sales Representative Manoj is assigned to both ${firstTerr} and ${t.name}. Overlap may lower coverage density.`);
        } else {
          repMap.set(t.assignedRepId, t.name);
        }
      }
    });
    return warnings;
  };

  const overlapWarnings = checkOverlapWarnings();

  // RENDER: Salesperson Mobile View
  if (isSales) {
    return (
      <div className="max-w-md mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-4 md:p-6 text-zinc-100 flex flex-col justify-between min-h-[600px]">
        {/* Mobile Device Header Bar representation */}
        <div className="flex justify-between items-center border-b border-zinc-850 pb-3 mb-4 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold uppercase tracking-wider font-mono">Today's Route</span>
          </div>
          <span className="font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
            {currentProfile.initials} • Active Shift
          </span>
        </div>

        {salespersonRoute ? (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-zinc-300">Shops assigned today: {salespersonRoute.stops.length}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Dispatched: {salespersonRoute.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Shift State</span>
                  <span className="text-xs text-amber-400 font-bold font-mono">{salespersonRoute.status}</span>
                </div>
              </div>

              {/* Stops timeline */}
              <div className="space-y-3 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800/80">
                {salespersonRoute.stops.map((stop, idx) => {
                  const isExpanded = expandedStopId === stop.id;
                  const customer = customers.find(c => c.id === stop.customerId);
                  const isCheckedIn = stop.status === "Checked-In";
                  const isCompleted = stop.status === "Completed";
                  const isPending = stop.status === "Pending";

                  return (
                    <div key={stop.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={`absolute left-2.5 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center -translate-x-1/2 z-10 ${
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-600 text-zinc-950 font-bold" 
                          : isCheckedIn 
                          ? "bg-amber-500 border-amber-600 animate-pulse text-zinc-950" 
                          : "bg-zinc-900 border-zinc-700 text-zinc-500"
                      } text-[10px]`}>
                        {isCompleted ? <Check className="w-3 h-3 text-zinc-950 stroke-[3px]" /> : idx + 1}
                      </div>

                      <div 
                        onClick={() => !isCompleted && setExpandedStopId(isExpanded ? null : stop.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isCheckedIn 
                            ? "bg-amber-500/5 border-amber-500" 
                            : isCompleted 
                            ? "bg-zinc-900/20 border-zinc-850 opacity-60" 
                            : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-750"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-zinc-200 text-xs">{stop.customerName}</h4>
                            <p className="text-[10px] text-zinc-500 mt-1">Visit Order stop: {stop.visitOrder}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            isCompleted 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : isCheckedIn 
                              ? "bg-amber-500/10 text-amber-500 animate-pulse" 
                              : "bg-zinc-800 text-zinc-500"
                          }`}>{stop.status}</span>
                        </div>

                        {/* Expand stop content */}
                        {isExpanded && !isCompleted && (
                          <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-4 text-xs text-zinc-400" onClick={(e) => e.stopPropagation()}>
                            {/* Customer info card */}
                            {customer && (
                              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg space-y-2 text-[11px]">
                                <p className="flex justify-between"><span className="text-zinc-500">Contact:</span><span className="text-zinc-300 font-semibold">{customer.contactName}</span></p>
                                <p className="flex justify-between"><span className="text-zinc-500">Phone:</span><span className="text-amber-500 font-bold hover:underline flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span></p>
                                <p className="flex justify-between"><span className="text-zinc-500">Credit Balance:</span><span className="text-zinc-300 font-mono">LKR {customer.currentBalance.toLocaleString()}</span></p>
                                <p className="flex justify-between"><span className="text-zinc-500">GPS location:</span><span className="text-zinc-300 font-mono">{customer.gps.lat.toFixed(4)}, {customer.gps.lng.toFixed(4)}</span></p>
                              </div>
                            )}

                            {/* Directions compass UI */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (customer) {
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${customer.gps.lat},${customer.gps.lng}`, "_blank");
                                  }
                                }}
                                className="flex-1 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px]"
                              >
                                <Navigation className="w-3.5 h-3.5 text-amber-500" />
                                Google Maps
                              </button>
                              <button
                                onClick={() => setShowCompassStopId(showCompassStopId === stop.id ? null : stop.id)}
                                className="flex-1 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 rounded-lg flex items-center justify-center gap-1 font-semibold text-[11px]"
                              >
                                <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                Simulated Compass
                              </button>
                            </div>

                            {/* Compass Angle Widget */}
                            {showCompassStopId === stop.id && (
                              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center space-y-2">
                                <div className="w-16 h-16 rounded-full border-2 border-zinc-800 flex items-center justify-center relative bg-zinc-900">
                                  <div 
                                    className="absolute w-1 h-8 bg-gradient-to-t from-transparent to-amber-500 origin-bottom bottom-1/2 left-[calc(50%-2px)] rounded-full transition-transform duration-500"
                                    style={{ transform: `rotate(${compassAngle}deg)` }}
                                  />
                                  <span className="text-[9px] font-bold text-zinc-500 absolute top-1">N</span>
                                </div>
                                <span className="text-[10px] text-zinc-400 font-mono">Distance to client: 120m</span>
                              </div>
                            )}

                            {/* Verification process */}
                            {!isCheckedIn ? (
                              <button
                                onClick={() => handleCheckIn(salespersonRoute.id, stop.id)}
                                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg flex items-center justify-center gap-1.5 text-xs shadow-md shadow-amber-500/10 active:scale-95"
                              >
                                <Play className="w-4 h-4 fill-zinc-950" />
                                GPS Check-In at Location
                              </button>
                            ) : (
                              <div className="space-y-3.5 pt-3 border-t border-zinc-800/80">
                                <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-lg text-[10px] flex items-center gap-2">
                                  <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                                  <span>Checked-in at {stop.checkInTime || "Now"}. Please record visit verification details.</span>
                                </div>

                                {/* Order placing form inside route stop */}
                                <div className="p-3 bg-zinc-900/50 border border-zinc-850 rounded-lg space-y-3">
                                  <h5 className="font-bold text-zinc-300 flex items-center gap-1 text-[11px]">
                                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                                    Book Sales Order (Optional)
                                  </h5>

                                  <form onSubmit={handlePlaceVisitOrder} className="space-y-2 text-[10px]">
                                    <div>
                                      <label className="block text-zinc-500 uppercase font-bold mb-1">Product</label>
                                      <select
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-amber-500"
                                        value={orderItem}
                                        onChange={(e) => setOrderItem(e.target.value)}
                                      >
                                        {inventory.map(i => (
                                          <option key={i.id} value={i.id}>{i.name} (LKR {i.wholesalePrice.toFixed(0)})</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="block text-zinc-500 uppercase font-bold mb-1">Qty</label>
                                        <input
                                          type="number"
                                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-amber-500 font-mono"
                                          value={orderQty}
                                          onChange={(e) => setOrderQty(parseInt(e.target.value) || 0)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-zinc-500 uppercase font-bold mb-1">Pricing</label>
                                        <select
                                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300 focus:outline-none focus:border-amber-500"
                                          value={priceType}
                                          onChange={(e) => setPriceType(e.target.value as any)}
                                        >
                                          <option value="wholesale">Wholesale</option>
                                          <option value="retail">Retail</option>
                                          <option value="credit">Credit terms</option>
                                        </select>
                                      </div>
                                    </div>

                                    <button
                                      type="submit"
                                      className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded"
                                    >
                                      Log Order Line
                                    </button>
                                  </form>
                                  {orderPlacedVal > 0 && (
                                    <div className="text-[10px] text-emerald-400 font-bold font-mono">
                                      Accrued Order Value: LKR {orderPlacedVal.toLocaleString()}
                                    </div>
                                  )}
                                </div>

                                {/* Visit Notes */}
                                <div>
                                  <label className="block text-zinc-500 uppercase font-bold mb-1 text-[10px]">Visit Report Notes</label>
                                  <textarea
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-amber-500 text-[11px]"
                                    rows={2}
                                    placeholder="Write notes about stock levels, orders, or client requests..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                  />
                                </div>

                                {/* Camera mock */}
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={handleSimulatePhoto}
                                    className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg flex items-center gap-1 font-semibold text-[10px]"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-zinc-500" />
                                    {mockPhoto ? "Photo Attached" : "Capture Store Photo"}
                                  </button>
                                  {mockPhoto && (
                                    <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" /> Attached
                                    </span>
                                  )}
                                </div>

                                {/* Checkout triggers save stop */}
                                <button
                                  onClick={() => handleCheckOut(salespersonRoute.id, stop.id)}
                                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 text-xs shadow-md shadow-emerald-500/10 active:scale-95"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  GPS Check-Out & Verify Stop
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-850 flex justify-between items-center text-[10px] text-zinc-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Shift Duration: ~3.5 hours</span>
              <span className="font-bold text-zinc-400">Completion Score: {Math.floor((salespersonRoute.stops.filter(s => s.status === "Completed").length / salespersonRoute.stops.length) * 100)}%</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
            <h4 className="font-bold text-zinc-300">No route planned for today</h4>
            <p className="text-xs text-zinc-500 max-w-[240px]">An administrator must assign you a visit route schedule from the admin planning board.</p>
          </div>
        )}
      </div>
    );
  }

  // RENDER: Admin view
  return (
    <div className="space-y-6">
      {/* Dynamic Alerts */}
      <AnimatePresence>
        {routeMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-semibold rounded-xl flex items-center gap-3 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{routeMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Panel */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            Sales Route Assignment Board
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Dispatch routes, optimize customer stop orders, manage territories, and trace salesperson progress.
          </p>
        </div>

        {/* AI Recommendations panel */}
        <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs max-w-sm flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">AI Recommendation</p>
            <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
              Kandy Industrial Supplies (`c3`) has 72% churn probability and hasn't been visited in 14 days. Recommending adding to Manoj's Kandy route template.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveAdminTab("planner")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeAdminTab === "planner" ? "border-amber-500 text-amber-500 bg-amber-500/5" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Calendar className="w-4 h-4" /> Route Planner
        </button>
        <button
          onClick={() => setActiveAdminTab("territories")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeAdminTab === "territories" ? "border-amber-500 text-amber-500 bg-amber-500/5" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Map className="w-4 h-4" /> Territory Settings
        </button>
        <button
          onClick={() => setActiveAdminTab("analytics")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeAdminTab === "analytics" ? "border-amber-500 text-amber-500 bg-amber-500/5" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Analytics Reports
        </button>
        <button
          onClick={() => setActiveAdminTab("live")}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeAdminTab === "live" ? "border-amber-500 text-amber-500 bg-amber-500/5" : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Compass className="w-4 h-4 animate-spin-slow" /> Live Tracking
        </button>
      </div>

      {/* 1. PLANNER SUBTAB */}
      {activeAdminTab === "planner" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch planner */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
            <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-amber-500" />
              Route Planner Console
            </h3>

            <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1">Select Salesperson</label>
                  <select
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                    value={selectedRep}
                    onChange={(e) => setSelectedRep(e.target.value)}
                  >
                    {availableProfiles.filter(p => p.type === "sales").map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1">Assignment Date</label>
                  <input
                    type="date"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-zinc-200 font-mono"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Shop checkboxes */}
              <div>
                <label className="block text-zinc-500 uppercase font-semibold mb-2">Select Clients to Visit</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {customers.map(c => {
                    const isChecked = selectedCustomers.includes(c.id);
                    return (
                      <div 
                        key={c.id}
                        onClick={() => handleToggleCustomer(c.id)}
                        className={`p-2.5 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? "bg-amber-500/5 border-amber-500 text-zinc-200" : "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700 text-zinc-400"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-xs text-zinc-300 truncate">{c.businessName}</p>
                          <p className="text-[9px] text-zinc-500 font-mono">{c.gps.lat.toFixed(3)}, {c.gps.lng.toFixed(3)}</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {}} // handled by click wrapper
                          className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500/20 w-4 h-4 accent-amber-500 shrink-0" 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visit ordering sequencing */}
              {selectedCustomers.length > 0 && (
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <label className="block text-zinc-500 uppercase font-semibold mb-1">Arrange Visit Order Sequence</label>
                  <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                    {selectedCustomers.map((cId, idx) => {
                      const cust = customers.find(c => c.id === cId)!;
                      return (
                        <div key={cId} className="p-2 bg-zinc-900/50 border border-zinc-850 rounded flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-300 truncate">{idx + 1}. {cust.businessName}</span>
                          <div className="flex gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveStop(idx, "up")}
                              className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 disabled:opacity-40 rounded"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === selectedCustomers.length - 1}
                              onClick={() => handleMoveStop(idx, "down")}
                              className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 disabled:opacity-40 rounded"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={selectedCustomers.length === 0}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <Send className="w-4 h-4" /> Dispatch Route Assignment
              </button>
            </form>
          </div>

          {/* Active routes dispatcher overview list */}
          <div className="space-y-4">
            {/* Templates loading section */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-3">Saved Route Templates</h3>
              <div className="space-y-2">
                {routeTemplates.map(tmpl => (
                  <div key={tmpl.id} className="p-2.5 rounded bg-zinc-900/30 border border-zinc-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-zinc-300">{tmpl.templateName}</p>
                      <p className="text-[10px] text-zinc-500">Stops count: {tmpl.stops.length} • Assigned Rep: {tmpl.salesPersonName}</p>
                    </div>
                    <button
                      onClick={() => handleLoadTemplate(tmpl.id)}
                      className="px-2.5 py-1 border border-zinc-700 hover:border-amber-500 text-zinc-400 hover:text-amber-500 rounded font-semibold text-[10px] transition-all"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily dispatch summary */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-3">Daily Active Dispatches</h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {routes.filter(r => !r.isTemplate).map(route => (
                  <div key={route.id} className="p-2.5 rounded bg-zinc-900/40 border border-zinc-850 text-xs space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-zinc-200">{route.salesPersonName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        route.status === "Completed" 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : route.status === "In-Progress"
                          ? "bg-amber-500/10 text-amber-500 animate-pulse"
                          : "bg-zinc-800 text-zinc-500"
                      }`}>{route.status}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500">Date: {route.date} • Stops: {route.stops.length}</p>

                    <div className="flex gap-1.5 pt-1 border-t border-zinc-900">
                      {route.status !== "Completed" && (
                        <button
                          onClick={() => handleOptimizeRoute(route.id)}
                          className="flex-1 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded font-semibold text-[10px] flex items-center justify-center gap-0.5"
                        >
                          <RefreshCw className="w-2.5 h-2.5 text-amber-500" /> Optimize (AI)
                        </button>
                      )}
                      <div className="flex gap-1 w-full flex-1">
                        <input
                          type="text"
                          placeholder="Template Name"
                          className="bg-zinc-950 border border-zinc-850 rounded p-1 text-[9px] text-zinc-300 w-full"
                          id={`tmplName-${route.id}`}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`tmplName-${route.id}`) as HTMLInputElement;
                            if (input && input.value) {
                              setNewTemplateName(input.value);
                              handleSaveAsTemplate(route.id);
                              input.value = "";
                            }
                          }}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] font-bold shrink-0"
                        >
                          Save Tmpl
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TERRITORIES SUBTAB */}
      {activeAdminTab === "territories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Territories assignment grid */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Map className="w-4.5 h-4.5 text-amber-500" />
                Territory Assignments Setup
              </h3>
              <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded font-mono">Territory Matrix</span>
            </div>

            {/* Overlap Warning Box */}
            {overlapWarnings.length > 0 && (
              <div className="mb-4 p-3.5 bg-rose-500/5 border border-rose-500/15 rounded-lg text-rose-300 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                  <span className="font-bold">Territory Assignment Warnings</span>
                </div>
                {overlapWarnings.map((w, idx) => (
                  <p key={idx} className="text-[10px] leading-relaxed text-zinc-400 pl-6 relative before:absolute before:left-2 before:top-1 before:w-1 before:h-1 before:bg-rose-400 before:rounded-full">{w}</p>
                ))}
              </div>
            )}

            <div className="overflow-x-auto text-xs text-zinc-400">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-semibold">
                    <th className="py-2.5 px-3">Territory Zone</th>
                    <th className="py-2.5 px-3">Area Code Coverage</th>
                    <th className="py-2.5 px-3">Assigned Representative</th>
                    <th className="py-2.5 px-3 text-right">Coverage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {territories.map(t => {
                    const rep = availableProfiles.find(p => p.id === t.assignedRepId);
                    return (
                      <tr key={t.id} className="hover:bg-zinc-900/25">
                        <td className="py-3 px-3 font-semibold text-zinc-300">{t.name}</td>
                        <td className="py-3 px-3 font-mono">{t.areaCode}</td>
                        <td className="py-2 px-3">
                          <select
                            className="bg-zinc-900 border border-zinc-800 rounded p-1 text-zinc-300 w-full max-w-[160px]"
                            value={t.assignedRepId}
                            onChange={(e) => assignTerritory(t.id, e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {availableProfiles.filter(p => p.type === "sales").map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            t.assignedRepId ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          }`}>
                            {t.assignedRepId ? "Assigned" : "Vacant"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            {/* Create Territory form */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-3">Add Territory Zone</h3>
              
              {territoryMsg && (
                <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded">
                  {territoryMsg}
                </div>
              )}

              <form onSubmit={handleAddTerritory} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1">Zone Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Galle Coast"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                    value={newTerrName}
                    onChange={(e) => setNewTerrName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 uppercase font-semibold mb-1">Area Code / Suburbs</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Galle, Hikkaduwa"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200"
                    value={newTerrArea}
                    onChange={(e) => setNewTerrArea(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded font-semibold transition-all"
                >
                  Create Territory
                </button>
              </form>
            </div>

            {/* Stylized SVG Territory Zone Map */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20 flex flex-col items-center">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-3 w-full text-left">Ecosystem Coverage Map</h4>
              <div className="w-full h-40 border border-zinc-900 rounded-lg relative overflow-hidden bg-zinc-950/40">
                <svg className="w-full h-full opacity-25" viewBox="0 0 100 100">
                  <path d="M40,20 Q60,10 70,30 T50,80 T30,50 Z" fill="#d97706" />
                  <path d="M50,80 Q70,90 80,70 T60,40 Z" fill="#6366f1" />
                </svg>
                {/* Simulated markers */}
                <div className="absolute top-[20%] left-[45%] flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-emerald-500 animate-bounce" />
                  <span className="text-[7px] text-zinc-500 bg-zinc-950 px-1 rounded font-bold">Col 1-5</span>
                </div>
                <div className="absolute top-[55%] left-[60%] flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-[7px] text-zinc-500 bg-zinc-950 px-1 rounded font-bold">Kandy</span>
                </div>
                <div className="absolute top-[75%] left-[30%] flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span className="text-[7px] text-zinc-500 bg-zinc-950 px-1 rounded font-bold">Galle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ANALYTICS SUBTAB */}
      {activeAdminTab === "analytics" && (
        <div className="space-y-6">
          {/* KPI grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-xl">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Route Completion Rate</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">83%</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Average completed visits today</p>
            </div>
            <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-xl">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Total Planned Stops</p>
              <h3 className="text-2xl font-bold font-mono text-zinc-200 mt-1">
                {routes.filter(r => !r.isTemplate && r.date === selectedDate).reduce((sum, r) => sum + r.stops.length, 0) || 5} Stops
              </h3>
              <p className="text-[10px] text-zinc-500 mt-1">Assigned across 3 field reps</p>
            </div>
            <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-xl">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Sales Generated per Route</p>
              <h3 className="text-2xl font-bold font-mono text-amber-500 mt-1">LKR 1,267,000</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Real-time credit orders logged</p>
            </div>
          </div>

          {/* Performance list */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
            <h3 className="text-sm font-bold text-zinc-200 mb-4">Representative Route Performance Overview</h3>
            <div className="space-y-4">
              {routes.filter(r => !r.isTemplate).map(route => {
                const completedCount = route.stops.filter(s => s.status === "Completed").length;
                const totalStops = route.stops.length;
                const percentage = totalStops > 0 ? Math.floor((completedCount / totalStops) * 100) : 0;
                
                // Calculate total sales generated in stops
                const totalSales = route.stops.reduce((sum, s) => sum + (s.salesGenerated || 0), 0);

                return (
                  <div key={route.id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-zinc-200">{route.salesPersonName}</span>
                        <span className="text-zinc-500 text-[10px] ml-2">Distance: {route.totalDistance || 15} km • Duration: {route.totalDuration || 60} mins</span>
                      </div>
                      <span className="font-bold text-emerald-400 font-mono">LKR {totalSales.toLocaleString()} generated</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-400 shrink-0">{completedCount}/{totalStops} stops ({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. LIVE TRACKING SUBTAB */}
      {activeAdminTab === "live" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracking simulator map */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

            <div className="flex justify-between items-center z-10">
              <div>
                <h3 className="text-sm font-bold text-zinc-200">Live Field Coordinate Mapping</h3>
                <p className="text-xs text-zinc-500">Real-time GPS synchronization overlay</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 animate-pulse">
                SIM Active
              </span>
            </div>

            {/* Stylized mapping board */}
            <div className="my-10 flex justify-center z-10">
              <div className="relative w-full max-w-md h-[160px] border border-zinc-800/40 rounded-xl bg-zinc-900/10 backdrop-blur-sm p-4 flex items-center justify-between">
                
                {/* SVG connection line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M 50 80 Q 200 20, 350 80" 
                    fill="none" 
                    stroke="#27272a" 
                    strokeWidth="3" 
                    strokeDasharray="6 4"
                  />
                  <path 
                    d="M 50 80 Q 200 20, 350 80" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="3" 
                    strokeDasharray="120 120"
                    strokeDashoffset={30}
                    className="animate-pulse"
                  />
                </svg>

                {/* Colombo Hub */}
                <div className="flex flex-col items-center gap-1 z-20">
                  <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500">Colombo Head Office</span>
                </div>

                {/* Rep position */}
                <div className="absolute left-[45%] top-[25%] -translate-x-1/2 flex flex-col items-center z-20">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center text-amber-500 animate-bounce">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 mt-1 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">Manoj De Silva</span>
                </div>

                {/* Destination */}
                <div className="flex flex-col items-center gap-1 z-20">
                  <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500">Active Stop Client</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-3 z-10 font-mono">
              <span>GPS coords: {liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}</span>
              <span>Target: Metro Fittings Colombo</span>
            </div>
          </div>

          {/* Tracking logs ticker */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20 flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-3">Field Activity Log</h3>
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                <div className="p-2 bg-zinc-900/30 border border-zinc-850 rounded text-[11px] leading-relaxed text-zinc-400">
                  <span className="font-mono text-[9px] text-zinc-500 block">09:15 AM • Apex Hardware</span>
                  Manoj De Silva checked-in. GPS location match verified within 15 meters.
                </div>
                <div className="p-2 bg-zinc-900/30 border border-zinc-850 rounded text-[11px] leading-relaxed text-zinc-400">
                  <span className="font-mono text-[9px] text-zinc-500 block">09:45 AM • Apex Hardware</span>
                  Manoj De Silva checked-out. Visit report notes logged: "Stock levels checked. Placed order." Generated LKR 1,035.
                </div>
                <div className="p-2 bg-zinc-900/30 border border-zinc-850 rounded text-[11px] leading-relaxed text-zinc-400">
                  <span className="font-mono text-[9px] text-zinc-500 block">10:10 AM • Metro Fittings</span>
                  Manoj De Silva checked-in at location. Stop verification checklist activated.
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-850 text-center">
              <span className="text-[9px] text-zinc-600 font-mono">Sync latency: 24ms • Encryption: GPS SSL</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
