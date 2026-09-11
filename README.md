# FieldFlow

FieldFlow is a full-stack Field Service Management System developed during an eight-week internship project. The application supports customer management, technician management, Work Order dispatching, technician job execution, operational history, and organization-level dashboard reporting.

FieldFlow implements a complete service workflow from Dispatcher creation and assignment through Technician progress and completion.

## Production Application

FieldFlow is deployed as a production web service on Render:

https://fieldflow-74vq.onrender.com

Render was used as a mentor-approved production host after Vercel phone verification did not support Sri Lanka/+94 during account verification.

The production deployment uses:

- Render Web Service
- Node.js 22
- Next.js production server
- Neon PostgreSQL
- Prisma
- Better Auth

All production records used for demonstration and testing are fictional.

## Core Workflow

The mandatory FieldFlow workflow is:

1. A Dispatcher creates a Work Order.
2. The Dispatcher selects a Customer.
3. The Dispatcher assigns a Technician and optional schedule.
4. The Technician views the assigned Work Order through My Jobs.
5. The Technician starts work.
6. The Technician records progress notes.
7. The Technician enters required completion notes.
8. The Technician completes the Work Order.
9. The Work Order history records each update with its author and timestamp.
10. Dashboard statistics and recent activity reflect the saved Work Order data.

## Features

### Authentication

- Email and password sign-in
- Secure sign-out
- Database-backed sessions
- Protected authenticated routes
- Role-aware post-login redirects
- Generic invalid-credential messages
- Server-side session verification

### Role-Based Access Control

FieldFlow supports three roles:

- Administrator
- Dispatcher
- Technician

Authorization is enforced on the server. Navigation visibility is provided for usability but is not treated as the security boundary.

### Customer Management

Administrators and Dispatchers can:

- Create Customers
- View Customer details
- Edit Customer details
- Search by name, email, phone, or city
- Store contact and service-address information

### Technician Management

Administrators and Dispatchers can:

- Create Technician profiles linked to Technician user accounts
- View Technician profile details
- Edit skills
- Edit availability
- Search Technicians by name, email, or skill
- Filter Technicians by availability
- View assigned Work Order counts
- View recent assigned work

A linked Technician account cannot be changed after profile creation.

### Work Order Management

Administrators and Dispatchers can:

- Create Work Orders
- View Work Order details
- Edit eligible Work Orders
- Assign a Technician
- Select a Customer
- Set priority
- Add optional schedule dates
- Search Work Orders
- Filter by status
- Filter by priority
- Filter by Customer
- Filter by Technician
- Cancel eligible Work Orders
- View completion information
- View complete operational history

General editing is blocked when a Work Order is:

- In progress
- Completed
- Cancelled

### Technician My Jobs

Technicians can:

- View only Work Orders assigned to their own Technician profile
- View assigned and in-progress jobs
- View Customer service information required for field work
- View priority and schedule information
- Start an assigned Work Order
- Add progress notes to an in-progress Work Order
- Complete an in-progress Work Order
- View timestamped job history

Technicians cannot use My Jobs to access:

- Unassigned Work Orders
- Another Technician’s Work Orders
- Completed Work Orders through the active list
- Cancelled Work Orders through the active list

### Dashboard

Administrators and Dispatchers can view:

- Total Work Order count
- Unassigned Work Order count
- Assigned Work Order count
- In-progress Work Order count
- Completed Work Order count
- Cancelled Work Order count
- Available Technician count
- Busy Technician count
- Unavailable Technician count
- Recently updated Work Orders
- Operational quick links

Technicians cannot access organization-wide Dashboard information.

### Operational History

FieldFlow records Work Order activity including:

- Work Order creation
- Assignment status
- Start Work transition
- Progress notes
- Completion transition
- Cancellation transition
- Previous status
- New status
- Update author
- Update timestamp
- Operational note

## Business Rules

The server enforces the following rules:

