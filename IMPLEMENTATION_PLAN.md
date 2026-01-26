# Inventory Management System - Implementation Plan

**Start Date:** January 26, 2026  
**Status:** IN PROGRESS  
**Target:** Full FIFO batch-based inventory system with unified online + in-shop sales

---

## Phase 1: Database Schema Changes ✅ COMPLETED
### 1.1 Create Product_Batches Table
- [x] Plan: Add `product_batches` table
- [x] File: `backend/db/schema.sql`
- [x] Columns: id, product_id, supplier_id, po_id, batch_number, quantity_received, quantity_remaining, unit_cost, received_date, expiry_date, is_active, created_at, updated_at

### 1.2 Create Stock_Movements Table (Audit Trail)
- [x] File: `backend/db/schema.sql`
- [x] Columns: id, batch_id, product_id, movement_type, quantity, reference_id, reference_type, notes, performed_by, created_at

### 1.3 Create Sales Table (Unified)
- [x] File: `backend/db/schema.sql`
- [x] Columns: id, customer_id, channel, sale_date, subtotal, discount, total_amount, payment_method, payment_status, status, notes, created_by, created_at, updated_at

### 1.4 Create Sale_Items Table
- [x] File: `backend/db/schema.sql`
- [x] Columns: id, sale_id, batch_id, product_id, quantity, unit_price, subtotal, created_at

### 1.5 Modify Purchases Table
- [x] File: `backend/db/schema.sql`
- [x] Added: auto_receive (BOOLEAN DEFAULT TRUE) field

### 1.6 Modify Products Table
- [x] File: Verified existing schema - has stock_quantity field

---

## Phase 2: Backend API Development ✅ COMPLETED
### 2.1 Batch Management APIs
- [x] File: `backend/routes/batches.js`
- [x] File: `backend/controllers/batchController.js`
- [x] File: `backend/services/inventoryService.js`
- [x] Endpoints:
  - GET /api/batches/:product_id - List batches for product
  - GET /api/batches/details/:batch_id - Get batch details
  - GET /api/batches/:batch_id/history - Get batch movement history
  - GET /api/batches/expiring/list - Get expiring batches
  - GET /api/batches/movements/history - Get stock movement audit trail
  - POST /api/batches/:batch_id/return - Return stock to batch
  - PUT /api/batches/:batch_id/deactivate - Deactivate batch

### 2.2 Purchase Order Auto-Receive
- [x] File: `backend/services/purchaseService.js` (UPDATED)
- [x] Modified receiveGoods() to check auto_receive flag
- [x] Auto-receive option: Creates batches automatically on PO received
- [x] Manual receive option: Marks ready for confirmation
- [x] Added confirmReceive() for manual batch creation after verification

### 2.3 Stock Deduction with FIFO
- [x] File: `backend/services/inventoryService.js`
- [x] Function: deductStockFIFO() - Query batches by received_date ASC
- [x] Handles multi-batch deduction when single batch insufficient
- [x] Atomic transaction with rollback on insufficient stock
- [x] Updates product.stock_quantity after batch changes

### 2.4 Sales API (Unified)
- [x] File: `backend/routes/sales.js`
- [x] File: `backend/controllers/salesController.js`
- [x] Endpoints:
  - POST /api/sales - Create sale (online/POS) with FIFO deduction
  - GET /api/sales - List sales with filters
  - GET /api/sales/:id - Get sale details with batch info
  - POST /api/sales/:id/payment - Confirm payment
  - POST /api/sales/:id/return - Process return (refund to batch)
  - POST /api/sales/:id/cancel - Cancel sale
  - GET /api/sales/summary - Sales summary for dashboard

### 2.5 Stock Movements Logging
- [x] File: `backend/services/inventoryService.js`
- [x] Auto-logged on every batch creation, deduction, return
- [x] Includes: batch_id, movement_type, quantity, reference info

### 2.6 Product Quantity Calculation
- [x] File: `backend/services/inventoryService.js`
- [x] Function: updateProductTotalQuantity()
- [x] Calculates SUM(quantity_remaining) from active batches
- [x] Updates products.stock_quantity

### 2.7 Server Integration
- [x] File: `backend/server.js` (UPDATED)
- [x] Registered /api/batches routes
- [x] Registered /api/sales routes

---

## Phase 3: Frontend - In-Shop POS System ✅ COMPLETED
### 3.1 POS Cart Component
- [x] File: `frontend/src/pages/sales/POSSale.jsx` (RESTRUCTURED)
- [x] Search product by name (dropdown)
- [x] Add to cart with quantity
- [x] Real-time stock check
- [x] Edit/remove cart items

### 3.2 POS Checkout
- [x] File: `frontend/src/pages/sales/POSSale.jsx`
- [x] Walk-in customer option (no account required)
- [x] Discount: Apply % or fixed amount (Rs.)
- [x] Payment method selector: Cash / Card / Mobile
- [x] Final total calculation with discount

### 3.3 POS Receipt (Printable)
- [x] File: `frontend/src/components/pos/ReceiptPrint.jsx` (NEW)
- [x] Shop header with contact info
- [x] Receipt number and date/time
- [x] Customer info
- [x] Itemized list with SKU
- [x] Subtotal, Discount, Total (all in Rs.)
- [x] Payment method display
- [x] Thank you message

### 3.4 Batch Display in UI
- [x] File: API integrated to deduct using FIFO automatically
- [x] Backend handles batch selection
- [x] Frontend shows batch info in sale details

---

