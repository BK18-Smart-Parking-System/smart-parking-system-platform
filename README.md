# 🚗 BK18 Smart Parking System Platform
> **Smart Parking Management System** integrating Automated License Plate Recognition (OCR), RFID Card Scanning, IoT Parking Slot Sensors, and PayOS Online Payment Gateway.

---

## 📌 Project Overview

**BK18 Smart Parking System** is an end-to-end solution designed to automate and streamline parking operations for universities, residential buildings, and commercial complexes. The platform delivers real-time vehicle flow monitoring, flexible dynamic pricing per user role (Student, Faculty/Staff, Guest), IoT slot occupancy tracking, and QR-based automated payments via PayOS.

---

## 🌟 Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- Secure **JWT-based authentication** (Access Token & HttpOnly Refresh Token).
- Granular permission levels:
  - `ADMIN`: Full system configuration, dynamic pricing policies, zone management, and user permissions.
  - `OPERATOR`: Entry/exit barrier control, incident resolution, and guest card provisioning.
  - `STUDENT` & `STAFF`: Personal parking history lookup, outstanding debt management, and direct online QR checkout.
  - `GUEST`: Temporary visitors using guest cards with on-premise cash payment.

### 2. Entry & Exit Flow Automation
- **RFID Card Scanning & OCR License Plate Recognition**: Cross-validates vehicle snapshots and license plates upon entry/exit to prevent vehicle theft or mismatch.
- **Automated Barrier Control & Slot Assignment**: Tracks check-in timestamps, assigns parking slots, and triggers barrier operations.
- **Anomaly Detection**: Flags mismatched license plates, locked RFID cards, or anomalous sessions.

### 3. Zone & IoT Slot Management
- **Parking Zones (`ParkingZone`)**: Monitors overall capacity, current occupancy, and role-based access restrictions.
- **Real-Time IoT Slots (`ParkingSlot`)**: Live status updates for individual spaces: `EMPTY`, `OCCUPIED`, `MAINTENANCE`, or `UNKNOWN` (sensor disconnected).

### 4. Dynamic Pricing Rules Engine
- Flexible pricing rules configured per user role (`PricingPolicy`):
  - Base fee (`basePrice`), hourly rate (`pricePerHour`), and daily cap (`maxDailyPrice`).
  - Billing cycles: Pay-per-session (`PAY_NOW`), Monthly billing (`MONTHLY`), or Free (`FREE`).

### 5. PayOS Online Payment Integration
- Automated banking QR code generation powered by **PayOS**.
- Real-time transaction reconciliation via Webhooks and Polling.
- Periodic debt tracking and bulk settlement for student and faculty monthly cycles.

### 6. Dashboard, Analytics & PDF Reporting
- **Admin & Operator Dashboard**: Visual insights into revenue trends, peak-hour entry/exit volume, and slot utilization rates.
- **Student Dashboard**: Card details, recent sessions, unpaid balances, and instant online checkout.
- **PDF Report Generation**: Export transaction receipts, invoices, and activity logs to standard PDF format (jsPDF).

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Client / Frontend - Next.js 16] -->|REST API & JWT| B[Backend API - NestJS 11]
    B -->|Prisma ORM| C[(PostgreSQL Database)]
    B -->|QR Generation & Webhook| D[PayOS Payment Gateway]
    E[IoT Sensors / Barrier Gates / RFID Readers / OCR Cameras] -->|Hardware Integration| B