- Only an Administrator or Dispatcher can create or assign Work Orders.
- A Dispatcher cannot manage user accounts.
- A Technician can access only jobs assigned to the Technician profile derived from the authenticated session.
- A Work Order cannot be started unless it is assigned.
- Only an assigned Technician can start the assigned Work Order.
- Only a Work Order with status `ASSIGNED` can transition to `IN_PROGRESS`.
- Progress notes can be added only while the Work Order is `IN_PROGRESS`.
- Only a Work Order with status `IN_PROGRESS` can transition to `COMPLETED`.
- Completion notes are required.
- Completion notes are limited in length.
- Every operational update records the responsible user and timestamp.
- Completed and cancelled Work Orders cannot be edited through the general Dispatcher edit form.
- Technician availability changes to `BUSY` when work begins.
- Technician availability returns to `AVAILABLE` after completion only when no other Work Order remains in progress.

## Work Order Statuses

FieldFlow uses the following Work Order statuses:

```text
UNASSIGNED
ASSIGNED
IN_PROGRESS
COMPLETED
CANCELLED
```

The primary Technician transition is:

```text
ASSIGNED → IN_PROGRESS → COMPLETED
```

Progress activity is stored as:

```text
IN_PROGRESS → IN_PROGRESS
```

This is intentional because the Work Order history records operational activity as well as status changes.

## Work Order Priorities

```text
LOW
MEDIUM
HIGH
URGENT
```

## Technician Availability

```text
AVAILABLE
BUSY
UNAVAILABLE
```

## Technology Stack

### Application

- Node.js 22
- Next.js App Router
- React
- TypeScript with strict type checking
- Tailwind CSS

### Authentication and Validation

- Better Auth
- Zod
- Server-side role and session helpers

### Database

- Neon PostgreSQL
- Prisma ORM
- Prisma migrations

### Testing

- Playwright
- Chromium
- TypeScript compiler
- ESLint
- Next.js production build

### Development and Delivery

- Git
- GitHub
- GitHub Issues
- Pull Requests
- Render

## Architecture

FieldFlow uses a server-first Next.js App Router architecture.

### Server Components

Server Components are used for:

- Protected pages
- Database-backed lists
- Detail pages
- Dashboard statistics
- Role-aware layout
- Query execution

### Client Components

Client Components are used only where browser interactivity is required, including:

- Authentication forms
- Server Action forms
- Pending button states
- Validation feedback
- Error retry controls

### Query Layer

Database query modules are organized under:

```text
lib/customers/
lib/technicians/
lib/work-orders/
lib/my-jobs/
lib/dashboard/
```

Protected query modules:

- Run only on the server
- Enforce the required role
- Use bounded selections where appropriate
- Return safe application errors
- Avoid exposing raw database errors

### Action Layer

Server Actions are used for application writes, including:

- Customer creation and editing
- Technician profile creation and editing
- Work Order creation and editing
- Work Order cancellation
- Start Work
- Progress notes
- Work Order completion

Server Actions:

- Validate browser input with Zod
- Derive user identity from the authenticated session
- Enforce role and ownership rules
- Use Prisma transactions for related database writes
- Revalidate affected routes
- Return safe user-facing errors

## Transactional Integrity

FieldFlow uses Prisma transactions for multi-record operations.

### Start Work transaction

The Start Work action updates:

```text
WorkOrder.status → IN_PROGRESS
TechnicianProfile.availability → BUSY
WorkOrderUpdate → new audit-history entry
```

If any write fails, all writes roll back.

### Progress note transaction

A progress note updates:

```text
WorkOrder.updatedAt
WorkOrderUpdate → timestamped progress-history entry
```

The Work Order remains `IN_PROGRESS`.

### Completion transaction

Completion updates:

```text
WorkOrder.status → COMPLETED
WorkOrder.completionNotes → submitted completion text
WorkOrder.completedAt → server timestamp
WorkOrderUpdate → completion history
TechnicianProfile.availability → recalculated value
```

Technician availability remains `BUSY` if another Work Order is still in progress.

## Project Structure

