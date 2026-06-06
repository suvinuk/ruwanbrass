"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Command, CornerDownLeft, Sparkles, User, Box, FileText, ArrowRight, ShieldAlert } from "lucide-react";
import { useAppState } from "../../lib/store";

interface SuperSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperSearch: React.FC<SuperSearchProps> = ({ isOpen, onClose }) => {
  const { customers, inventory, invoices, orders, setCurrentTab } = useAppState();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on ESC, select on Enter, navigate on Arrows
  useEffect(() => {
    if (!isOpen) return;
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  // Search filter matching
  const getFilteredResults = () => {
    const results: any[] = [];
    const lowerQuery = query.toLowerCase().trim();

    // Command Actions
    const commands = [
      { id: "cmd-dash", type: "command", title: "Go to Executive Dashboard", category: "Navigation", tab: "dashboard", icon: Command },
      { id: "cmd-sales", type: "command", title: "Go to Sales & Credit Control", category: "Navigation", tab: "sales", icon: Command },
      { id: "cmd-inv", type: "command", title: "Go to Inventory & Warehouses", category: "Navigation", tab: "inventory", icon: Command },
      { id: "cmd-fleet", type: "command", title: "Go to Fleet & Route Logistics", category: "Navigation", tab: "fleet", icon: Command },
      { id: "cmd-comm", type: "command", title: "Go to Auto Commission Engine", category: "Navigation", tab: "commissions", icon: Command },
    ];

    commands.forEach(cmd => {
      if (cmd.title.toLowerCase().includes(lowerQuery) || cmd.category.toLowerCase().includes(lowerQuery)) {
        results.push(cmd);
      }
    });

    if (lowerQuery === "") {
      // Default suggestions: recent logs/actions or quick links
      return results.slice(0, 5);
    }

    // Filter Customers
    customers.forEach(cust => {
      if (cust.businessName.toLowerCase().includes(lowerQuery) || cust.contactName.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `cust-${cust.id}`,
          type: "customer",
          title: cust.businessName,
          subtitle: `Contact: ${cust.contactName} | Risk Score: ${cust.riskScore}%`,
          category: "Customers",
          tab: "sales",
          icon: User
        });
      }
    });

    // Filter Stock
    inventory.forEach(item => {
      if (item.name.toLowerCase().includes(lowerQuery) || item.sku.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `item-${item.id}`,
          type: "inventory",
          title: item.name,
          subtitle: `SKU: ${item.sku} | In-Stock: ${item.stock} units | Bin: ${item.binLocation}`,
          category: "Inventory",
          tab: "inventory",
          icon: Box
        });
      }
    });

    // Filter Invoices
    invoices.forEach(inv => {
      if (inv.invoiceNumber.toLowerCase().includes(lowerQuery) || inv.customerName.toLowerCase().includes(lowerQuery)) {
        results.push({
          id: `inv-${inv.id}`,
          type: "invoice",
          title: `${inv.invoiceNumber} - ${inv.customerName}`,
          subtitle: `Amount: LKR ${inv.amount.toLocaleString()} | Due: ${inv.dueDate} (${inv.status})`,
          category: "Finance & Invoices",
          tab: "sales",
          icon: FileText
        });
      }
    });

    // Semantic queries simulation
    if (lowerQuery.includes("risk") || lowerQuery.includes("critical") || lowerQuery.includes("low")) {
      results.push({
        id: "ai-risk",
        type: "ai",
        title: "Run AI Financial Risk Scan",
        subtitle: "Scans for customer overdue balances and calculates default probabilities",
        category: "AI Engine",
        tab: "sales",
        icon: Sparkles
      });
    }

    return results;
  };

  const filteredResults = getFilteredResults();

  const handleSelect = (item: any) => {
    setCurrentTab(item.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-[#09090b] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800/80">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-base focus:outline-none"
            placeholder="Search stock, customers, invoices, or type commands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[10px] text-zinc-400 font-mono">
            <span>ESC</span>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-[350px] overflow-y-auto py-2">
          {filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <ShieldAlert className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-400">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-zinc-500 mt-1">Try searching for terms like &ldquo;valve&rdquo;, &ldquo;limit&rdquo;, or &ldquo;overdue&rdquo;</p>
            </div>
          ) : (
            <div>
              {/* Grouping Header */}
              {Object.entries(
                filteredResults.reduce((groups: any, item) => {
                  const group = item.category;
                  if (!groups[group]) groups[group] = [];
                  groups[group].push(item);
                  return groups;
                }, {})
              ).map(([category, items]: any) => (
                <div key={category}>
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950/40">
                    {category}
                  </div>
                  {items.map((item: any) => {
                    const globalIndex = filteredResults.findIndex(r => r.id === item.id);
                    const isSelected = globalIndex === selectedIndex;
                    const ItemIcon = item.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                          isSelected ? "bg-zinc-900/80 text-zinc-100" : "text-zinc-300 hover:bg-zinc-900/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1.5 rounded-md ${
                            isSelected ? "bg-amber-500/20 text-amber-500" : "bg-zinc-900 text-zinc-400"
                          }`}>
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            {item.subtitle && (
                              <p className="text-xs text-zinc-500 truncate mt-0.5">{item.subtitle}</p>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-mono">
                            <span>Open</span>
                            <CornerDownLeft className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/70 border-t border-zinc-800 text-[11px] text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="font-mono bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">↑↓</span> Move
            </span>
            <span className="flex items-center gap-1">
              <span className="font-mono bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">Enter</span> Select
            </span>
          </div>
          <span className="flex items-center gap-1 text-amber-500/80">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI Global Indexing Active
          </span>
        </div>
      </div>
    </div>
  );
};