```

---

## 🛠️ Tech Stack

### 🔹 Backend (`/be`)
- **Framework**: [NestJS 11](https://nestjs.com/) (TypeScript)
- **Database ORM**: [Prisma ORM 7](https://www.prisma.io/) with PostgreSQL Adapter (`@prisma/adapter-pg`)
- **Authentication**: Passport.js, JWT, Bcrypt
- **Payment Gateway**: `@payos/node` (PayOS SDK)
- **Validation**: `class-validator`, `class-transformer`

### 🔹 Frontend (`/fe`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling & UI**: [Tailwind CSS 4](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons
- **Data Visualization**: Recharts
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **Notifications**: Sonner, React Hot Toast

---

## 📁 Directory Structure

```plaintext
ParkingSystem/
├── be/                          # Backend Source Code (NestJS)
│   ├── prisma/                  # Prisma schema, migrations, and seed scripts
│   │   ├── schema.prisma        # Database entity models
│   │   ├── seed.ts              # Master database seeding script
│   │   ├── seed-users.ts        # Default user seed
│   │   └── seed-rfid-cards.ts   # RFID card seed
│   ├── src/
│   │   ├── auth/                # Authentication, JWT, and Guards
│   │   ├── dashboard/           # Admin/Operator analytics & metrics
│   │   ├── guest-card/          # Temporary guest card management
│   │   ├── parking/             # Check-in/Check-out, Zones, and Slots logic
│   │   ├── prisma/              # Prisma client integration service
│   │   ├── settings/            # System settings & Pricing policy rules
│   │   ├── student-dashboard/   # Student portal & PayOS integration
│   │   ├── users/               # User management & permission assignment
│   │   ├── app.module.ts        # Root NestJS application module
│   │   └── main.ts              # Backend entry point
│   └── package.json
│
├── fe/                          # Frontend Source Code (Next.js)
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── app/                 # Next.js App Router (Layout & Pages)
│   │   ├── components/          # Feature components
│   │   │   ├── Dashboard.tsx    # Operational metrics dashboard
│   │   │   ├── EntryExit.tsx    # Gate operations & card reader simulation
│   │   │   ├── ParkingSlots.tsx # Interactive parking lot slot map
│   │   │   ├── Payment.tsx      # Payment management & cash register
│   │   │   ├── History.tsx      # Parking session logs & history
│   │   │   ├── Reports.tsx      # Revenue reporting & PDF export
│   │   │   ├── Permissions.tsx  # User role & permission management
│   │   │   ├── Settings.tsx     # Pricing policy configuration
│   │   │   └── StudentDashboard.tsx # Student self-service portal
│   │   ├── contexts/            # Global context state (e.g., RoleContext)
│   │   ├── lib/                 # Utilities and token storage helpers
│   │   └── styles/              # Global styles
│   └── package.json
│
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js**: `>= 18.x` (Node.js 20+ recommended)
- **Package Manager**: `pnpm` (recommended) or `npm`
- **Database**: PostgreSQL (v14+)

---

### 1️⃣ Backend Setup (`/be`)

1. **Navigate to the backend directory**:
   ```bash
   cd be
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `be/` directory:
   ```env
   PORT=8080
   FRONTEND_URL=http://localhost:3000

   # Database Connection (PostgreSQL)
   DATABASE_URL="postgresql://postgres:password@localhost:5432/parking_db?schema=public"

   # JWT Configuration
   JWT_ACCESS_SECRET="your-jwt-access-secret-key"
   JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"

   # PayOS Payment Gateway Configuration
   PAYOS_CLIENT_ID="your_payos_client_id"
   PAYOS_API_KEY="your_payos_api_key"
   PAYOS_CHECKSUM_KEY="your_payos_checksum_key"
   PAYOS_RETURN_URL="http://localhost:3000/?payment_status=success"
   PAYOS_CANCEL_URL="http://localhost:3000/?payment_status=cancel"
   ```

4. **Synchronize Database & Seed Initial Data**:
   ```bash
   # Push schema to database
   npx prisma db push

   # Run data seed scripts
   pnpm prisma db seed
   ```

5. **Start Backend Server**:
   ```bash
   # Development mode with hot-reloading
   pnpm dev
   ```
   The backend API will run at `http://localhost:8080` (API endpoint prefix: `http://localhost:8080/api`).

---

### 2️⃣ Frontend Setup (`/fe`)

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd fe
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the `fe/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. **Start Frontend Development Server**:
   ```bash
   pnpm dev
   ```
   Access the web application at: `http://localhost:3000`.

---

## 🔑 Demo Accounts

After running the database seeding command, you can use these accounts to sign in:

| Role | Username | Password | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `123456` | Full administrative control, system settings, pricing policies, user permissions |
| **Operator** | `operator` | `123456` | Gate management (check-in/check-out), guest cards, live slot monitoring |
| **Student** | `student` | `123456` | View parking history, outstanding debt, and PayOS online QR payment |

---

## 📡 Core API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | `POST` | User login (returns access token & refresh cookie) |
| | `/api/auth/register` | `POST` | User registration |
| | `/api/auth/refresh` | `POST` | Refresh access token using HttpOnly cookie |
| | `/api/auth/logout` | `POST` | Terminate session & clear cookies |
| **Parking Flow** | `/api/parking/check-in` | `POST` | Check-in vehicle with RFID & OCR license plate |
| | `/api/parking/check-out` | `POST` | Check-out vehicle, verify plate, calculate fee |
| | `/api/parking/zones` | `GET` | Retrieve list of parking zones & capacity |
| | `/api/parking/slots` | `GET` | Real-time status of IoT parking slots |
| **Student & PayOS** | `/api/student-dashboard/profile` | `GET` | Retrieve student profile & debt amount |
| | `/api/student-dashboard/create-payment-link` | `POST` | Generate PayOS QR payment checkout link |
| **Settings** | `/api/settings/pricing-policies` | `GET` / `POST` | Retrieve and update dynamic pricing policies |
| **Dashboard & Reports** | `/api/dashboard/stats` | `GET` | System operational metrics and revenue analytics |

---

## 📝 License & Contributing

Developed for the **Smart Parking System Platform**. Contributions, bug reports, and feature requests are welcome via GitHub issues and pull requests.