```text
fieldflow/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── my-jobs/
│   │   ├── technicians/
│   │   └── work-orders/
│   └── api/
├── components/
│   ├── auth/
│   └── forms/
├── docs/
│   └── deployment.md
├── lib/
│   ├── auth/
│   ├── customers/
│   ├── dashboard/
│   ├── db/
│   ├── my-jobs/
│   ├── permissions/
│   ├── technicians/
│   ├── validation/
│   └── work-orders/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── tests/
│   └── e2e/
├── playwright.config.ts
├── prisma.config.ts
└── package.json
```

The exact file structure may include additional framework and configuration files.

## Data Model Overview

The main database entities include:

### User

Stores authentication and role information.

Important values include:

- Name
- Email
- Role
- Authentication relationships

### Session

Stores authenticated session data managed by Better Auth.

### Customer

Stores:

- Name
- Email
- Phone
- Address line 1
- Address line 2
- City
- Postcode
- Created timestamp
- Updated timestamp

### TechnicianProfile

Stores:

- Linked user account
- Skills
- Availability
- Assigned Work Orders
- Created timestamp
- Updated timestamp

### WorkOrder

Stores:

- Title
- Description
- Status
- Priority
- Customer
- Assigned Technician
- Creator
- Scheduled start
- Scheduled end
- Completion notes
- Completion timestamp
- Created timestamp
- Updated timestamp

### WorkOrderUpdate

Stores:

- Work Order
- Author
- Previous status
- New status
- Note
- Timestamp

## Prerequisites

Install the following before running FieldFlow locally:

- Node.js 22 LTS
- npm
- Git
- A PostgreSQL database
- Chromium for Playwright E2E testing

A Neon PostgreSQL database is used by the deployed project.

## Local Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd fieldflow
```

Replace `<repository-url>` with the FieldFlow GitHub repository URL.

### 2. Install dependencies

```bash
npm install
```

The `postinstall` script generates Prisma Client automatically.

### 3. Create the private environment file

Create:

```text
.env
```

Use `.env.example` as the variable-name reference.

Do not commit `.env`.

### 4. Configure the database

Set `DATABASE_URL` to a private PostgreSQL connection string.

For Neon PostgreSQL, use explicit SSL verification where supported:

```text
sslmode=verify-full
```

Never place the complete database URL in source files, documentation, screenshots, issues, or pull requests.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Verify migrations

```bash
npx prisma migrate status
```

### 7. Apply committed migrations

For an existing environment:

```bash
npx prisma migrate deploy
```

For controlled local migration development only:

```bash
npx prisma migrate dev
```

Do not run local migration-development commands against production.

### 8. Start the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

FieldFlow reads private configuration from environment variables.

### Required application variables

```dotenv
DATABASE_URL=""
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
```

### Playwright configuration

```dotenv
PLAYWRIGHT_BASE_URL="http://localhost:3000"
```

### Fictional E2E test accounts

```dotenv
E2E_ADMIN_EMAIL=""
E2E_ADMIN_PASSWORD=""

E2E_DISPATCHER_EMAIL=""
E2E_DISPATCHER_PASSWORD=""

E2E_TECHNICIAN_EMAIL=""
E2E_TECHNICIAN_PASSWORD=""
E2E_TECHNICIAN_NAME=""
```

Real values belong only in the ignored local `.env` or an approved private CI secret store.

Never commit:

- Passwords
- Database URLs
- Better Auth secrets
- Cookies
- Session identifiers
- Authentication storage state
- Production environment values

## Better Auth Configuration

The authentication server uses environment-driven configuration.

Conceptually, the configuration includes:

```ts
const authBaseUrl = process.env.BETTER_AUTH_URL;

const trustedOrigins = authBaseUrl
  ? [authBaseUrl]
  : [];

