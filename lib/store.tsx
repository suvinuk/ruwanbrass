"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Customer {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  creditLimit: number;
  currentBalance: number;
  riskScore: number;
  loyaltyScore: number;
  churnProbability: number;
  gps: { lat: number; lng: number };
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStockAlert: number;
  binLocation: string;
  wholesalePrice: number;
  retailPrice: number;
  creditPrice: number;
}

export interface OrderItem {
  itemId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  discount: number;
  status: "Draft" | "Approved" | "Packed" | "Shipped" | "In-Transit" | "Delivered" | "Paid";
  createdAt: string;
  salesPerson: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: "Unpaid" | "Paid" | "Overdue";
  daysOverdue: number;
}

export interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  driver: string;
  status: "Pending" | "Assigned" | "In-Transit" | "Delivered" | "Failed";
  progress: number; // 0 to 100
  route: { lat: number; lng: number }[];
  currentLocation: { lat: number; lng: number };
  otp: string;
  signature?: string;
  photoUrl?: string;
}

export interface CommissionPayout {
  id: string;
  salesRep: string;
  fixedRate: number;
  tier: string;
  salesAchieved: number;
  targetCollection: number;
  earned: number;
  bonus: number;
}

export interface Alert {
  id: string;
  type: "credit" | "stock" | "delivery" | "payment" | "system";
  message: string;
  severity: "info" | "warning" | "critical";
  time: string;
  isCleared: boolean;
}

export interface Profile {
  id: string;
  name: string;
  role: string;
  initials: string;
  type: "admin" | "sales" | "shop" | "driver";
  refId?: string;
}

