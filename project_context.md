# NBR — National VAT & Tax Management System
## Unified Project Context

> **Purpose of this document:** A complete, AI-ready reference for the full-stack **NBR (National Board of Revenue) Tax & VAT Management System** — codenamed **"Nirapod"** — covering both the Angular 13 frontend and the Spring Boot 17 (Java 17) backend. Use this file as the primary context when querying another AI model about this codebase.

---

## 1. Project Overview

The **NBR National VAT & Tax Management System** is a government-facing web application designed to digitize and manage Bangladesh's tax administration workflows. It enables tax officials, auditors, data-entry operators, and taxpayers to:

- Register and manage taxpayers (individuals and companies).
- Issue and manage TIN (Taxpayer Identification Numbers) with PDF certificate generation.
- Register businesses and track their VAT/BIN numbers.
- File and process VAT Returns and Income Tax Returns (with a multi-step approval workflow).
- Record and track payments, refunds, penalties, and audits.
- Manage official notices and document verification.
- Configure tax structures, taxable products, import duties, AIT (Advance Income Tax), and fiscal years.
- Provide a real-time dashboard with summary statistics and charts.

The system is domain-specific to **Bangladesh's National Board of Revenue (NBR)**, uses Bangladeshi administrative geography (Division → District → Tax Zone → Tax Circle), and includes currency in Bangladeshi Taka (৳).

---

## 2. Tech Stack

### Frontend (Angular)

| Concern | Technology |
|---|---|
| Framework | Angular **13.0.x** |
| Language | TypeScript 4.4.x |
| HTTP Client | Angular `HttpClient` |
| Routing | Angular Router (lazy-loaded feature modules) |
| Forms | Reactive Forms (`FormBuilder`, `FormGroup`) + Template-driven (`ngModel`) |
| State Management | `BehaviorSubject` (RxJS) in `AuthService`; no NgRx/Akita |
| Styling | Custom CSS (no Bootstrap/Tailwind — custom `.form-card`, `.page-header` etc.) + Bootstrap Icons (`bi bi-*`) |
| Testing | Jasmine + Karma + Chrome |
| Build Tool | Angular CLI 13.0.3 |
| Package Manager | npm |
| Node Types | `@types/node ^12.11.1` |

### Backend (Spring Boot)

| Concern | Technology |
|---|---|
| Framework | Spring Boot **3.4.4** |
| Language | Java **17** |
| Build Tool | Maven (with `mvnw` wrapper) |
| ORM | Spring Data JPA + Hibernate (mixed: `JpaRepository` for some DAOs, raw `EntityManager` for others) |
| Database | MySQL (database name: `vattax_db_claude`, port `3306`) |
| JDBC Driver | `com.mysql.cj.jdbc.Driver` |
| PDF Generation | **OpenPDF 1.3.30** (`com.github.librepdf`) |
| QR Code | **ZXing 3.5.3** (`com.google.zxing:core` + `javase`) |
| Validation | `spring-boot-starter-validation` |
| Utilities | **Lombok** (used on some models with `@Getter`/`@Setter`) |
| Security | **No Spring Security** — manual token placeholder; CORS configured via `CorsConfig` |
| DDL Strategy | `spring.jpa.hibernate.ddl-auto=update` |

---

## 3. High-Level Architecture

### Connection Map

```
Angular 13 SPA                Spring Boot REST API
(http://localhost:4200)  ──►  (http://localhost:8080)
```

### API Base URL

The entire API is rooted at:

```
http://localhost:8080/api
```

This is defined in the Angular constant file:

```typescript
// src/app/core/constants/api.constants.ts
export const API_BASE_URL = 'http://localhost:8080/api';
```

### Authentication Mechanism

> ⚠️ **Important for AI context:** The system uses a **simplified, non-production authentication** scheme — there is no Spring Security or real JWT library integrated. The implementation is a placeholder.

**How it currently works:**

1. The Angular `LoginComponent` posts `{ email, password }` to `POST /api/auth/login`.
2. The backend (`AuthController`) loads all users from the DB, finds the matching user by email + plain-text password comparison, updates `lastLogin`, and returns a synthetic token: `"token-{userId}-{timestamp}"`.
3. Angular's `AuthService` stores the response in `localStorage` under two keys:
   - `current_user` — serialized `AuthUser` object `{ id, fullName, email, role, token }`.
   - `auth_token` — the raw token string.