export const auth = betterAuth({
  baseURL: authBaseUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,

  // Existing database adapter and authentication settings.
});
```

Local configuration uses:

```text
BETTER_AUTH_URL=http://localhost:3000
```

Production configuration uses:

```text
BETTER_AUTH_URL=https://fieldflow-74vq.onrender.com
```

The production URL must:

- Use HTTPS
- Match the deployed origin exactly
- Not include a trailing slash
- Not include `/login`
- Not include `/api/auth`

## Available Commands

### Start the development server

```bash
npm run dev
```

### Run TypeScript validation

```bash
npx tsc --noEmit
```

### Run ESLint

```bash
npm run lint
```

### Build the production application

```bash
npm run build
```

### Start the production server locally

```bash
npm run start
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Format the Prisma schema

```bash
npx prisma format
```

### Validate the Prisma schema

```bash
npx prisma validate
```

### Check migration status

```bash
npx prisma migrate status
```

### Apply committed production migrations

```bash
npx prisma migrate deploy
```

## Automated End-to-End Testing

FieldFlow uses Playwright with Chromium.

### Install the Chromium browser

```bash
npx playwright install chromium
```

### Run all tests

```bash
npm run test:e2e
```

### Run tests with a visible browser

```bash
npm run test:e2e:headed
```

### Open Playwright UI mode

```bash
npm run test:e2e:ui
```

### Open the latest HTML report

```bash
npm run test:e2e:report
```

### Verified test result

The completed Week 7 suite contains 16 Playwright tests.

Verified result:

```text
16 passed
```

The suite is configured to use one worker because tests share fictional accounts and write records to a shared development database.

## Automated Test Coverage

### Public navigation

- Home page availability
- Login page availability
- Signed-out Dashboard protection
- Signed-out My Jobs protection

### Authentication

- Generic invalid-credential feedback
- Dispatcher login
- Administrator login
- Technician login
- Role-specific landing routes
- Sign-out
- Protected routes after sign-out

### Role authorization

- Technician denial from Dashboard
- Technician denial from Customer management
- Technician denial from Technician management
- Technician denial from Work Order management
- Dispatcher denial from My Jobs
- Administrator denial from My Jobs
- Dispatcher access to operational pages

### Dispatcher Customer workflow

- Customer form validation
- Fictional Customer creation
- Customer detail verification
- Customer search verification

### Dispatcher Work Order workflow

- Fictional Customer creation
- Work Order creation
- Customer selection
- Technician assignment
- Priority selection
- Assigned status verification
- Initial audit-history verification
- Work Order search verification

### Technician workflow

- Dispatcher creates an assigned fictional Work Order
- Assigned Technician views the Work Order in My Jobs
- Technician starts work
- Status becomes `IN_PROGRESS`
- Start Work history is verified
- Technician adds a progress note
- Progress note appears in history
- Technician enters completion notes
- Status becomes `COMPLETED`
- Completed Work Order leaves the active My Jobs list
- Dispatcher verifies completion details and history

## Test Data

Automated tests use unique fictional data with recognizable prefixes:

```text
E2E Customer ...
E2E Work Order ...
```

Test email addresses use the reserved domain:

```text
example.invalid
```

This prevents accidental external email delivery.

E2E tests do not hard-code database IDs. Customer and Technician values are selected from database-backed form options.

## Playwright Security

Generated Playwright output is ignored by Git:

```text
playwright-report/
test-results/
blob-report/
playwright/.auth/
```

Failure artifacts may contain:

- Entered fictional email addresses
- Form data
- Production or local routes
- Browser state

Failure screenshots, videos, reports, and traces must be reviewed before being stored as evidence. Authentication storage files must not be committed.

## Responsive Design

FieldFlow supports mobile, tablet, and desktop layouts.

Responsive improvements include:

- Role-aware wrapping navigation
- Mobile-friendly page padding
- Responsive card padding
- Full-width mobile action buttons
- Stacked form fields on narrow screens
- Contained horizontal table scrolling
- Long email and address wrapping
- Skill-label wrapping
- Responsive Work Order history
- Stacked progress and completion forms
- Visible keyboard-focus indicators
- Touch-friendly form controls

