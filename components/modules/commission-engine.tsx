"use client";

import React, { useState } from "react";
import { useAppState } from "../../lib/store";
import { 
  Percent, DollarSign, Award, Settings, CheckCircle2, 
  HelpCircle, RefreshCw, Sparkles, TrendingUp, Printer, ShieldAlert
} from "lucide-react";

export const CommissionEngine: React.FC = () => {
  const { commissions, currentProfile } = useAppState();

  if (currentProfile.type === "shop" || currentProfile.type === "driver") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-zinc-800 rounded-xl bg-zinc-950/20">
        <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-200">Access Restricted</h3>
          <p className="text-xs text-zinc-500 max-w-sm">The Commission Engine is an internal staff utility and is restricted for customer portal accounts.</p>
        </div>
      </div>
    );
  }

  // Rules adjustment states
  const [baseRate, setBaseRate] = useState(2.5);
  const [collectionTarget, setCollectionTarget] = useState(80); // Target collection % for bonus
  const [bonusSlab, setBonusSlab] = useState(5000); // LKR bonus for hitting target collection

  const [payoutLogs, setPayoutLogs] = useState<string[]>([]);
  const [settledReps, setSettledReps] = useState<string[]>([]);

  const handleSettlePayout = (repName: string, amount: number) => {
    if (settledReps.includes(repName)) return;
    
    setSettledReps(prev => [...prev, repName]);
    setPayoutLogs(prev => [
      `Payout Settled: LKR ${amount.toLocaleString()} disbursed to ${repName} for period ending yesterday.`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Rules Config Panel and Live Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Rules Engine Panel */}
        <div className="lg:col-span-1 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-amber-500" />
            Rules Adjustment Engine
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Configure target multipliers and payout percentages. The changes recalculate payouts across the sales ledger.
          </p>

          {currentProfile.type === "sales" && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-amber-400 text-xs rounded-lg flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Read-only: Commission rate configurations are restricted to CEO / Admin profile.</span>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {/* Rule 1: Base Rate */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5">
                <span>Base Commission Rate</span>
                <span className="text-amber-500 font-mono">{baseRate}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                disabled={currentProfile.type === "sales"}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                value={baseRate}
                onChange={(e) => setBaseRate(parseFloat(e.target.value))}
              />
            </div>

            {/* Rule 2: Collection Target */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5">
                <span>Collection Threshold</span>
                <span className="text-amber-500 font-mono">{collectionTarget}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                disabled={currentProfile.type === "sales"}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                value={collectionTarget}
                onChange={(e) => setCollectionTarget(parseInt(e.target.value))}
              />
            </div>

            {/* Rule 3: Target Bonus */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1.5">
                <span>Collection Speed Bonus</span>
                <span className="text-amber-500 font-mono">LKR {bonusSlab.toLocaleString()}</span>
              </div>
              <select
                disabled={currentProfile.type === "sales"}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                value={bonusSlab}
                onChange={(e) => setBonusSlab(parseInt(e.target.value))}
              >
                <option value={2000}>LKR 2,000 / rep</option>
                <option value={5000}>LKR 5,000 / rep</option>
                <option value={10000}>LKR 10,000 / rep</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Commissions Table */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Active Representative Ledgers</h3>
              <p className="text-xs text-zinc-500">Recalculates based on active rules</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="no-print text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded font-mono">Dynamic Slabs</span>
              <button
                type="button"
                onClick={() => window.print()}
                className="no-print flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition-all active:scale-95"
              >
                <Printer className="w-3.5 h-3.5 text-amber-500" />
                Print Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 font-semibold uppercase">
                  <th className="py-2 px-3">Sales Agent</th>
                  <th className="py-2 px-3">Sales Volume</th>
                  <th className="py-2 px-3">Collection Achieved</th>
                  <th className="py-2 px-3">Base Commission</th>
                  <th className="py-2 px-3">Incentive Bonus</th>
                  <th className="py-2 px-3">Total Earned</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {commissions.map(comm => {
                  // Live recalculation based on slide rules
                  const baseEarned = Math.floor(comm.salesAchieved * (baseRate / 100));
                  const qualifiesForBonus = comm.targetCollection >= collectionTarget;
                  const currentBonus = qualifiesForBonus ? bonusSlab : 0;
                  const totalEarned = baseEarned + currentBonus;
                  const isSettled = settledReps.includes(comm.salesRep);

                  return (
                    <tr key={comm.id} className="hover:bg-zinc-900/10 text-zinc-400">
                      <td className="py-3 px-3 font-semibold text-zinc-200">{comm.salesRep}</td>
                      <td className="py-3 px-3 font-mono text-zinc-300">LKR {comm.salesAchieved.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${comm.targetCollection >= collectionTarget ? "text-emerald-500" : "text-amber-500"}`}>
                          {comm.targetCollection}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">LKR {baseEarned.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">LKR {currentBonus.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono font-bold text-zinc-200">LKR {totalEarned.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleSettlePayout(comm.salesRep, totalEarned)}
                          disabled={isSettled}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${
                            isSettled 
                              ? "bg-zinc-800 text-zinc-500 border border-zinc-800 cursor-not-allowed" 
                              : "bg-amber-500 hover:bg-amber-600 text-zinc-950 hover:shadow-md"
                          }`}
                        >
                          {isSettled ? "Settled" : "Settle"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Disbursed Log History */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
        <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4.5 h-4.5 text-amber-500" />
          Payout Activity Audit Logs
        </h3>
        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
          {payoutLogs.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-3">No settlements processed in this session.</p>
          ) : (
            payoutLogs.map((log, index) => (
              <div key={index} className="p-2 bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{log}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