4. The `AuthInterceptor` injects the token as `Authorization: Bearer {token}` on every outgoing HTTP request.
5. On a `401` response, the interceptor clears storage and redirects to `/auth/login`.
6. The backend does **not** validate the `Authorization` header on any endpoint — all API endpoints are effectively open.

**Mock Auth (Dev mode):** The frontend has a `environment.useMockAuth` flag. If the real API fails and mock is enabled, the `AuthService` falls back to a local mock user map (e.g., `admin@vattax.gov.bd → SUPER_ADMIN`).

### Data Flow

```
User Action in Angular Component
  → HTTP call via Angular HttpClient (+ AuthInterceptor adds Bearer token)
  → Spring Boot REST Controller (@RestController)
  → Service Layer (@Service)
  → DAO Layer (EntityManager / JpaRepository)
  → MySQL Database
  → JSON Response back through layers
  → Angular Component updates view
```

### CORS Configuration

Configured in `CorsConfig.java`:
- Allowed Origins: `http://localhost:4200`
- Allowed Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Allowed Headers: `*`
- Allow Credentials: `true`

All controllers also carry `@CrossOrigin(origins = "http://localhost:4200")` as a secondary safeguard.

---

## 4. Backend Structure (Spring Boot)

### Application Entry Point

```
com.nirapod.vattax.VatTaxApplication
```
Annotations: `@SpringBootApplication`, `@EnableJpaRepositories(basePackages = "com.nirapod.dao")`, `@ComponentScan(basePackages = "com.nirapod")`, `@EntityScan(basePackages = "com.nirapod")`.

### Package Structure

```
com.nirapod
├── config/          — CORS & Global Exception Handler
├── controller/      — REST Controllers
├── dao/             — Data Access (mixed: plain DAOs with EntityManager + JpaRepository interfaces)
├── dto/             — DTOs (currently only ProductRequest)
├── model/           — JPA Entities
├── services/        — Business Logic Services
└── vattax/          — Application bootstrap
```

### Controllers (all `@RestController`, base path `/api/*`)

| Controller | Base Path | Key Operations |
|---|---|---|
| `AuthController` | `/api/auth` | `POST /login`, `POST /logout`, `GET /profile` |
| `TaxpayerController` | `/api/taxpayers` | CRUD, search (`?search=`), filter by status (`?status=`), `GET /export` (CSV) |
| `TinController` | `/api/tins` | CRUD, `GET /{id}/certificate` (PDF download), `GET /export` (CSV) |
| `BusinessController` | `/api/businesses` | CRUD |
| `VatReturnController` | `/api/vat-returns` | CRUD |
| `IncomeTaxReturnController` | `/api/income-tax-returns` | CRUD, `PATCH /{id}/status` (workflow), `GET /export` (CSV) |
| `PaymentController` | `/api/payments` | CRUD |
| `PenaltyController` | `/api/penalties` | CRUD |
| `RefundController` | `/api/refunds` | CRUD |
| `AuditController` | `/api/audits` | CRUD |
| `NoticeController` | `/api/notices` | CRUD |
| `DocumentController` | `/api/documents` | CRUD |
| `ProductController` | `/api/taxable-products` | CRUD (uses `ProductRequest` DTO) |
| `TaxStructureController` | `/api/tax-structures` | CRUD |
| `UserController` | `/api/users` | CRUD |
| `DashboardController` | `/api/dashboard` | `GET /stats`, `GET /recent-taxpayers`, `GET /recent-payments`, `GET /vat-chart`, `GET /payment-chart` |
| `MasterDataController` | `/api/master` | `GET /divisions`, `GET /divisions/{id}/districts`, `GET /districts`, `GET /taxpayer-types`, `GET /business-types`, `GET /business-categories`, `GET /districts/{id}/tax-zones`, `GET /tax-zones/{id}/tax-circles` |

### Services