The core workflow was reviewed at approximately:

```text
375 × 667
768 × 1024
1280 × 720
```

## Loading and Error Handling

Authenticated routes include a shared loading interface and error boundary.

The loading state includes:

- Skeleton feedback
- `aria-busy`
- Screen-reader loading text
- Responsive layout

The unexpected-error interface includes:

- Generic safe error wording
- Retry control
- Role-aware return navigation
- No raw stack-trace rendering
- No raw database-error rendering

Query and Action layers also return safe user-facing errors.

## Security Controls

FieldFlow applies the following controls:

### Authentication security

- Password handling is delegated to Better Auth.
- Invalid login feedback is generic.
- Sessions are checked on protected routes.
- Sign-out ends access to authenticated routes.
- Authentication configuration uses private environment values.

### Server-side authorization

- Role checks occur in protected pages, queries, and actions.
- Technician ownership is derived from the authenticated user.
- The browser cannot select a Technician identity for My Jobs actions.
- Hidden navigation links are not treated as authorization.

### Input validation

- Browser input is validated on the server with Zod.
- Required fields are enforced.
- Text fields use length limits.
- Enum values are restricted.
- Database identifiers are validated.
- Completion notes are required.

### Database integrity

- Related Work Order changes use Prisma transactions.
- Every status update records the author.
- Every history entry records a timestamp.
- Invalid state transitions are rejected.
- Raw Prisma errors are not shown to users.

### Secret management

- `.env` is ignored.
- `.env.example` contains names and safe examples only.
- Production values are stored privately in Render.
- Passwords and database connection strings are not stored in GitHub.
- Evidence screenshots exclude credentials and session data.

### Production transport

The production application is served over HTTPS by Render.

## Deployment

### Hosting decision

The approved project proposal allows deployment to Vercel or another mentor-approved host.

Vercel required phone verification, but Sri Lanka/+94 was unavailable in the verification process. No temporary SMS provider, false regional information, shared account, or verification bypass was used.

The mentor approved:

- Render
- Azure
- AWS

Render was selected because it supports the existing FieldFlow architecture with minimal hosting-specific changes.

### Production configuration

```text
Provider: Render
Service type: Web Service
Deployment branch: main
Runtime: Node.js 22
Build command: npm install && npm run build
Start command: npm run start
Database: Neon PostgreSQL
Authentication: Better Auth
```

### Private production variables

The following variable names are configured privately in Render:

```text
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NODE_VERSION
```

The values are not committed to the repository.

### Prisma in production

Prisma Client is generated through the installation lifecycle:

```text
postinstall → prisma generate
```

Committed production migrations are applied using:

```bash
npx prisma migrate deploy
```

The following commands must not be used against production:

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma db push --force-reset
```

### Production verification

Production verification includes:

- Public home page
- Public login page
- Signed-out route protection
- Dispatcher login
- Technician login
- Role-specific landing routes
- Role-denial behavior
- Dashboard database reads
- Customer database reads and writes
- Technician information
- Work Order information
- My Jobs
- Sign-out
- HTTPS availability
- Safe production errors

## Accessibility

FieldFlow includes:

- Semantic headings
- Form labels
- Screen-reader-only labels where appropriate
- Required-field indicators
- `aria-invalid`
- `aria-describedby`
- Alert semantics for visible validation feedback
- Keyboard-accessible links and buttons
- Visible focus indicators
- Accessible loading status
- Accessible error retry control
- Descriptive action text
- Responsive touch targets

Accessibility was reviewed through keyboard navigation and responsive browser testing.

## Privacy and Demonstration Data

FieldFlow is an internship demonstration project.

Only fictional information should be used, including:

- Customer names
- Customer contact details
- Service addresses
- Technician accounts
- Work Order descriptions
- Progress notes
- Completion notes

Do not store real customer, employee, payment, authentication, or confidential organizational information in the demonstration environment.

## Dependency Security Review

The project dependency audit was reviewed during Week 7.

A non-breaking audit fix resolved the reported `nanoid` advisory.

A transitive high-severity advisory remains for:

```text
deepmerge-ts
```

through the dependency path:

```text
prisma
└── @prisma/config
    └── deepmerge-ts
