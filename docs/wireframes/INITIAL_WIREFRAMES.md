# FieldFlow Initial Wireframes
 
These wireframes define the first version of the core FieldFlow screens. They are planning artifacts for Week 1 and do not represent final UI implementation.
 
## 1. Login
 
Purpose:
Allow users to sign in with email and password.
 
Layout:
- FieldFlow title
- Email input
- Password input
- Sign in button
- Error message area
 
Notes:
- Authentication will be implemented in Week 2.
- Invalid credentials should show a safe generic error.
 
## 2. Dashboard
 
Purpose:
Provide an operational overview for administrators and dispatchers.
 
Layout:
- Page title: Dashboard
- Summary cards:
- Total work orders
- Assigned work orders
- In-progress work orders
- Completed work orders
- Technician availability section
- Recent work orders list
- Quick links:
- Customers
- Technicians
- Work Orders
 
Notes:
- Dashboard statistics depend on saved database records.
- Dashboard implementation comes after work-order functionality.
 
## 3. Customers
 
Purpose:
Allow administrators and dispatchers to manage service customers.
 
Layout:
- Page title: Customers
- Search input
- Add customer button
- Customer table:
- Name
- Email
- Phone
- City
- Actions
 
Notes:
- Customer CRUD starts in Week 3.
- Search should validate input and avoid exposing errors.
 
## 4. Technicians
 
Purpose:
Allow administrators and dispatchers to manage technician profiles.
 
Layout:
- Page title: Technicians
- Add technician profile button
- Technician table:
- Name
- Email
- Skills
- Availability
- Assigned jobs
- Actions
 
Notes:
- Technician profiles must link to user accounts.
- Technician availability is needed before assignment.
 
## 5. Work Orders
 
Purpose:
Allow administrators and dispatchers to create, assign, filter, and update work orders.
 
Layout:
- Page title: Work Orders
- Create work order button
- Filters:
- Status
- Priority
- Technician
- Customer
- Work order table:
- Title
- Customer
- Technician
- Priority
- Status
- Scheduled start
- Actions
 
Notes:
- Only administrators and dispatchers can assign work orders.
- Work-order implementation starts after customers and technicians.
 
## 6. My Jobs
 
Purpose:
Allow technicians to view and update assigned jobs.
 
Layout:
- Page title: My Jobs
- Assigned jobs list
- Job detail panel:
- Title
- Customer
- Schedule
- Status
- Description
- Progress notes
- Completion notes
- Actions:
- Start job
- Add progress update
- Complete job
 
Notes:
- Technicians can only see jobs assigned to their own account.
- Completion notes are required before completing a job.
- Server-side authorization is mandatory.
 
## Core navigation
 
Initial navigation links:
 
- Dashboard
- Customers
- Technicians
- Work Orders
- My Jobs
- Sign out
 
## Mobile considerations
 
The first version should remain usable on smaller screens:
 
- Tables may become stacked cards.
- Main actions should remain visible.
- Forms should use full-width inputs on mobile.