| Service | Notes |
|---|---|
| `TaxpayerService` | Soft delete (sets status to "Inactive" instead of hard delete). CSV export. Server-side search across name, NID, TIN, email, phone, trade license. |
| `TinService` | Creates TIN with a two-step save: persists first to get DB-generated ID, then generates TIN number as `"TIN-{9-digit-padded-id}"`. Duplicate prevention per taxpayer. Soft delete (status → "Inactive"). CSV export. Also back-fills `tinNumber` on the associated `Taxpayer` record. |
| `TinCertificateService` | Generates a government-format PDF TIN Certificate using **OpenPDF**. Includes: government logo, watermark (15% opacity), taxpayer details, jurisdiction info, QR code (ZXing), and footer with deputy commissioner signature area. |
| `IncomeTaxReturnService` | Full workflow engine. Valid statuses: `Draft, Submitted, Under Review, Accepted, Rejected, Overdue, Amended, Send Back`. Each status change appends an `ITRAction` to audit history. Duplicate check per TIN + assessment year. Auto-generates `returnNo` as `"ITR-{year}-{8-char-UUID}"`. CSV export with net-tax-payable calculation. |
| `BusinessService` | Standard CRUD wrapping `BusinessDAO`. |
| `ProductService` | Resolves `TaxStructure` from `taxStructureId` in the DTO before saving `Product`. |
| `UserService`, `AuditService`, `PaymentService`, etc. | Thin service wrappers delegating to their respective DAOs. |

### DAO Layer (Data Access)

Two patterns coexist:

**Pattern A — Plain DAO with `EntityManager` (JPQL):**
Used by: `TaxpayerDAO`, `BusinessDAO`, `ProductDAO`, `TaxStructureDAO`, `AuditDAO`, `PaymentDAO`, `PenaltyDAO`, `RefundDAO`, `NoticeDAO`, `DocumentDAO`, `VatReturnDAO`, `UserDAO`.

```java
@PersistenceContext
private EntityManager entityManager;

public List<Taxpayer> getAll() {
    return entityManager.createQuery("from taxpayer", Taxpayer.class).getResultList();
}
```

**Pattern B — Spring Data `JpaRepository`:**
Used by: `TinDAO`, `IncomeTaxReturnDAO`, `DivisionDAO`, `DistrictDAO`, `TaxpayerTypeDAO`, `BusinessTypeDAO`, `BusinessCategoryDAO`, `TaxZoneDAO`, `TaxCircleDAO`.

```java
public interface TinDAO extends JpaRepository<Tin, Long> {
    Tin findByTinNumber(String tinNumber);
    Optional<Tin> findByTaxpayerId(Long taxpayerId);
}
```

### Database Entities (JPA Models)

| Entity | Table | Key Fields |
|---|---|---|
| `Taxpayer` | `taxpayers` | `id`, `tinNumber` (unique), `taxpayerType` (FK), `fullName`, `nid`, `companyName`, `email`, `phone`, `presentAddress` (embedded), `permanentAddress` (embedded), `status`, `businesses` (OneToMany) |
| `Tin` | `tins` | `id`, `tinNumber` (unique), `taxpayerId` (FK, Long), `taxpayerName`, `tinCategory`, `taxZone`, `taxCircle`, `status`, `issuedDate` |
| `Business` | `businesses` | `id`, `businessRegNo` (UUID-based), `businessName`, `binNo`, `taxpayer` (ManyToOne), `businessType` (ManyToOne), `businessCategory` (ManyToOne), `division` (ManyToOne), `district` (ManyToOne), `annualTurnover`, `status` |
| `VatReturn` | `vat_returns` | `id`, `returnNo`, `binNo`, `tinNumber`, `businessName`, `periodMonth`, `periodYear`, `taxableSupplies`, `exemptSupplies`, `outputTax`, `inputTax`, `netTaxPayable` (auto-calculated in `@PrePersist`), `status` |
| `IncomeTaxReturn` | `income_tax_returns` | `id`, `returnNo`, `tinNumber`, `taxpayerName`, `itrCategory`, `assessmentYear`, `incomeYear`, `grossIncome`, `exemptIncome`, `taxRate`, `grossTax`, `taxRebate`, `advanceTaxPaid`, `withholdingTax`, `taxPaid`, `status`, `isDeleted` (soft delete), `taxpayer` (ManyToOne), `actionHistory` (OneToMany → `ITRAction`) |
| `ITRAction` | `itr_action_history` | `id`, `action`, `status`, `remarks`, `performedBy`, `role`, `timestamp`, `incomeTaxReturn` (ManyToOne) |
| `Payment` | `payments` | `id`, `transactionId` (auto: `TXN-{timestamp}`), `tinNumber`, `amount`, `paymentType`, `paymentMethod`, `bankName`, `status` |
| `Penalty` | `penalties` | `id`, `penaltyNo` (auto: `PEN-{timestamp}`), `penaltyAmount`, `interestAmount`, `totalAmount` (auto-calculated in `@PrePersist`), `paidAmount`, `status` |
| `Refund` | `refunds` | `id`, `refundNo`, `claimAmount`, `approvedAmount`, `paidAmount`, `status` |
| `Audit` | `audits` | `id`, `auditNo`, `tinNumber`, `auditType`, `priority`, `scheduledDate`, `assignedTo`, `auditFindings`, `taxDemand`, `penaltyRecommended`, `status` |
| `Notice` | `notices` | `id`, `noticeNo`, `subject`, `body`, `noticeType`, `priority`, `targetType`, `tinNumber`, `status` |
| `Document` | `documents` | `id`, `documentNo`, `documentType`, `documentCategory`, `documentTitle`, `tinNumber`, `status` |
| `TaxStructure` | `tax_structures` | `id`, `taxCode` (unique), `taxName` (unique), `taxType`, `rate`, `applicableTo`, `effectiveDate`, `expiryDate`, `status` |
| `Product` | `products` | `id`, `productCode`, `productName`, `hsCode` (unique), `category`, `taxType`, `taxStructure` (ManyToOne), `taxRate`, `unit`, `status` |
| `User` | `users` | `id`, `fullName`, `email` (unique), `password` (plain text), `role`, `department`, `status`, `lastLogin` |
| `Division` | `divisions` | `id`, `name`, `districts` (OneToMany) |
| `District` | `districts` | `id`, `name`, `division` (ManyToOne) |
| `TaxZone` | `tax_zones` | `id`, `name`, `district` (ManyToOne), `taxCircles` (OneToMany) |
| `TaxCircle` | `tax_circles` | `id`, `name`, `taxZone` (ManyToOne) |
| `TaxpayerType` | `taxpayer_types` | `id`, `typeName`, `category` |
| `BusinessType` | `business_types` | `id`, `typeName` |
| `BusinessCategory` | `business_categories` | `id`, `categoryName` |
| `Address` | _(embedded)_ | `division`, `district`, `thana`, `roadVillage` |