## Phase 4: Frontend - Sales History & Management ✅ COMPLETED
### 4.1 Sales Dashboard  
- [x] File: `frontend/src/pages/sales/SalesHistory.jsx` (UPDATED)
- [x] Filter: Channel (Online/POS), Date range, Status, Payment Status
- [x] Statistics cards: Total sales, POS sales, Online sales (Rs.)
- [x] Table: Sale ID, Channel, Customer, Date, Items, Total, Payment, Status
- [x] Actions: View details, Print receipt

### 4.2 Sale Details View
- [x] File: `frontend/src/pages/sales/SalesHistory.jsx`
- [x] Sale info with channel badge
- [x] Itemized breakdown with batch info (supplier, batch number)
- [x] Payment details
- [x] Print receipt option

---

## Phase 5: Backend - Auto-Receive Integration
### 5.1 PO Status Change Handler
- [ ] File: `backend/routes/purchaseRoutes.js` (UPDATE)
- [ ] When status changes to 'received':
  - Check `auto_receive` flag
  - If true: Auto-create batches immediately
  - If false: Mark as "pending manual receive", return notification
  - Update receive_date

### 5.2 Manual Receive Confirmation
- [ ] File: `backend/routes/purchaseRoutes.js` (NEW ENDPOINT)
- [ ] `POST /api/purchases/:id/confirm-receive`
  - Input: {items: [{purchase_item_id, quantity_confirmed}]} - allows adjustments
  - Create batches with confirmed quantities
  - Update product quantities
  - Log stock movements

---

## Phase 6: Frontend - Purchase Management UI
### 6.1 Auto vs Manual Receive Option
- [ ] File: `frontend/src/pages/admin/Purchases.jsx` (UPDATE)
- [ ] When creating PO:
  - Add toggle: "Auto receive when PO marked received?" (Default: true)
  - Save as `auto_receive` flag

### 6.2 Receive Confirmation Page
- [ ] File: `frontend/src/pages/admin/ReceiveConfirmation.jsx` (NEW)
- [ ] Show when manual receive needed:
  - List PO items with quantities
  - Allow adjust quantities if actual received differs
  - Show batch numbers to be created
  - Confirm button → creates batches

---

## Phase 7: Testing & Validation
### 7.1 Unit Tests
- [ ] `deductStockFIFO()` - Test FIFO logic with multiple batches
- [ ] `logMovement()` - Verify audit trail created
- [ ] Insufficient stock - Test error handling

### 7.2 Integration Tests
- [ ] Create PO → Mark received → Batches auto-created → Product quantity updated
- [ ] Create sale → Deduct from oldest batch → Stock movements logged
- [ ] Sale return → Stock returned to batch → Quantity restored

### 7.3 UI Tests
- [ ] POS sale flow: Add product → Select batch → Checkout → Print receipt
- [ ] Multiple batches: Same product from 2 suppliers → FIFO deduction works
- [ ] Stock reservation: 2 concurrent sales → No overselling

---

## Phase 8: Deployment & Documentation
### 8.1 Database Migration
- [ ] Run schema.sql updates on production
- [ ] Verify existing data integrity
- [ ] Seed sample batches if needed

### 8.2 API Documentation
- [ ] Update Postman collection with new endpoints
- [ ] Document batch creation, FIFO deduction, sales flow

### 8.3 User Documentation
- [ ] POS system usage guide
- [ ] Auto vs manual receive explanation
- [ ] Stock tracking & audit trail

---

## Key Files to Modify/Create

### Backend
- [x] `backend/db/schema.sql` - NEW tables & modifications
- [x] `backend/routes/batchRoutes.js` - NEW
- [x] `backend/routes/salesRoutes.js` - NEW/UPDATE
- [x] `backend/routes/purchaseRoutes.js` - UPDATE
- [x] `backend/services/inventoryService.js` - NEW
- [x] `backend/models/Batch.js` - NEW
- [x] `backend/models/Sale.js` - NEW
- [x] `backend/models/SaleItem.js` - NEW
- [x] `backend/models/StockMovement.js` - NEW

### Frontend
- [x] `frontend/src/pages/pos/POSSale.jsx` - RESTRUCTURE
- [x] `frontend/src/components/pos/ReceiptPrint.jsx` - NEW
- [x] `frontend/src/pages/admin/Sales.jsx` - NEW
- [x] `frontend/src/pages/admin/SaleDetails.jsx` - NEW
- [x] `frontend/src/pages/admin/Purchases.jsx` - UPDATE (auto-receive toggle)
- [x] `frontend/src/pages/admin/ReceiveConfirmation.jsx` - NEW

---

## Critical Implementation Rules

1. ✅ **FIFO Always**: Every deduction must be sorted by `received_date ASC`
2. ✅ **Atomic Transactions**: Sale creation (batch deduction + sale_items) must all-or-nothing
3. ✅ **Audit Trail**: Every stock change logged in `stock_movements`
4. ✅ **Batch Traceability**: Each sale_item links to exact batch used
5. ✅ **Reserved Stock**: Payment pending = stock still reserved (not available for other orders)
6. ✅ **Error Handling**: Insufficient stock → Rollback + clear error message
7. ✅ **One Product, Multiple Batches**: Don't split product records by supplier
8. ✅ **Base Price**: Use product's base price, not batch-specific pricing

---

## Progress Tracker

- [x] Phase 1: Database Schema ✅ COMPLETED
- [x] Phase 2: Backend APIs ✅ COMPLETED
- [x] Phase 3: POS Frontend ✅ COMPLETED
- [x] Phase 4: Sales History Pages ✅ COMPLETED
- [ ] Phase 5-6: Auto-Receive Feature
- [ ] Phase 7: Testing
- [ ] Phase 8: Deployment

---

**Last Updated:** January 26, 2026 - Phase 4 Complete  
**Next Step:** Phase 5-6 - Auto-Receive Feature Implementation
