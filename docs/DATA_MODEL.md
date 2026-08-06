# Initial FieldFlow Data Model

## User

Represents an authenticated account.

Key fields:

- id
- name
- email
- emailVerified
- role
- createdAt
- updatedAt

Roles:

- ADMIN
- DISPATCHER
- TECHNICIAN

## Customer

Represents a customer receiving field service.

Key fields:

- id
- name
- email
- phone
- addressLine1
- addressLine2
- city
- postcode
- createdAt
- updatedAt

## TechnicianProfile

Contains technician-specific operational information.

Key fields:

- id
- userId
- skills
- availabilityStatus
- createdAt
- updatedAt

A technician profile belongs to one User.

## WorkOrder

Represents a service job.

Key fields:

- id
- title
- description
- priority
- status
- customerId
- technicianId
- scheduledStart
- scheduledEnd
- completionNotes
- completedAt
- createdById
- createdAt
- updatedAt

A work order belongs to one customer and may be assigned to one technician.

## WorkOrderUpdate

Represents an auditable progress or status entry.

Key fields:

- id
- workOrderId
- authorId
- previousStatus
- newStatus
- note
- createdAt

Every status change records the author and creation time.

## Initial status values

- UNASSIGNED
- ASSIGNED
- IN_PROGRESS
- COMPLETED
- CANCELLED

## Initial priority values

- LOW
- MEDIUM
- HIGH
- URGENT

## Important constraints

- User email must be unique.
- A TechnicianProfile must reference a Technician user.
- A work order must have a technician before entering IN_PROGRESS.
- A work order must have completion notes before entering COMPLETED.
- Historical updates should not be silently overwritten.