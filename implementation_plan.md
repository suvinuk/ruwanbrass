# Implementation Plan: Role-Based Portal Switching (Multi-Profile Demos)

This updated plan adds comprehensive support for role-based portal switching, allowing the user to view the Ruwan Brass EDOS from the perspective of an Admin, a Salesperson, a Shop (Distributor Customer), or a Driver.

## User Review Required

> [!IMPORTANT]
> The system will change features dynamically based on the selected profile type:
> 1. **Super Admin (`RW`)**: Full visibility, full ledger edits, and commission rule configurations.
> 2. **Sales Reps (`MS`, `NA`, `PS`)**: Placing orders attributes sales to them. Logging collection payments updates their own commission performance. Commission sliders are disabled.
> 3. **Shops / Distributors (`AH`, `LB`, `KI`, `SB`, `MF`)**: Customer Self-Service Portal.
>    - Hides the Commission Engine tab.
>    - Restricts dashboard metrics, active orders, and outstanding invoices to show **only** their own shop's data.
>    - Locks the Order Placement Form to their own account.
> 4. **Logistics Drivers (`PP`)**: Logistics Portal.
>    - Filters dispatched fleet routes to show only deliveries assigned to them.
>    - Focuses view on hand-offs and delivery progress.

## Proposed Changes

### Global State Management

#### [MODIFY] [store.tsx](file:///c:/Users/suvin/Documents/ruwan%20brass/front%20end/lib/store.tsx)
- Define a `Profile` type: `{ id: string, name: string, role: string, initials: string, type: 'admin' | 'sales' | 'shop' | 'driver', refId?: string }`.
- Populate `availableProfiles` with:
  - Ruwan W. (Admin)
  - 3 Salespersons (Manoj, Nishan, Priyanga)
  - 5 Shop accounts matching existing distributor database IDs (`c1` through `c5`)
  - Pradeep Perera (Driver)
- Update `addOrder`:
  - If a shop is logged in, use their `refId` as customer ID, and attribute order to `"Customer Self-Service"`.
  - Otherwise, attribute the order to the active salesperson.
- Update `payInvoice` to credit commission to the active salesperson or the invoice's salesperson.

---

### Navigation & Header Bar

#### [MODIFY] [page.tsx](file:///c:/Users/suvin/Documents/ruwan%20brass/front%20end/app/page.tsx)
- Filter sidebar navigation items based on the active profile:
  - Shops and Drivers have no access to the **Commission Engine** tab.
- Update the profile switcher menu to list categories: "Staff Roles", "Customer Accounts (Shops)", and "Logistics".
- Add profile context bindings and handle switching.

---

### Command Center Dashboard

#### [MODIFY] [command-center.tsx](file:///c:/Users/suvin/Documents/ruwan%20brass/front%20end/components/modules/command-center.tsx)
- Filter statistics and graphs to reflect only the active shop's purchase history, outstanding balances, and active invoices if a shop profile is logged in.
- Hide employee CRM leaderboards for shop customer logins.

---

### Sales & Credit Module

#### [MODIFY] [sales-credit.tsx](file:///c:/Users/suvin/Documents/ruwan%20brass/front%20end/components/modules/sales-credit.tsx)
- In the Order Placement form, if a shop is logged in:
  - Force selection of their own customer account and disable the dropdown.
- In the Outstanding Ledger list:
  - Filter to display only the active customer's outstanding invoices.
- In the CRM sub-tab:
  - Filter to display only the logged-in customer's profile intelligence card.

---

### Fleet Logistics & Driver Module

#### [MODIFY] [fleet-logistics.tsx](file:///c:/Users/suvin/Documents/ruwan%20brass/front%20end/components/modules/fleet-logistics.tsx)
- If a driver is logged in:
  - Filter delivery rows to show only routes assigned to them.
- If a shop is logged in:
  - Filter delivery list to show only orders destined for their shop, and hide the driver hand-off OTP console (or display it as a read-only OTP to give to the driver).

---

### Commission Engine Tab

#### [MODIFY] [commission-engine.tsx](file:///c:/Users/suvin/Documents/ruwan%20brass/front%20end/components/modules/commission-engine.tsx)
- Restrict access to administrators and staff. If a customer (shop) tries to access, render an "Access Restricted" gate.
- Disable slider adjustments for salespeople profiles.

## Verification Plan

### Manual Verification
1. Open the profile picker.
2. Select **Apex Hardware Distributors**.
3. Check the **Command Center**: Verify revenue shows only Apex Hardware's stats (LKR 42,500 outstanding, etc.) and that the CRM leaderboard is hidden.
4. Go to **Sales & Credit**: Verify the client dropdown is locked to *Apex Hardware Distributors*.
5. Select **Pradeep Perera (Driver)**: Go to **Fleet Logistics** and verify only his delivery route is shown.
6. Switch back to **Ruwan W.** to verify that full admin capabilities are restored.