### Security & Configuration

- `CorsConfig.java` — Global CORS mapping.
- `GlobalExceptionHandler.java` — `@RestControllerAdvice` catching `IllegalStateException` (409 Conflict, e.g. duplicate TIN) and `IllegalArgumentException` (400 Bad Request, e.g. missing taxpayerId).
- `application.properties`:
  - DB URL: `jdbc:mysql://localhost:3306/vattax_db_claude`
  - Username/Password: `root` / `root`
  - DDL auto: `update`
  - SQL logging: `spring.jpa.show-sql=true`

---

## 5. Frontend Structure (Angular 13)

### Project Name & App Title

- npm package name: `nirapod`
- `AppComponent.title` = `'National VAT & Tax Management System'`

### Directory Layout

```
src/app/
├── app.module.ts               — Root module
├── app-routing.module.ts       — Root router (lazy-loaded feature routes)
├── app.component.{ts,html,css} — Root shell (<router-outlet> + <app-toast>)
│
├── core/
│   ├── constants/
│   │   ├── api.constants.ts    — All API_ENDPOINTS (single source of truth)
│   │   └── roles.constants.ts  — Role enum, ROLE_PERMISSIONS, ROLE_ACTIONS, ROLE_MENU
│   ├── directives/
│   │   └── has-role.directive.ts — *hasRole and *canDo structural directives
│   ├── guards/
│   │   └── auth.guard.ts       — CanActivate + CanActivateChild route guard
│   ├── interceptors/
│   │   └── auth.interceptor.ts — Attaches Bearer token; handles 401
│   └── services/
│       ├── auth.service.ts     — Login/logout, currentUser$ BehaviorSubject
│       ├── base-api.service.ts — Generic HTTP wrapper (get/post/put/delete)
│       └── master-data.service.ts — Loads divisions, districts, taxpayer types, etc.
│
├── layout/
│   ├── main-layout/            — MainLayoutComponent (shell for authenticated pages)
│   ├── sidebar/                — SidebarComponent (role-driven menu)
│   ├── topbar/                 — TopbarComponent
│   ├── footer/                 — FooterComponent
│   └── breadcrumbs/            — BreadcrumbsComponent
│
├── shared/
│   └── shared.module.ts        — Shared components (ToastService, toast component, etc.)
│
├── models/                     — TypeScript interfaces (Taxpayer, Tin, VatReturn, etc.)
│
└── features/
    ├── auth/                   — LoginComponent
    ├── dashboard/              — DashboardHomeComponent, DashboardService
    ├── taxpayer-management/    — Lazy module
    ├── business-registration/  — Lazy module
    ├── tin-management/         — Lazy module
    ├── vat-registration/       — Lazy module
    ├── vat-returns/            — Lazy module
    ├── income-tax-returns/     — Lazy module
    ├── payments/               — Lazy module
    ├── refund-management/      — Lazy module
    ├── penalty-fines/          — Lazy module
    ├── audit-management/       — Lazy module
    ├── document-verification/  — Lazy module
    ├── notices-notifications/  — Lazy module
    ├── tax-structure/          — Lazy module
    ├── taxable-products/       — Lazy module
    ├── import-duty/            — Lazy module
    ├── ait/                    — Lazy module (Advance Income Tax)
    ├── fiscal-years/           — Lazy module
    ├── reports-analytics/      — Lazy module (role-restricted)
    ├── user-management/        — Lazy module (SUPER_ADMIN only)
    ├── roles/                  — Lazy module (SUPER_ADMIN only)
    ├── activity-logs/          — Lazy module (SUPER_ADMIN + TAX_COMMISSIONER)
    └── system-settings/        — Lazy module (SUPER_ADMIN only)
```

