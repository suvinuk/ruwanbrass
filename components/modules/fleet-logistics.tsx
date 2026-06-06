"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "../../lib/store";
import { 
  Truck, Navigation, Key, ShieldCheck, CheckCircle2, AlertTriangle, 
  MapPin, User, Fuel, Clock, Send, Printer
} from "lucide-react";

export const FleetLogistics: React.FC = () => {
  const { deliveries, updateDeliveryStatus, currentProfile } = useAppState();

  const isDriver = currentProfile.type === "driver";
  const isShop = currentProfile.type === "shop";

  const filteredDeliveries = isDriver 
    ? deliveries.filter(d => d.driver === currentProfile.name) 
    : isShop 
    ? deliveries.filter(d => d.customerName === currentProfile.name) 
    : deliveries;

  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  useEffect(() => {
    if (filteredDeliveries.length > 0) {
      setSelectedDeliveryId(filteredDeliveries[0].id);
    } else {
      setSelectedDeliveryId("");
    }
  }, [currentProfile]);

  const activeDelivery = filteredDeliveries.find(d => d.id === selectedDeliveryId) || filteredDeliveries[0];

  // Simulated GPS auto-progress counter
  const [simLocationIndex, setSimLocationIndex] = useState(0);

  useEffect(() => {
    if (!activeDelivery || activeDelivery.status !== "In-Transit") return;

    // Simulate driver movement every 10 seconds
    const interval = setInterval(() => {
      setSimLocationIndex(prev => (prev + 1) % 3);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeDelivery]);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery) return;

    if (otpInput === activeDelivery.otp) {
      setOtpError(false);
      setSuccessAnim(true);
      setTimeout(() => {
        updateDeliveryStatus(activeDelivery.id, "Delivered", otpInput);
        setOtpInput("");
        setSuccessAnim(false);
      }, 1500);
    } else {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual GPS Route Tracker Map Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20 flex flex-col justify-between min-h-[350px] relative overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 grid-bg opacity-30" />
          
          <div className="flex justify-between items-center z-10">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-amber-500 animate-pulse" />
                Live GPS Transit Mapper
              </h3>
              <p className="text-xs text-zinc-500">Auto-tracking route coordinates Colombo - Kandy Hub</p>
            </div>
            {activeDelivery && (
              <span className={`px-2.5 py-0.5 rounded-[3px] text-[10px] font-bold ${
                activeDelivery.status === "In-Transit" ? "bg-amber-500/10 text-amber-500 animate-pulse" : "bg-emerald-500/10 text-emerald-500"
              }`}>
                Driver State: {activeDelivery.status}
              </span>
            )}
          </div>

          {/* Graphical Route Visualizer (SVG Canvas) */}
          <div className="my-10 flex flex-col items-center justify-center z-10">
            <div className="relative w-full max-w-md h-[120px] border border-zinc-800/40 rounded-lg bg-zinc-900/10 backdrop-blur-sm p-4 flex items-center justify-between">
              {/* SVG connection path line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M 40 60 Q 200 10, 360 60" 
                  fill="none" 
                  stroke="#27272a" 
                  strokeWidth="3" 
                  strokeDasharray="6 4"
                />
                {activeDelivery?.status === "In-Transit" && (
                  <path 
                    d="M 40 60 Q 200 10, 360 60" 
                    fill="none" 
                    stroke="#d97706" 
                    strokeWidth="3" 
                    strokeDasharray="100 100"
                    className="transition-all duration-1000"
                    style={{
                      strokeDashoffset: 100 - (activeDelivery.progress || 0)
                    }}
                  />
                )}
              </svg>

              {/* Start node */}
              <div className="flex flex-col items-center gap-1 z-20">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-[10px] font-semibold text-zinc-500">Colombo Hub</span>
              </div>

              {/* Transit vehicle point */}
              {activeDelivery?.status === "In-Transit" && (
                <div className="absolute left-[45%] top-[25%] -translate-x-1/2 flex flex-col items-center z-20">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-500 animate-pulse">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 mt-1">Yakkala Checkpoint</span>
                </div>
              )}

              {/* End node */}
              <div className="flex flex-col items-center gap-1 z-20">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <MapPin className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-[10px] font-semibold text-zinc-500">Kandy Store</span>
              </div>
            </div>
          </div>

          {/* Trip Analytics Footer info */}
          {activeDelivery && (
            <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-3 z-10">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> Driver: {activeDelivery.driver}</span>
              <span className="flex items-center gap-1"><Fuel className="w-4 h-4" /> Consumption: ~18.5 L</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Est: 1h 40m remaining</span>
            </div>
          )}
        </div>

        {/* Driver Verification Console */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
            <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-amber-500" />
              Delivery Hand-off Console
            </h3>
            
            {successAnim ? (
              <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-500 animate-bounce">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-emerald-400">OTP Verified Successfully!</p>
                <p className="text-xs text-zinc-500">Signing bill of lading and archiving delivery proof...</p>
              </div>
            ) : activeDelivery ? (
              <div className="space-y-4">
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs space-y-1.5">
                  <p className="font-semibold text-zinc-300">Active Order: {activeDelivery.orderNumber}</p>
                  <p className="text-zinc-500">Recipient: {activeDelivery.customerName}</p>
                  <p className="text-zinc-400">Driver Assignment: {activeDelivery.driver}</p>
                  {activeDelivery.status === "Delivered" ? (
                    <div className="mt-3 pt-2 border-t border-zinc-800 text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Delivered & Signed
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 border-t border-zinc-800 text-amber-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> Required Client Handshake OTP: <span className="font-mono font-bold bg-zinc-950 px-2 py-0.5 rounded text-zinc-200 tracking-wider">{activeDelivery.otp}</span>
                    </div>
                  )}
                </div>

                {activeDelivery.status !== "Delivered" && (
                  isShop ? (
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center space-y-2 text-xs">
                      <p className="text-zinc-400">Provide this handshake OTP code to the driver upon delivery to authorize the shipment receipt.</p>
                      <div className="text-xl font-bold font-mono bg-zinc-950 px-4 py-2 rounded text-amber-500 tracking-widest inline-block">
                        {activeDelivery.otp}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase font-semibold mb-1">Enter Customer Delivery OTP</label>
                        <input
                          type="text"
                          className="bg-zinc-900 border border-zinc-800 rounded p-2 text-sm text-zinc-200 focus:outline-none w-full focus:border-amber-500 font-mono tracking-widest text-center text-lg"
                          maxLength={4}
                          placeholder="••••"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                        />
                        {otpError && (
                          <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Incorrect security OTP code. Please retry.
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={!otpInput}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 text-zinc-100 disabled:text-zinc-600 font-bold p-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs"
                      >
                        Authenticate Hand-off
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  )
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-zinc-500 text-xs">
                No active delivery routes dispatched.
              </div>
            )}
          </div>

          {/* Active Deliveries List */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-zinc-200">Dispatched Fleet List</h3>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print flex items-center gap-1.5 px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-[10px] font-semibold transition-all active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-amber-500" />
                Print List
              </button>
            </div>
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
              {filteredDeliveries.map(del => (
                <div 
                  key={del.id} 
                  onClick={() => setSelectedDeliveryId(del.id)}
                  className={`p-2.5 rounded border cursor-pointer transition-colors ${
                    selectedDeliveryId === del.id ? "bg-amber-500/5 border-amber-500" : "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-300">{del.orderNumber}</span>
                    <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold ${
                      del.status === "Delivered" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500 animate-pulse"
                    }`}>{del.status}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">{del.customerName} • Driver: {del.driver}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