```

The npm automated forced fix proposes installing Prisma 6.12.0, which is a breaking downgrade from the validated Prisma 7.10.0 configuration.

The forced downgrade was not applied.

Prisma packages are aligned and pinned to:

```text
prisma: 7.10.0
@prisma/client: 7.10.0
```

The remaining advisory should be reviewed when Prisma provides a compatible stable dependency update.

Do not run:

```bash
npm audit fix --force
```

without reviewing the proposed dependency changes and completing full regression testing.

## Known Issues and Limitations

### Prisma transitive advisory

A transitive `deepmerge-ts` advisory remains through Prisma configuration tooling. The available automated forced fix proposes a breaking Prisma downgrade and was therefore not applied.

### Hosting costs

The Render service requires billing or payment verification under the selected hosting configuration. Billing should be monitored, and the service should be suspended or removed after assessment if it is no longer required.

### Test data accumulation

Playwright workflow tests create uniquely named fictional Customers and Work Orders. Repeated test runs may add multiple `E2E Customer` and `E2E Work Order` records to the connected development database.

### Development server stream messages

Some Playwright development-server runs reported:

```text
The destination stream closed early.
```

The messages occurred when browser navigation interrupted a streamed Next.js response. The completed test suite still passed all 16 tests.

### Optional features outside the completed scope

The following optional features were not included:

- Notifications
- Paid SMS
- Email dispatch
- Maps
- Route optimization
- Inventory management
- Exports
- Calendar integration
- IoT integration
- GPS tracking
- QR hardware workflows
- Advanced charts
- Dark mode
- Mobile applications

The mandatory authentication, role access, Customer, Technician, Work Order, My Jobs, Dashboard, audit-history, testing, responsive-design, and deployment requirements were prioritized.

## Evidence

Evidence includes:

- GitHub Issues
- Development branches
- Pull requests
- Commit history
- Database and Prisma checks
- Access-control checks
- TypeScript output
- ESLint output
- Production-build output
- Playwright output
- Render deployment
- Production smoke tests

Evidence does not include:

- Passwords
- Database URLs
- Better Auth secrets
- Cookies
- Session identifiers
- Authentication storage
- Payment-card information
- Billing addresses
- Real customer information

## Development Process

FieldFlow was developed incrementally using:

- Weekly milestones
- Git feature branches
- Focused commits
- GitHub Issues
- Draft Pull Requests
- Code review
- Static checks
- Browser testing
- Playwright E2E testing
- Separate evidence storage

Major implementation phases:

```text
Week 1: Planning, GitHub, wireframes, and project setup
Week 2: Database, Prisma, authentication, and role protection
Week 3: Customer and Technician management
Week 4: Work Orders, assignment, filtering, cancellation, and history
Week 5: Technician My Jobs workflow
Week 6: Dashboard, responsive design, and interface quality
Week 7: Playwright, deployment, README, and evidence review
Week 8: Final report, presentation, demo, and submission
```

## Demonstration Guide

A recommended live demonstration sequence is:

1. Open the production home page.
2. Sign in as Dispatcher.
3. Show the Dashboard.
4. Show Customer search.
5. Show Technician profiles and availability.
6. Create a fictional Work Order.
7. Assign the fictional Technician.
8. Sign out.
9. Sign in as Technician.
10. Open My Jobs.
11. Open the assigned Work Order.
12. Start Work.
13. Add a progress note.
14. Add required completion notes.
15. Complete the Work Order.
16. Sign out.
17. Sign in as Dispatcher.
18. Open the completed Work Order.
19. Show completion information and full history.
20. Show role-denial behavior.
21. Show the GitHub repository, tests, pull requests, and production deployment evidence.

Never display passwords, environment files, cookies, tokens, or private database information during the demonstration.