### Routing Setup

The root `AppRoutingModule` defines two zones:

1. **Public:** `auth/login` → `LoginComponent`
2. **Protected:** All other routes are nested under `MainLayoutComponent`, guarded by `AuthGuard` (`canActivate` + `canActivateChild`).

All feature modules are **lazy-loaded** via `loadChildren()`. The wildcard `**` redirects to `/auth/login`.

### Key Core Services

**`AuthService`** (`providedIn: 'root'`)

```typescript
interface AuthUser { id, fullName, email, role: Role, token? }
```

- `login(credentials)` → calls `POST /api/auth/login`, stores result in localStorage.
- `logout()` → clears localStorage, navigates to `/auth/login`.
- `currentUser$` → `BehaviorSubject<AuthUser | null>` (reactive).
- `hasPermission(module)`, `canDo(action)`, `canSeeMenu(label)` → role-based checks using `ROLE_PERMISSIONS`, `ROLE_ACTIONS`, `ROLE_MENU` maps.

**`BaseApiService`** (`providedIn: 'root'`)

Generic HTTP wrapper exposing `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`. Feature services typically extend or inject this. Also has `downloadTinCertificate(tinId)` returning `Observable<Blob>`.

**`MasterDataService`** (extends `BaseApiService`)

Fetches dropdown/reference data: `getDivisions()`, `getDistrictsByDivision()`, `getTaxpayerTypes()`, `getBusinessTypes()`, `getBusinessCategories()`, `getTaxZonesByDistrict()`, `getTaxCirclesByZone()`, `getActiveTaxpayers()`. All calls use `catchError(() => of([]))` — graceful fallback to empty arrays.

**`AuthInterceptor`**

Reads `auth_token` from localStorage and injects `Authorization: Bearer {token}` header on every request. On `401`, removes token and redirects to login.

**`AuthGuard`**

Implements `CanActivate` and `CanActivateChild`. Checks `authService.isLoggedIn`. Also reads `data.roles` from route data (deepest match wins) and verifies role; `SUPER_ADMIN` bypasses all role restrictions.

### Role System

Defined in `roles.constants.ts`:

```typescript
enum Role {
  SUPER_ADMIN, TAX_COMMISSIONER, TAX_OFFICER,
  AUDITOR, TAXPAYER, DATA_ENTRY_OPERATOR, GUEST
}
```

Three permission maps:
- `ROLE_PERMISSIONS` — Which modules each role can access.
- `ROLE_ACTIONS` — Which CRUD actions each role can perform (used by `*canDo` directive).
- `ROLE_MENU` — Which sidebar menu items each role sees.

### Structural Directives (Custom)

- `*hasRole="['SUPER_ADMIN', 'TAX_OFFICER']"` — Shows element only if user has the given role(s).
- `*canDo="'create'"` — Shows element only if the user's role has the given action permission.

### Component Pattern

Each feature follows the standard pattern:
- `feature-list` — Table/list view with search, filter, and action buttons.
- `feature-create` — Form to create a new record.
- `feature-edit` — Pre-filled form to update an existing record.
- `feature-view` — Read-only detail view.

