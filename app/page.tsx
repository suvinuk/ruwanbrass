"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "../lib/store";
import { CommandCenter } from "../components/modules/command-center";
import { SalesCredit } from "../components/modules/sales-credit";
import { Inventory } from "../components/modules/inventory";
import { FleetLogistics } from "../components/modules/fleet-logistics";
import { CommissionEngine } from "../components/modules/commission-engine";
import { SuperSearch } from "../components/ui/super-search";

import { 
  LayoutDashboard, ShoppingBag, Package, Truck, Percent, Search, 
  Sparkles, Bell, Clock, ChevronDown, Check, LogOut, Menu, X,
  AlertTriangle, AlertCircle, Info, Trash2, Bot, Zap, BrainCircuit
} from "lucide-react";

export default function WorkspaceHome() {
  const { currentTab, setCurrentTab, alerts, clearAlert, resetState, currentProfile, setCurrentProfile, availableProfiles } = useAppState();
  
  // UI State
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Refs for outside-click detection
  const notifRef = useRef<HTMLDivElement>(null);
  const copilotRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const switchProfile = (p: any) => {
    setCurrentProfile(p);
    setProfileMenuOpen(false);
    if (p.type === "shop" || p.type === "driver") {
      if (currentTab === "commissions") {
        setCurrentTab("dashboard");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setNotifOpen(false);
        setCopilotOpen(false);
        setLogoutConfirm(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    setCurrentTime(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(timeInterval);
    };
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (copilotRef.current && !copilotRef.current.contains(e.target as Node)) {
        setCopilotOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    resetState();
    setLogoutConfirm(false);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
    { id: "sales", label: "Sales & Credit", icon: ShoppingBag },
    { id: "inventory", label: "Inventory Lines", icon: Package },
    { id: "fleet", label: "Fleet Logistics", icon: Truck },
    { id: "commissions", label: "Commission Engine", icon: Percent, hideFor: ["shop", "driver"] },
  ].filter(item => !item.hideFor?.includes(currentProfile.type));

  const renderActiveTab = () => {
    switch (currentTab) {
      case "dashboard":
        return <CommandCenter />;
      case "sales":
        return <SalesCredit />;
      case "inventory":
        return <Inventory />;
      case "fleet":
        return <FleetLogistics />;
      case "commissions":
        return <CommissionEngine />;
      default:
        return <CommandCenter />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-500 shrink-0" />;
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-l-rose-500";
      case "warning":
        return "border-l-amber-500";
      default:
        return "border-l-sky-500";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030303]">
      
      {/* Search Modal Component */}
      <SuperSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <LogOut className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100">Confirm Logout</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              This will clear all session data and reset the application to its default state. Any unsaved changes will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-rose-500/20"
              >
                Logout & Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Left Navigation Shell — Desktop */}
      <aside className={`
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 fixed md:relative z-50 md:z-auto 
        flex flex-col w-64 h-full border-r border-zinc-800 bg-[#09090b]/95 md:bg-[#09090b]/80 backdrop-blur-md
        transition-transform duration-300 ease-in-out
      `}>
        
        {/* Brand Banner */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-zinc-950 text-sm shadow-md shadow-amber-500/15">
              RB
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-zinc-100 uppercase">Ruwan Brass</h2>
              <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">EDOS v2.0</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-4 space-y-1.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                currentTab === item.id
                  ? "bg-zinc-800/85 text-zinc-100 font-semibold border-l-4 border-amber-500"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
              {currentTab === item.id && <Check className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          ))}
        </nav>

        {/* Navigation profile footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/20 text-xs relative" ref={profileRef}>
          
          {/* Profile Switcher Popover */}
          {profileMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50 p-2 space-y-2 max-h-[320px] overflow-y-auto">
              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2 py-1">Staff Roles</p>
                {availableProfiles.filter(p => p.type === "admin" || p.type === "sales").map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => switchProfile(p)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1 rounded-lg transition-colors text-left ${
                      currentProfile.id === p.id 
                        ? "bg-amber-500/10 text-amber-400 font-medium" 
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-300 shrink-0">
                      {p.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate">{p.name}</p>
                      <p className="text-[8px] text-zinc-500 truncate">{p.role}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2 py-1 border-t border-zinc-800/80 pt-2">Shops (Distributors)</p>
                {availableProfiles.filter(p => p.type === "shop").map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => switchProfile(p)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1 rounded-lg transition-colors text-left ${
                      currentProfile.id === p.id 
                        ? "bg-amber-500/10 text-amber-400 font-medium" 
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-300 shrink-0">
                      {p.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate">{p.name}</p>
                      <p className="text-[8px] text-zinc-500 truncate">{p.role}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider px-2 py-1 border-t border-zinc-800/80 pt-2">Logistics</p>
                {availableProfiles.filter(p => p.type === "driver").map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => switchProfile(p)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1 rounded-lg transition-colors text-left ${
                      currentProfile.id === p.id 
                        ? "bg-amber-500/10 text-amber-400 font-medium" 
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-300 shrink-0">
                      {p.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate">{p.name}</p>
                      <p className="text-[8px] text-zinc-500 truncate">{p.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer hover:bg-zinc-800/40 p-1 rounded-lg transition-colors"
              title="Switch Active Profile"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 shrink-0">
                {currentProfile.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-200 text-xs truncate flex items-center gap-1">
                  {currentProfile.name}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                </p>
                <p className="text-[9px] text-zinc-500 font-mono truncate">{currentProfile.role}</p>
              </div>
            </div>
            <button 
              onClick={() => setLogoutConfirm(true)}
              title="Logout & Reset"
              className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors group shrink-0"
            >
              <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-rose-500 transition-colors" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-800 bg-[#09090b]/50 backdrop-blur-md z-30">
          
          {/* Mobile hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="md:hidden p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800/50 transition-colors mr-3"
          >
            <Menu className="w-5 h-5 text-zinc-300" />
          </button>

          {/* Quick Search Shortcut Bar */}
          <div 
            onClick={() => setSearchOpen(true)}
            className="flex items-center bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 px-4 py-2 rounded-lg text-sm text-zinc-400 cursor-pointer w-full max-w-xs transition-all"
          >
            <Search className="w-4 h-4 text-zinc-500 mr-2.5" />
            <span className="hidden sm:inline">Search or command...</span>
            <span className="sm:hidden">Search...</span>
            <div className="ml-auto hidden sm:flex gap-0.5 items-center text-[10px] text-zinc-500 font-mono">
              <kbd className="px-1 bg-zinc-950 border border-zinc-800 rounded">Ctrl</kbd>
              <kbd className="px-1 bg-zinc-950 border border-zinc-800 rounded">K</kbd>
            </div>
          </div>

          {/* Clock & Notifications Status Area */}
          <div className="flex items-center gap-3 md:gap-5 ml-3">
            
            {/* Clock Widget */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-3 py-1.5 rounded-md font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentTime || "Loading..."}</span>
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setCopilotOpen(false);
                }}
                className={`relative p-1.5 rounded-lg border transition-colors ${
                  notifOpen 
                    ? "border-amber-500/50 bg-zinc-800" 
                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                }`}
              >
                <Bell className="w-4 h-4 text-zinc-300" />
                {alerts.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Notifications</h3>
                    </div>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold">
                      {alerts.length} Active
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500">All clear — no active alerts</p>
                      </div>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors border-l-2 ${getSeverityBorder(alert.severity)}`}>
                          <div className="pt-0.5">{getSeverityIcon(alert.severity)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-zinc-300 leading-relaxed">{alert.message}</p>
                            <p className="text-[10px] text-zinc-600 mt-1 font-mono">{alert.time}</p>
                          </div>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              clearAlert(alert.id); 
                            }}
                            className="p-1 rounded hover:bg-zinc-700 transition-colors shrink-0"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {alerts.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-zinc-800">
                      <button 
                        onClick={() => { 
                          alerts.forEach(a => clearAlert(a.id)); 
                          setNotifOpen(false);
                        }} 
                        className="w-full text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold uppercase tracking-wide flex items-center justify-center gap-1.5 py-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Clear All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Copilot Toggle with Dropdown */}
            <div className="relative hidden md:block" ref={copilotRef}>
              <button
                onClick={() => {
                  setCopilotOpen(!copilotOpen);
                  setNotifOpen(false);
                }}
                className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                  copilotOpen 
                    ? "border-amber-500/50 bg-zinc-800 text-amber-400" 
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">System AI Copilot</span>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${copilotOpen ? "rotate-180" : ""}`} />
              </button>

              {/* AI Copilot Dropdown Panel */}
              {copilotOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">AI Copilot Status</h3>
                    <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                      <Bot className="w-5 h-5 text-sky-400" />
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-300">Credit Risk Analysis</p>
                        <p className="text-[10px] text-zinc-500">Monitoring 5 customers</p>
                      </div>
                      <span className="ml-auto text-[9px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded font-mono">Running</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-300">Stock Prediction</p>
                        <p className="text-[10px] text-zinc-500">6 SKUs analyzed</p>
                      </div>
                      <span className="ml-auto text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono">Running</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-300">Anomaly Detection</p>
                        <p className="text-[10px] text-zinc-500">1 deviation flagged</p>
                      </div>
                      <span className="ml-auto text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-mono">Alert</span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 border-t border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-600 font-mono">Model: EDOS-AI v2.0 • Latency: 42ms</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Active Page Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-[#030303]">
          {renderActiveTab()}
        </main>

      </div>
    </div>
  );
}