interface AppContextType {
  customers: Customer[];
  inventory: InventoryItem[];
  orders: Order[];
  invoices: Invoice[];
  deliveries: Delivery[];
  commissions: CommissionPayout[];
  alerts: Alert[];
  addOrder: (customerId: string, items: { itemId: string; quantity: number; priceType: "wholesale" | "retail" | "credit" }[], discount: number) => void;
  payInvoice: (invoiceId: string, amount: number) => void;
  updateDeliveryStatus: (deliveryId: string, status: Delivery["status"], otpCode?: string) => void;
  clearAlert: (alertId: string) => void;
  resetState: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentProfile: Profile;
  setCurrentProfile: (profile: Profile) => void;
  availableProfiles: Profile[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const initialCustomers: Customer[] = [
  { id: "c1", businessName: "Apex Hardware Distributors", contactName: "Ruwan Wijetunga", email: "contact@apexhardware.com", phone: "+94 77 123 4567", creditLimit: 50000, currentBalance: 42500, riskScore: 12, loyaltyScore: 95, churnProbability: 2.1, gps: { lat: 6.9271, lng: 79.8612 } },
  { id: "c2", businessName: "Lanka Brass Emporium", contactName: "Samantha Silva", email: "samantha@lankabrass.lk", phone: "+94 71 987 6543", creditLimit: 30000, currentBalance: 29500, riskScore: 78, loyaltyScore: 42, churnProbability: 45.4, gps: { lat: 7.2906, lng: 80.6337 } },
  { id: "c3", businessName: "Kandy Industrial Supplies", contactName: "Mohamed Rauf", email: "rauf@kandyindustrials.com", phone: "+94 81 223 8899", creditLimit: 75000, currentBalance: 12000, riskScore: 5, loyaltyScore: 98, churnProbability: 0.8, gps: { lat: 7.2915, lng: 80.6350 } },
  { id: "c4", businessName: "Southern Builders Depot", contactName: "Dinesh Fernando", email: "dinesh@southernbuilders.lk", phone: "+94 91 445 2211", creditLimit: 20000, currentBalance: 24000, riskScore: 89, loyaltyScore: 15, churnProbability: 72.8, gps: { lat: 6.0535, lng: 80.2210 } },
  { id: "c5", businessName: "Metro Fittings Colombo", contactName: "Anil Perera", email: "anil@metrofittings.com", phone: "+94 11 556 7788", creditLimit: 100000, currentBalance: 0, riskScore: 2, loyaltyScore: 100, churnProbability: 0.2, gps: { lat: 6.9319, lng: 79.8478 } }
];

const initialInventory: InventoryItem[] = [
  { id: "i1", sku: "R-BRS-VALV-05", name: "Heavy Duty Brass Gate Valve 1/2\"", category: "Valves", stock: 140, minStockAlert: 15, binLocation: "A-12-04", wholesalePrice: 12.50, retailPrice: 15.00, creditPrice: 13.75 },
  { id: "i2", sku: "R-BRS-VALV-07", name: "Heavy Duty Brass Gate Valve 3/4\"", category: "Valves", stock: 12, minStockAlert: 15, binLocation: "A-12-08", wholesalePrice: 18.20, retailPrice: 22.00, creditPrice: 19.90 },
  { id: "i3", sku: "R-BRS-ELLW-90", name: "Brass Female Elbow 90 Degree 1/2\"", category: "Fittings", stock: 450, minStockAlert: 20, binLocation: "B-04-11", wholesalePrice: 4.10, retailPrice: 5.50, creditPrice: 4.50 },
  { id: "i4", sku: "R-BRS-TEE-05", name: "Brass Equal Tee Joint 1/2\"", category: "Fittings", stock: 320, minStockAlert: 20, binLocation: "B-05-02", wholesalePrice: 5.80, retailPrice: 7.25, creditPrice: 6.30 },
  { id: "i5", sku: "R-BRS-TAP-NKL", name: "Premium Nickel-Plated Brass Bib Tap", category: "Taps & Faucets", stock: 48, minStockAlert: 10, binLocation: "C-01-09", wholesalePrice: 24.00, retailPrice: 29.90, creditPrice: 26.50 },
  { id: "i6", sku: "R-BRS-UNN-10", name: "Brass Straight Union Connector 1\"", category: "Fittings", stock: 85, minStockAlert: 10, binLocation: "B-09-12", wholesalePrice: 14.50, retailPrice: 18.00, creditPrice: 16.00 }
];

const initialOrders: Order[] = [
  { id: "ord-101", orderNumber: "ORD-2026-101", customerName: "Apex Hardware Distributors", customerId: "c1", items: [{ itemId: "i1", name: "Heavy Duty Brass Gate Valve 1/2\"", sku: "R-BRS-VALV-05", quantity: 50, price: 12.50 }, { itemId: "i3", name: "Brass Female Elbow 90 Degree 1/2\"", sku: "R-BRS-ELLW-90", quantity: 100, price: 4.10 }], total: 1035.00, discount: 50.00, status: "Paid", createdAt: "2026-06-01T10:30:00Z", salesPerson: "Manoj De Silva" },
  { id: "ord-102", orderNumber: "ORD-2026-102", customerName: "Lanka Brass Emporium", customerId: "c2", items: [{ itemId: "i2", name: "Heavy Duty Brass Gate Valve 3/4\"", sku: "R-BRS-VALV-07", quantity: 20, price: 19.90 }, { itemId: "i5", name: "Premium Nickel-Plated Brass Bib Tap", sku: "R-BRS-TAP-NKL", quantity: 10, price: 26.50 }], total: 663.00, discount: 0, status: "In-Transit", createdAt: "2026-06-02T14:15:00Z", salesPerson: "Nishan Alwis" },
  { id: "ord-103", orderNumber: "ORD-2026-103", customerName: "Kandy Industrial Supplies", customerId: "c3", items: [{ itemId: "i4", name: "Brass Equal Tee Joint 1/2\"", sku: "R-BRS-TEE-05", quantity: 40, price: 5.80 }], total: 232.00, discount: 10.00, status: "Approved", createdAt: "2026-06-03T09:00:00Z", salesPerson: "Manoj De Silva" }
];

const initialInvoices: Invoice[] = [
  { id: "inv-201", invoiceNumber: "INV-2026-201", customerName: "Apex Hardware Distributors", customerId: "c1", amount: 42500, amountPaid: 0, dueDate: "2026-06-15", status: "Unpaid", daysOverdue: 0 },
  { id: "inv-202", invoiceNumber: "INV-2026-202", customerName: "Lanka Brass Emporium", customerId: "c2", amount: 29500, amountPaid: 0, dueDate: "2026-05-25", status: "Overdue", daysOverdue: 9 },
  { id: "inv-203", invoiceNumber: "INV-2026-203", customerName: "Southern Builders Depot", customerId: "c4", amount: 24000, amountPaid: 0, dueDate: "2026-05-10", status: "Overdue", daysOverdue: 24 }
];

const initialDeliveries: Delivery[] = [
  {
    id: "del-301",
    orderNumber: "ORD-2026-102",
    customerName: "Lanka Brass Emporium",
    driver: "Pradeep Perera",
    status: "In-Transit",
    progress: 45,
    route: [
      { lat: 6.9271, lng: 79.8612 }, // Colombo Start
      { lat: 7.0840, lng: 80.0098 }, // Yakkala
      { lat: 7.2906, lng: 80.6337 }  // Kandy End
    ],
    currentLocation: { lat: 7.0840, lng: 80.0098 },
    otp: "5892"
  }
];

const initialCommissions: CommissionPayout[] = [
  { id: "com-1", salesRep: "Manoj De Silva", fixedRate: 2.5, tier: "Gold (3.5%)", salesAchieved: 850000, targetCollection: 92, earned: 29750, bonus: 5000 },
  { id: "com-2", salesRep: "Nishan Alwis", fixedRate: 2.0, tier: "Silver (2.5%)", salesAchieved: 520000, targetCollection: 74, earned: 13000, bonus: 0 },
  { id: "com-3", salesRep: "Priyanga Silva", fixedRate: 2.0, tier: "Bronze (2.0%)", salesAchieved: 310000, targetCollection: 95, earned: 6200, bonus: 1500 }
];

const initialAlerts: Alert[] = [
  { id: "al-1", type: "credit", message: "Southern Builders Depot (c4) has exceeded credit limit of LKR 20,000. Balance: LKR 24,000", severity: "critical", time: "10 mins ago", isCleared: false },
  { id: "al-2", type: "stock", message: "Heavy Duty Brass Gate Valve 3/4\" (SKU: R-BRS-VALV-07) is low. 12 units remaining (Threshold: 15)", severity: "warning", time: "1 hour ago", isCleared: false },
  { id: "al-3", type: "payment", message: "Lanka Brass Emporium (c2) payment of LKR 29,500 is overdue by 9 days", severity: "warning", time: "2 hours ago", isCleared: false }
];

const initialProfile: Profile = { id: "ceo", name: "Ruwan W.", role: "CEO / Super Admin", initials: "RW", type: "admin" };

export const availableProfiles: Profile[] = [
  // Admin
  { id: "ceo", name: "Ruwan W.", role: "CEO / Super Admin", initials: "RW", type: "admin" },
  // Sales Reps
  { id: "manoj", name: "Manoj De Silva", role: "Sales Rep (Gold)", initials: "MS", type: "sales" },
  { id: "nishan", name: "Nishan Alwis", role: "Sales Rep (Silver)", initials: "NA", type: "sales" },
  { id: "priyanga", name: "Priyanga Silva", role: "Sales Rep (Bronze)", initials: "PS", type: "sales" },
  // Shops / Distributors
  { id: "shop_apex", name: "Apex Hardware Distributors", role: "Distributor Account", initials: "AH", type: "shop", refId: "c1" },
  { id: "shop_lanka", name: "Lanka Brass Emporium", role: "Distributor Account", initials: "LB", type: "shop", refId: "c2" },
  { id: "shop_kandy", name: "Kandy Industrial Supplies", role: "Distributor Account", initials: "KI", type: "shop", refId: "c3" },
  { id: "shop_southern", name: "Southern Builders Depot", role: "Distributor Account", initials: "SB", type: "shop", refId: "c4" },
  { id: "shop_metro", name: "Metro Fittings Colombo", role: "Distributor Account", initials: "MF", type: "shop", refId: "c5" },
  // Others
  { id: "driver_pradeep", name: "Pradeep Perera", role: "Logistics Driver", initials: "PP", type: "driver" }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [commissions, setCommissions] = useState<CommissionPayout[]>(initialCommissions);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [currentProfile, setCurrentProfile] = useState<Profile>(initialProfile);

  // Sync state between tabs and updates (in-memory simulator triggers updates)
  useEffect(() => {
    const saved = localStorage.getItem("ruwan_brass_edos_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomers(parsed.customers);
        setInventory(parsed.inventory);
        setOrders(parsed.orders);
        setInvoices(parsed.invoices);
        setDeliveries(parsed.deliveries);
        setCommissions(parsed.commissions);
        setAlerts(parsed.alerts);
        if (parsed.currentProfile) {
          setCurrentProfile(parsed.currentProfile);
        }
      } catch (e) {
        console.error("Error loading state", e);
      }
    }
  }, []);

  const saveState = (updatedState: any) => {
    localStorage.setItem("ruwan_brass_edos_state", JSON.stringify(updatedState));
  };

  const addOrder = (
    customerId: string,
    orderItems: { itemId: string; quantity: number; priceType: "wholesale" | "retail" | "credit" }[],
    discount: number
  ) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const itemsList: OrderItem[] = [];
    let orderTotal = 0;

    const nextInventory = inventory.map(item => {
      const orderItemConfig = orderItems.find(oi => oi.itemId === item.id);
      if (orderItemConfig) {
        const price =
          orderItemConfig.priceType === "wholesale"
            ? item.wholesalePrice
            : orderItemConfig.priceType === "retail"
            ? item.retailPrice
            : item.creditPrice;

        const subtotal = price * orderItemConfig.quantity;
        orderTotal += subtotal;

        itemsList.push({
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          quantity: orderItemConfig.quantity,
          price
        });

        // Live Stock Deduction
        const newStock = Math.max(0, item.stock - orderItemConfig.quantity);

        return { ...item, stock: newStock };
      }
      return item;
    });

    const finalTotal = Math.max(0, orderTotal - discount);
    const orderNum = `ORD-2026-${100 + orders.length + 1}`;

    const salesPersonName = currentProfile.type === "sales" 
      ? currentProfile.name 
      : currentProfile.type === "shop" 
      ? "Customer self-service"
      : "Ruwan W. (Admin)";

    const newOrder: Order = {
      id: `ord-${100 + orders.length + 1}`,
      orderNumber: orderNum,
      customerName: customer.businessName,
      customerId: customer.id,
      items: itemsList,
      total: finalTotal,
      discount,
      status: "Approved",
      createdAt: new Date().toISOString(),
      salesPerson: salesPersonName
    };

    // Update customer balance if order is on credit / wholesale
    const nextCustomers = customers.map(c => {
      if (c.id === customerId) {
        const newBalance = Number(c.currentBalance) + finalTotal;
        return { ...c, currentBalance: newBalance };
      }
      return c;
    });

    const nextOrders = [newOrder, ...orders];

    // Trigger AI alert if stock is critical
    const newAlerts = [...alerts];
    nextInventory.forEach(item => {
      if (item.stock < item.minStockAlert && !alerts.some(a => a.message.includes(item.sku))) {
        newAlerts.unshift({
          id: `al-${Date.now()}-${item.sku}`,
          type: "stock",
          message: `Stock Critical: ${item.name} (${item.sku}) is below threshold. Current: ${item.stock}`,
          severity: "critical",
          time: "Just now",
          isCleared: false
        });
      }
    });

    // Create a delivery entry
    const newDelivery: Delivery = {
      id: `del-${300 + deliveries.length + 1}`,
      orderNumber: orderNum,
      customerName: customer.businessName,
      driver: "Pradeep Perera",
      status: "Assigned",
      progress: 0,
      route: [
        { lat: 6.9271, lng: 79.8612 },
        customer.gps
      ],
      currentLocation: { lat: 6.9271, lng: 79.8612 },
      otp: Math.floor(1000 + Math.random() * 9000).toString()
    };

    // Create Invoice
    const newInvoice: Invoice = {
      id: `inv-${200 + invoices.length + 1}`,
      invoiceNumber: `INV-2026-${200 + invoices.length + 1}`,
      customerName: customer.businessName,
      customerId: customer.id,
      amount: finalTotal,
      amountPaid: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Unpaid",
      daysOverdue: 0
    };

    const nextInvoices = [newInvoice, ...invoices];
    const nextDeliveries = [newDelivery, ...deliveries];

    setInventory(nextInventory);
    setCustomers(nextCustomers);
    setOrders(nextOrders);
    setDeliveries(nextDeliveries);
    setInvoices(nextInvoices);
    setAlerts(newAlerts);

    saveState({
      customers: nextCustomers,
      inventory: nextInventory,
      orders: nextOrders,
      invoices: nextInvoices,
      deliveries: nextDeliveries,
      commissions,
      alerts: newAlerts
    });
  };