Components generally use:
- `OnInit` / `OnDestroy` with `Subject` + `takeUntil` for clean RxJS unsubscription.
- `finalize()` to stop loading spinners.
- `ToastService` for user notifications.
- `HttpClient` (often injected directly) or a feature-specific service for API calls.

### State Management

There is **no NgRx, Akita, or other state library**. State is managed at the component level via local properties. The only shared reactive state is `AuthService.currentUser$` (a `BehaviorSubject`). Master data (divisions, districts, etc.) is fetched on-demand per component via `MasterDataService`.

---

## 6. Core Integrations & Business Logic

### TIN Generation Algorithm

```java
// TinService.java
tin.setTinNumber("PENDING");
Tin savedTin = tinDAO.saveAndFlush(tin);       // get the DB auto-increment ID
String generatedTin = "TIN-" + String.format("%09d", savedTin.getId());
savedTin.setTinNumber(generatedTin);
tinDAO.save(savedTin);
// Also back-fills the tinNumber on the Taxpayer record
taxpayer.setTinNumber(generatedTin);
taxpayerDAO.update(taxpayer);
```

TIN format: `TIN-000000001`, `TIN-000000042`, etc.

### Income Tax Return Workflow

Status transitions managed by `IncomeTaxReturnService.updateStatus()`:

```
Draft → Submitted → Under Review → Accepted
                               └→ Rejected
                               └→ Send Back → (re-submission loop)
                    Overdue (admin-set)
                    Amended
```

Each transition creates an `ITRAction` audit record with `action`, `status`, `remarks`, `performedBy`, `role`, and `timestamp`. The `IncomeTaxReturnDAO` uses:
- `existsByTinNumberAndAssessmentYearAndIsDeletedFalse()` — Prevents duplicate returns.
- `findByIsDeletedFalse()` — Always filters out soft-deleted records.

### TIN Certificate PDF Generation (`TinCertificateService`)

Uses **OpenPDF** (fork of iText 2.x):
1. Creates A4 document with border (50pt margins).
2. Renders a watermark image (15% opacity) from `src/main/resources/images/watermark.png`.
3. Renders government logo from `src/main/resources/images/govt_logo.png`.
4. Prints official header: "Government of the People's Republic of Bangladesh / National Board of Revenue".
5. Prints taxpayer particulars.
6. Generates a QR code (ZXing) encoding `TIN: {number}\nName: {name}`.
7. Adds a 3-column footer table: notes | deputy commissioner signature | QR code image.
8. Appends system-generated certificate disclaimer.

### Dashboard Statistics

`DashboardController` aggregates data at query time by calling all services and computing in-memory:
- `totalRevenue` — Sum of all `Payment` amounts where `status = "Completed"`.
- `pendingAudits` — Count of audits with status `"Scheduled"` or `"In Progress"`.
- `pendingRefunds` — Count of refunds with status `"Pending"`.
- VAT chart data — Count of `VatReturn` records grouped by `periodMonth`.
- Recent 5 taxpayers / payments (reverse-order slice from in-memory list).

> **Note:** Some growth metrics (`taxpayerGrowth`, `revenueGrowth`, etc.) are currently hardcoded static values (e.g., `5.2`, `8.7`).

### Server-Side Taxpayer Search (`TaxpayerDAO.search()`)

```sql
FROM taxpayer t WHERE
    lower(t.fullName)       LIKE :q OR
    lower(t.companyName)    LIKE :q OR
    lower(t.nid)            LIKE :q OR
    lower(t.tinNumber)      LIKE :q OR
    lower(t.email)          LIKE :q OR
    lower(t.phone)          LIKE :q OR
    lower(t.tradeLicenseNo) LIKE :q OR
    lower(t.rjscNo)         LIKE :q
```

Exposed via `GET /api/taxpayers?search={query}`.

### VAT Return Tax Calculation

Auto-computed in `VatReturn.@PrePersist`:
```java
totalSupplies = taxableSupplies + exemptSupplies + zeroRatedSupplies;
netTaxPayable = outputTax - inputTax;
```

### AIT (Advance Income Tax) Feature

The AIT module on the frontend allows recording tax deducted at source. The form integrates:
- Taxpayer selection (from active taxpayer list).
- Source type → filters available `TaxStructure` records → auto-populates the AIT rate.
- Live calculation preview: `aitAmount = grossAmount × (aitRate / 100)`.
- Deduction metadata: deducted-by entity, date, fiscal year.

