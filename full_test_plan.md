# Full Application Test Plan

This plan guides you through a complete "Patient Journey" to test all components of SmartQ.

## 1. Prepare Seed Data (SQL Editor)

Run this SQL to populate your Supabase database with initial data:

```sql
-- Create Departments
INSERT INTO departments (name, code) VALUES ('General Medicine', 'GEN');
INSERT INTO departments (name, code) VALUES ('Pediatrics', 'PED');
INSERT INTO departments (name, code) VALUES ('Cardiology', 'CARD');

-- Create a Doctor record (MUST be linked to a Staff User)
-- Run this AFTER creating a staff user in the dashboard as per the previous guide.
-- Replace 'STAFF_USER_ID' and 'DEPT_ID' with UUIDs from your tables.
-- INSERT INTO doctors (staff_user_id, name, specialization, department_id)
-- VALUES ('UUID_OF_STAFF_USER', 'Dr. Smith', 'Internal Medicine', 'UUID_OF_GEN_DEPT');
```

## 2. Testing Journey (End-to-End)

Open these URLs in **separate browser tabs**:

### Tab A: Patient Kiosk (`/kiosk`)
1. Click **"Get started"**.
2. Select **"General Medicine"** (or another department you created).
3. Enter a name and mobile number.
4. Click **"Get Token"**. You should see a token number (e.g., `GEN-001`).

### Tab B: Display Board (`/display`)
1. You should see your token number (`GEN-001`) appear in the "Waiting List".

### Tab C: Doctor Dashboard (`/doctor/dashboard`)
1. Log in as a Doctor.
2. You should see the patient in your queue.
3. Click **"Call Next"**.
4. Tab B (Display) should update to show the token number in the "Now Calling" section.

### Tab D: Admin Dashboard (`/admin/dashboard`)
1. Log in as an Admin.
2. Observe the "Live System Monitor" reflecting the current queue state across all departments.

---

> [!WARNING]
> **API Stubs Notice**: The current backend (`apps/api`) returns "Demo Data". This means that while the UI flows work, they are not yet fully syncing with your Supabase database. 
> 
> **Next Step**: I can implement the database-connected services in the backend to ensure your project is fully production-ready.
