# FieldFlow Project Scope

## Project mode

FieldFlow is an individual internship project.

## Objective

FieldFlow is a full-stack field service management application for dispatchers, technicians, and administrators.

## Mandatory workflow

1. A dispatcher creates a work order.
2. A dispatcher assigns a technician and schedule.
3. The assigned technician views the work order in My Jobs.
4. The technician starts work and records progress.
5. The technician adds completion notes and completes the work order.
6. The dashboard and work-order history update from saved data.

## Users and permissions

### Administrator

- Manage users and roles.
- Manage customers and technicians.
- Create, assign, update, and view all work orders.
- View the dashboard.

### Dispatcher

- Manage customers and technician operational information.
- Create and edit work orders.
- Assign technicians and schedules.
- View all work orders and the dashboard.
- Cannot manage user accounts or roles.

### Technician

- View only work orders assigned to their account.
- Start assigned work.
- Add progress updates.
- Add completion notes.
- Complete assigned work.
- Cannot assign work orders or access other technicians' jobs.

## Mandatory features

- Email and password authentication.
- Protected application pages.
- Server-enforced role permissions.
- Customer create, view, edit, and search.
- Technician profiles, skills, availability, and assigned jobs.
- Work-order create, view, edit, assign, filter, update, and complete.
- Technician My Jobs workflow.
- Dashboard statistics and recent activity.
- Work-order status history.
- Input validation and safe error responses.
- Responsive interface.
- Automated end-to-end tests.
- Production deployment.

## Business rules

- Only an Administrator or Dispatcher can assign work orders.
- A Dispatcher cannot manage users or roles.
- A Technician can access only work orders assigned to their account.
- A work order cannot start without an assigned technician.
- Completion notes are required before completion.
- Every status update records the responsible user and timestamp.
- Permissions must be enforced on the server.

## Deferred optional features

The following are excluded until the mandatory workflow is complete:

- Notifications
- Calendar interface
- Data exports
- Dark mode
- Charts
- Route optimisation
- Inventory management
- GPS or hardware integration
- Payments
- Mobile applications
- Microservices