> **Note:** AIT has a frontend UI (`/ait`) and uses `GET/POST /api/ait` endpoints, but no dedicated backend `AitController` or `AitDAO` was found in the provided backend context file. This feature may be stored to a different table or is partially implemented.

### Activity Logs

The Activity Logs page (`/activity-logs`) currently uses **hardcoded fallback data** (12 sample log entries). There is no backend `ActivityLog` entity or controller — this feature is frontend-only at present.

### Import Duty, Fiscal Years, VAT Registration

These feature modules have frontend UIs (list/create/edit/view pages), but their corresponding backend controllers were not present in the backend context file. They may be in a separate backend project or not yet implemented.

### CSV Export

Three entities support CSV export with an `Authorization: Bearer` header:
- `GET /api/taxpayers/export` → `taxpayer_list.csv`
- `GET /api/tins/export` → `tin_list.csv`
- `GET /api/income-tax-returns/export` → `income_tax_returns.csv`

---

## 7. How to Run

### Prerequisites

- **Java 17** (JDK)
- **Maven 3.9+** (or use `./mvnw`)
- **Node.js** (LTS, recommended v16+) + **npm**
- **Angular CLI 13**: `npm install -g @angular/cli@13`
- **MySQL 8+** running locally on port `3306`

### Database Setup

Create the database before starting the backend:
```sql
CREATE DATABASE vattax_db_claude CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Default credentials: `root` / `root`. Hibernate will auto-create tables on first run (`ddl-auto=update`).

### Running the Backend (Spring Boot)

```bash
# From the backend project root directory:

# Option 1: Using Maven Wrapper (recommended)
./mvnw spring-boot:run

# Option 2: Using system Maven
mvn spring-boot:run

# Option 3: Build JAR and run
./mvnw clean package -DskipTests
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

The backend starts on **`http://localhost:8080`**.

### Running the Frontend (Angular)

```bash
# From the frontend project root directory (where package.json is):

# Install dependencies (first time only)
npm install

# Start the development server
ng serve
# or
npm start
```

The Angular app is served at **`http://localhost:4200`** with hot-reload enabled.

### Default Login Credentials (Mock / Dev)

If `environment.useMockAuth = true` in the Angular environment file, these mock users are available even if the backend is down:

| Email | Role | Password |
|---|---|---|
| `admin@vattax.gov.bd` | `SUPER_ADMIN` | _(any)_ |
| `commissioner@vattax.gov.bd` | `TAX_COMMISSIONER` | _(any)_ |
| `officer@vattax.gov.bd` | `TAX_OFFICER` | _(any)_ |
| `auditor@vattax.gov.bd` | `AUDITOR` | _(any)_ |
| `operator@vattax.gov.bd` | `DATA_ENTRY_OPERATOR` | _(any)_ |
| `taxpayer@example.com` | `TAXPAYER` | _(any)_ |

For real API login, the `User` records must exist in the `users` table with plain-text passwords.

---

## 8. Known Limitations & Technical Debt

| Area | Issue |
|---|---|
| **Authentication** | No real JWT or Spring Security. Passwords are stored and compared in plain text. The Bearer token is a timestamp string with no server-side validation. |
| **Soft Delete Inconsistency** | `Taxpayer` uses status → `"Inactive"`. `IncomeTaxReturn` uses `isDeleted = true`. `Tin` uses status → `"Inactive"`. `TaxpayerDAO.delete()` marks inactive but `TinService.deleteTin()` also marks inactive. No unified soft-delete strategy. |
| **Mixed DAO Patterns** | Some entities use `EntityManager` directly; others use `JpaRepository`. No consistent strategy. |
| **Dashboard Growth Metrics** | Hardcoded static percentages (e.g., `taxpayerGrowth: 5.2`). |
| **Activity Logs** | Frontend-only with hardcoded sample data. No backend persistence. |
| **AIT Backend** | No `AitController` found in backend context. Frontend references `GET/POST /api/ait`. |
| **No Pagination** | All list endpoints return full datasets. No server-side pagination. |
| **No Input Sanitization** | No SQL injection protection beyond JPA parameterization; no XSS guards on the frontend. |
| **Error Handling** | `GlobalExceptionHandler` only covers `IllegalStateException` and `IllegalArgumentException`. Other runtime exceptions are unhandled. |

---

*Document generated from Repomix context files. Last analyzed: Spring Boot `3.4.4` / Angular `13.0.x`.*
