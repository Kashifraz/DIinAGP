# Point of Sale (POS) System - Requirements Document

## 1. System Overview

### 1.1 Purpose
A comprehensive web-based Point of Sale system designed for retail chains with multiple physical stores. The system supports three distinct user roles (Admin, Store Manager, and Cashier) with role-based access control and offline operation capabilities.

### 1.2 Scope
- Multi-store retail management
- Real-time inventory tracking
- Sales transaction processing
- User and store management
- Financial reporting and analytics
- Offline transaction queuing and synchronization

---

## 2. System Architecture

### 2.1 Technology Stack
- **Backend**: PHP CodeIgniter 4.x
- **Frontend**: Vue.js 3.x (SPA)
- **Database**: MySQL 8.x
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API architecture

### 2.2 Architecture Pattern
- **Backend**: MVC (Model-View-Controller) pattern
- **Frontend**: Component-based architecture
- **Communication**: RESTful API with JSON payloads
- **Offline Support**: Service Worker + IndexedDB/LocalStorage

### 2.3 System Components
```
┌─────────────────────────────────────────────────────────┐
│                    Vue.js Frontend                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Admin   │  │ Manager  │  │ Cashier  │              │
│  │  Panel   │  │  Panel   │  │  Panel   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API
┌──────────────────────▼──────────────────────────────────┐
│              CodeIgniter Backend                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Auth     │  │ Business │  │  Data    │              │
│  │ Module   │  │  Logic   │  │  Access  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    MySQL Database                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Users   │  │ Products │  │  Sales   │              │
│  │  Stores  │  │ Inventory│  │ Reports  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 3. User Roles & Permissions

### 3.1 Admin
**Responsibilities:**
- Create and manage stores
- Assign Store Managers and Cashiers to stores
- View all stores and their real-time inventory
- Monitor sales performance across all stores
- Generate business reports (company-wide)
- Full system visibility and control

**Permissions:**
- Full access to all stores
- Create/Edit/Delete stores
- Assign users to stores
- View all reports and analytics
- System configuration access

### 3.2 Store Manager
**Responsibilities:**
- Oversee daily operations at assigned store
- Manage inventory levels
- Handle stock transfers between stores
- View sales reports for their store
- Add new products to the system
- Record and track store expenses
- Override prices and apply special discounts
- Manage product categories and variants

**Permissions:**
- Access limited to assigned store only
- Manage inventory (add, update, adjust)
- Create/Edit products
- View store sales reports
- Record expenses
- Apply discounts and price overrides
- Initiate stock transfers

### 3.3 Cashier
**Responsibilities:**
- Process sales transactions at checkout
- Scan products using barcode scanner
- Handle payments through physical terminals
- Print receipts
- Enter customer information (name, email, phone)
- Manage customer interactions

**Permissions:**
- Access limited to assigned store only
- Process sales transactions
- View product information
- Print receipts
- View own transaction history
- No access to inventory management or reports

---

## 4. Core Modules

### 1 Authentication & Authorization Module

#### 1.1 Authentication
- User login with email/username and password
- Session management
- Logout functionality

---

### 2 Store Management Module

#### 2.1 Store CRUD Operations
- Create new stores (Admin only)
- View store details
- Update store information (name, address, contact)
- Delete stores (with validation)
- List all stores with pagination

#### 2.2 Store Assignment
- Assign one Manager per store
- Assign multiple Cashiers per store
- View store team members
- Reassign managers/cashiers
- Remove users from stores

#### 2.3 Store Information
- Store name, address, phone, email
- Store opening/closing hours
- Store status (active/inactive)
- Store creation date and metadata

---

### 3 User Management Module

#### 3.1 User CRUD Operations
- Create users (Admin only)
- View user profiles
- Update user information
- Deactivate/activate users
- List users with filters (role, store, status)

#### 3.2 User Profile Management
- Personal information (name, email, phone)
- Role assignment
- Store assignment
- Profile picture upload
- Password change functionality

#### 3.3 User Roles
- Admin (system-wide access)
- Store Manager (store-specific access)
- Cashier (transaction-only access)

---

### 4 Product Management Module

#### 4.1 Product CRUD Operations
- Create products (Manager/Admin)
- View product details
- Update product information
- Delete products (soft delete)
- List products with search and filters

#### 4.2 Product Information
- Product name, description
- SKU (Stock Keeping Unit)
- Barcode (auto-generated or manual)
- Base price
- Product image(s)
- Category assignment
- Variant support (size, color, etc.)

#### 4.3 Product Categories
- **User-Manageable Categories**: Store Managers and Admins can create, edit, and delete product categories
- Create category hierarchy (parent-child relationships for nested categories)
- Assign products to categories
- Category-based filtering
- Category management (CRUD operations)
- Categories are not hardcoded - fully customizable by authorized users
- Each category can have a name, description, and optional parent category

#### 4.4 Product Variants
- Support for product variants (size, color, material, etc.)
- Variant-specific pricing
- Variant-specific inventory tracking
- Variant selection in POS

#### 4.5 Barcode Management
- Auto-generate barcodes (EAN-13, UPC, Code 128)
- Manual barcode entry
- Barcode scanning support
- Barcode validation
- Print barcode labels

---

### 5 Inventory Management Module

#### 5.1 Stock Level Management
- Track stock levels per store
- Track stock levels per product variant
- Real-time inventory updates
- Stock adjustment operations
- Stock history tracking

#### 5.2 Stock Operations
- Add stock (receiving)
- Remove stock (damage, return to supplier)
- Adjust stock quantities
- Stock transfer between stores
- Stock audit functionality

#### 5.3 Low Stock Alerts
- Configurable threshold per product
- Alert notifications for low stock
- Alert dashboard for managers

---

### 6 Sales & Transaction Module

#### 6.1 Transaction Processing
- Create new sale transaction
- Add products to cart (scan or manual entry)
- Remove products from cart
- Update quantities
- Calculate subtotal, tax, discounts, total
- Process payment
- Complete transaction

#### 6.2 Product Scanning
- Barcode scanner integration
- Manual product search
- Product lookup by name/SKU
- Quick add to cart

#### 6.3 Customer Information
- Optional customer name entry
- Optional customer email entry
- Optional customer phone entry
- Customer lookup (if exists)
- Create new customer record

#### 6.4 Pricing & Calculations
- Base price retrieval
- Manager price override support
- Discount application (percentage or fixed)
- Tax calculation (configurable tax rates)
- Subtotal calculation
- Total amount calculation

#### 6.5 Receipt Generation
- Generate receipt data
- Format receipt for printing
- Include: cashier name, date/time, products, prices, discounts, taxes, total
- Receipt number/tracking
- Print receipt (browser print API or thermal printer)

#### 6.6 Transaction History
- View transaction list
- Filter by date, cashier, customer
- View transaction details
- Transaction search
- Transaction cancellation/void (with authorization)

---


### 7 Discount Management Module

#### 7.1 Discount Types
- **Percentage discount**: Discount applied as a percentage of the price
- **Fixed amount discount**: Discount applied as a fixed monetary amount
- **Product-specific discount**: Applied to individual products (when `product_id` is set, `category_id` is null)
- **Category-based discount**: Applied to all products in a specific category (when `category_id` is set, `product_id` is null)
- **Store-wide discount**: Applied to all products in a store (when both `product_id` and `category_id` are null, `store_id` is set)
- **Transaction-level discount**: Applied manually at checkout by Manager/Cashier (ad-hoc discounts)

---

### 8 Expense Management Module

#### 8.1 Expense Categories
- Utility bills
- Rent
- Supplier payments
- Employee salaries
- Miscellaneous operational costs

#### 8.2 Expense Recording
- Create expense entry (Manager only)
- Expense date, amount, category
- Expense description/notes
- Receipt attachment (optional)
- Expense approval workflow (optional)

#### 8.3 Expense Reports
- View expenses by store
- Filter by date range, category
- Expense summary reports
- Expense analytics

---

### 9 Stock Transfer Module

#### 9.1 Transfer Operations
- Initiate transfer (Manager)
- Select source store
- Select destination store
- Select products and quantities
- Transfer approval (optional)
- Transfer execution
- Update inventory at both stores

#### 9.2 Transfer Tracking
- Transfer history
- Transfer status (pending, in-transit, completed)
- Transfer reports

---

### 10 Reporting & Analytics Module

#### 10.1 Sales Reports
- Daily sales summary
- Sales by store
- Sales by product
- Sales by category
- Sales by cashier
- Sales trends (charts/graphs)
- Date range filtering

#### 10.2 Inventory Reports
- Stock levels by store
- Stock valuation
- Low stock alerts
- Stock movement reports

#### 10.3 Financial Reports
- Revenue reports
- Expense reports
- Profit/loss statements
- Cash flow reports

#### 10.4 Custom Reports
- Export to CSV/Excel
- Print reports
- Scheduled reports (optional)

---

### 11 Offline Support Module

#### 11.1 Offline Detection
- Network connectivity monitoring
- Online/offline status indicator
- Automatic offline mode activation

#### 11.2 Local Data Storage
- Store transactions in IndexedDB/LocalStorage
- Queue pending transactions
- Store product data locally (cache)
- Store inventory data locally (cache)

---

## 5. Database Schema Overview

### 5.1 Core Tables
- `users` - User accounts and authentication
- `stores` - Store information
- `user_store_assignments` - Many-to-many relationship between users and stores
- `products` - Product master data
- `product_categories` - Product categories
- `product_variants` - Product variants (size, color, etc.)
- `inventory` - Stock levels per store and product variant
- `transactions` - Sales transactions
- `transaction_items` - Items in each transaction
- `payments` - Payment records
- `customers` - Customer information
- `expenses` - Store expenses
- `stock_transfers` - Stock transfer records
- `discounts` - Discount rules and history
- `audit_logs` - System activity logs

### 5.2 Key Relationships
- One Store has one Manager (via user_store_assignments with role)
- One Store has many Cashiers (via user_store_assignments with role)
- One Product has many Variants
- One Product Variant has Inventory per Store
- One Transaction has many Transaction Items
- One Transaction has one Payment
- One Store has many Expenses
- One Store has many Transactions

---

## 6. API Structure

### 6.1 API Endpoint Categories
- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/stores` - Store management
- `/api/products` - Product management
- `/api/inventory` - Inventory management
- `/api/transactions` - Sales transactions
- `/api/payments` - Payment processing
- `/api/expenses` - Expense management
- `/api/transfers` - Stock transfers
- `/api/reports` - Reports and analytics
- `/api/sync` - Offline synchronization