  const payInvoice = (invoiceId: string, amount: number) => {
    const nextInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const paid = Number(inv.amountPaid) + amount;
        const isFullyPaid = paid >= Number(inv.amount);
        return {
          ...inv,
          amountPaid: paid,
          status: (isFullyPaid ? "Paid" : inv.status) as any
        };
      }
      return inv;
    });

    const targetInvoice = invoices.find(i => i.id === invoiceId);
    if (!targetInvoice) return;

    const nextCustomers = customers.map(c => {
      if (c.id === targetInvoice.customerId) {
        const bal = Math.max(0, Number(c.currentBalance) - amount);
        return { ...c, currentBalance: bal };
      }
      return c;
    });

    // Recalculate commissions: add dynamic slabs for collection target
    const targetRep = currentProfile.type === "sales" 
      ? currentProfile.name 
      : "Manoj De Silva";

    const nextCommissions = commissions.map(comm => {
      if (comm.salesRep === targetRep) {
        const salesAchieved = comm.salesAchieved + (targetInvoice.status === "Paid" ? 0 : amount);
        const colPercent = Math.min(100, comm.targetCollection + 2);
        const earned = Math.floor(salesAchieved * (comm.fixedRate / 100));
        return {
          ...comm,
          salesAchieved,
          targetCollection: colPercent,
          earned
        };
      }
      return comm;
    });

    setInvoices(nextInvoices);
    setCustomers(nextCustomers);
    setCommissions(nextCommissions);

    const alertMsg = `Payment Received: LKR ${amount.toLocaleString()} from ${targetInvoice.customerName} for ${targetInvoice.invoiceNumber}`;
    const nextAlerts = [
      {
        id: `al-${Date.now()}`,
        type: "payment" as const,
        message: alertMsg,
        severity: "info" as const,
        time: "Just now",
        isCleared: false
      },
      ...alerts
    ];
    setAlerts(nextAlerts);

    saveState({
      customers: nextCustomers,
      inventory,
      orders,
      invoices: nextInvoices,
      deliveries,
      commissions: nextCommissions,
      alerts: nextAlerts
    });
  };

  const updateDeliveryStatus = (deliveryId: string, status: Delivery["status"], otpCode?: string) => {
    const nextDeliveries = deliveries.map(del => {
      if (del.id === deliveryId) {
        if (status === "Delivered" && otpCode !== del.otp) {
          // If code doesn't match, keep status but raise alert
          return del;
        }

        const isFinished = status === "Delivered";
        const progress = isFinished ? 100 : status === "In-Transit" ? 75 : del.progress;
        const nextLoc = isFinished ? del.route[del.route.length - 1] : del.currentLocation;

        return {
          ...del,
          status,
          progress,
          currentLocation: nextLoc,
          signature: isFinished ? "M. Rauf (Warehouse Manager)" : undefined,
          photoUrl: isFinished ? "/assets/delivery_proof_mock.jpg" : undefined
        };
      }
      return del;
    });

    const targetDel = deliveries.find(d => d.id === deliveryId);
    if (!targetDel) return;

    // Trigger associated order to be Paid/Delivered
    const nextOrders = orders.map(ord => {
      if (ord.orderNumber === targetDel.orderNumber) {
        return { ...ord, status: (status === "Delivered" ? "Delivered" : "Shipped") as any };
      }
      return ord;
    });

    setDeliveries(nextDeliveries);
    setOrders(nextOrders);

    const nextAlerts = [
      {
        id: `al-${Date.now()}`,
        type: "delivery" as const,
        message: `Delivery ${targetDel.orderNumber} is now ${status}`,
        severity: status === "Failed" ? "critical" as const : "info" as const,
        time: "Just now",
        isCleared: false
      },
      ...alerts
    ];
    setAlerts(nextAlerts);

    saveState({
      customers,
      inventory,
      orders: nextOrders,
      invoices,
      deliveries: nextDeliveries,
      commissions,
      alerts: nextAlerts
    });
  };

  const clearAlert = (alertId: string) => {
    const nextAlerts = alerts.map(a => (a.id === alertId ? { ...a, isCleared: true } : a));
    setAlerts(nextAlerts);
    saveState({
      customers,
      inventory,
      orders,
      invoices,
      deliveries,
      commissions,
      alerts: nextAlerts
    });
  };

  const handleSetProfile = (p: Profile) => {
    setCurrentProfile(p);
    localStorage.setItem("ruwan_brass_edos_state", JSON.stringify({
      customers,
      inventory,
      orders,
      invoices,
      deliveries,
      commissions,
      alerts,
      currentProfile: p
    }));
  };

  const resetState = () => {
    localStorage.removeItem("ruwan_brass_edos_state");
    setCustomers(initialCustomers);
    setInventory(initialInventory);
    setOrders(initialOrders);
    setInvoices(initialInvoices);
    setDeliveries(initialDeliveries);
    setCommissions(initialCommissions);
    setAlerts(initialAlerts);
    setCurrentProfile(initialProfile);
    setCurrentTab("dashboard");
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        inventory,
        orders,
        invoices,
        deliveries,
        commissions,
        alerts: alerts.filter(a => !a.isCleared),
        addOrder,
        payInvoice,
        updateDeliveryStatus,
        clearAlert,
        resetState,
        currentTab,
        setCurrentTab,
        currentProfile,
        setCurrentProfile: handleSetProfile,
        availableProfiles
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
};
