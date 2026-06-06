"use client";

import React, { useState } from "react";
import { useAppState } from "../../lib/store";
import { 
  Package, Search, Landmark, Layers, ShieldAlert, CheckCircle, 
  ArrowUpDown, Filter, BarChart2, Printer
} from "lucide-react";

export const Inventory: React.FC = () => {
  const { inventory } = useAppState();
  const [activeWarehouse, setActiveWarehouse] = useState<"all" | "colombo" | "kandy">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredInventory = () => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Simulate multi-warehouse distribution splits (e.g., Colombo has 70% stock, Kandy has 30%)
      if (activeWarehouse === "colombo") {
        return matchesSearch && item.stock > 10;
      }
      if (activeWarehouse === "kandy") {
        return matchesSearch && item.stock > 5;
      }
      return matchesSearch;
    });
  };

  const filteredItems = getFilteredInventory();

  // Stock health summaries
  const totalSkuCount = inventory.length;
  const criticalSkus = inventory.filter(i => i.stock < i.minStockAlert).length;
  const totalStockQuantity = inventory.reduce((sum, i) => sum + i.stock, 0);

  return (
    <div className="space-y-6">
      {/* Mini Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-4">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Unique SKU Lines</p>
            <p className="text-lg font-bold text-zinc-100 font-mono">{totalSkuCount} SKUs</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-4">
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Stock Reorder Warnings</p>
            <p className="text-lg font-bold text-rose-500 font-mono">{criticalSkus} Items</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center gap-4">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Stock Assets</p>
            <p className="text-lg font-bold text-emerald-500 font-mono">{totalStockQuantity} units</p>
          </div>
        </div>
      </div>

      {/* Control panel and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/20">
        {/* Search input */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg text-sm w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-zinc-500 mr-2" />
          <input
            type="text"
            placeholder="Search SKUs or item names..."
            className="bg-transparent text-zinc-100 placeholder-zinc-500 w-full focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Warehouse Tab Selector */}
          <div className="flex bg-zinc-900 p-1 border border-zinc-800 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveWarehouse("all")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeWarehouse === "all" ? "bg-zinc-800 text-amber-500" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Warehouses
            </button>
            <button
              onClick={() => setActiveWarehouse("colombo")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeWarehouse === "colombo" ? "bg-zinc-800 text-amber-500" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Colombo Central
            </button>
            <button
              onClick={() => setActiveWarehouse("kandy")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeWarehouse === "kandy" ? "bg-zinc-800 text-amber-500" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Kandy Depot
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="no-print flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-xs font-semibold transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            Print Report
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 font-semibold uppercase">
                <th className="py-2.5 px-3">SKU Code</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Bin Location</th>
                <th className="py-2.5 px-3">Wholesale Price</th>
                <th className="py-2.5 px-3">Credit Price</th>
                <th className="py-2.5 px-3 text-right">Available Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {filteredItems.map(item => {
                const isCritical = item.stock < item.minStockAlert;
                
                // Adjust stock based on warehouse filter view
                const displayStock = activeWarehouse === "colombo" 
                  ? Math.max(0, Math.floor(item.stock * 0.7)) 
                  : activeWarehouse === "kandy"
                  ? Math.max(0, Math.floor(item.stock * 0.3))
                  : item.stock;

                return (
                  <tr key={item.id} className="hover:bg-zinc-900/10 text-zinc-400">
                    <td className="py-3 px-3 font-semibold text-zinc-300 font-mono">{item.sku}</td>
                    <td className="py-3 px-3 font-medium text-zinc-200">{item.name}</td>
                    <td className="py-3 px-3">{item.category}</td>
                    <td className="py-3 px-3 font-mono text-xs">{item.binLocation}</td>
                    <td className="py-3 px-3 font-mono">LKR {item.wholesalePrice.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono">LKR {item.creditPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        displayStock === 0
                          ? "bg-rose-500/10 text-rose-500"
                          : isCritical
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {displayStock} units
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