### 6.2 API Standards
- RESTful design principles
- JSON request/response format
- HTTP status codes
- Error handling and messages
- Pagination for list endpoints
- Filtering and sorting support
- API versioning (v1)

---

## 7. Security Requirements

### 7.1 Authentication Security
- Secure password storage (hashing)
- JWT token expiration
- Token refresh mechanism
- Secure token transmission (HTTPS)

### 7.2 Authorization Security
- Role-based access control
- Store-level data isolation
- API endpoint protection
- Frontend route guards

### 7.3 Data Security
- Input validation and sanitization
- SQL injection prevention
- XSS prevention
- CSRF protection
- Sensitive data encryption

### 7.4 Operational Security
- Audit logging
- Activity tracking
- Error logging (without sensitive data)
- Secure file uploads

---

## 8. Non-Functional Requirements

### 8.1 Performance
- API response time < 500ms (average)
- Page load time < 2 seconds
- Support for 100+ concurrent users
- Database query optimization

### 8.2 Scalability
- Support for 50+ stores
- Support for 10,000+ products
- Support for 1M+ transactions
- Horizontal scaling capability

### 8.3 Reliability
- 99.5% uptime target
- Data backup and recovery
- Transaction rollback capability
- Error handling and recovery

### 8.4 Usability
- Intuitive user interface
- Responsive design (desktop, tablet)
- Touch-friendly for tablet POS
- Accessibility compliance (WCAG 2.1 AA)

### 8.5 Compatibility
- Modern browser support (Chrome, Firefox, Safari, Edge)
- Tablet support (iPad, Android tablets)
- Thermal printer compatibility
- Barcode scanner compatibility

---

## 9. Integration Requirements

### 9.1 Hardware Integration
- Barcode scanner (USB/HID)
- Thermal receipt printer
- Payment terminal (optional)
- Cash drawer (optional)

### 9.2 External Services (Optional)
- Payment gateway integration
- Email service (notifications)
- SMS service (notifications)
- Cloud backup service

---

## 10. Future Enhancements (Out of Scope for Initial Release)

- Mobile app (iOS/Android)
- Customer loyalty program
- Advanced analytics and AI insights
- Multi-currency support
- Multi-language support
- Advanced reporting dashboard
- Supplier management
- Purchase order management
- Advanced inventory forecasting

---

## Document Version
- **Version**: 1.0
- **Last Updated**: Initial Version
- **Status**: Draft

