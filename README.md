# Employee & Task Management System

   **Live Demo**

   - Frontend: https://employee-and-task-management-system.vercel.app
   - Backend: https://employee-and-task-management-system-n69o.onrender.com

MERN app (React + Vite, Node/Express, MongoDB/Mongoose) for the Roots Media Marketing intern assignment. All business rules live on the backend; the frontend only mirrors field validation for convenience.

## Setup

Prerequisites: Node 18+, a MongoDB instance (local or Atlas).

```bash
# backend
cd backend && cp .env.example .env     # fill in MONGODB_URI
npm install && npm run dev             # http://localhost:5000

# frontend (new terminal)
cd frontend && cp .env.example .env    # leave VITE_API_URL empty locally
npm install && npm run dev             # http://localhost:5173 (proxies /api to :5000)
```

Tests: `npm test` in each folder. Backend tests cover the business rules, query building, CSV escaping and request validation (they need no database). Concurrency and full CRUD flows against a real MongoDB are not covered by automated tests.

### Environment variables
| File | Variable | Purpose |
|---|---|---|
| backend/.env | `PORT` | API port (default 5000) |
| backend/.env | `MONGODB_URI` | Mongo connection string (required) |
| backend/.env | `CORS_ORIGIN` | Comma separated allowed frontend origins |
| frontend/.env | `VITE_API_URL` | Deployed API base, e.g. `https://api.example.com/api` (empty in dev) |

### Deployment
Backend on Render (build `npm install`, start `npm start`, set the env vars above, Atlas for the DB). Frontend on Vercel/Netlify (root `frontend`, build `npm run build`, output `dist`, set `VITE_API_URL`). `vercel.json` and `public/_redirects` handle SPA refresh on deep links. Set the backend `CORS_ORIGIN` to the frontend URL.

## Structure
```
backend/src  config/ models/ validators/ middleware/ services/ controllers/ routes/ utils/
frontend/src api/ components/{ui,layout,tasks} constants/ hooks/ pages/{employees,tasks} schemas/ utils/
```
Controllers are thin; rules live in `services/taskRules.js` (pure functions, unit tested) and the services.

## API overview
Responses: `{ success, data, meta?, message? }`; errors: `{ success:false, message, errors?[{path,message}] }`.

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/employees` | list (page, limit, q, department, status, sortBy, order) / create |
| GET | `/api/employees/options` | light list for the assignee dropdown |
| GET/PUT/DELETE | `/api/employees/:id` | view / edit / delete (blocked with Todo or In Progress tasks) |
| GET/POST | `/api/tasks` | list (page, limit, q, department, priority, status, dueFrom, dueTo, overdue, employee, sortBy=createdAt\|dueDate\|priority\|title, order) / create |
| GET | `/api/tasks/export` | CSV of **all** tasks matching the same filters |
| GET/PUT/DELETE | `/api/tasks/:id` | PUT never accepts status / completedAt |
| PUT | `/api/tasks/:id/status` | only way to change status |
| GET | `/api/dashboard` | all counts and workload computed server-side |

Errors: 400 invalid data or broken rule, 404 not found, 409 duplicate Employee ID / email.

## Schema and Employee → Task relationship
- **Employee**: employeeId (unique, upper-cased), fullName, email (unique, lower-cased), phone, department, role, joiningDate, status, skills[], leaveStartDate/leaveEndDate, `activeTaskCount`.
- **Task**: taskId (`TSK-001`, from an atomic counter), title, description, `employee` (ObjectId ref), `employeeSnapshot`, `employeeDeleted`, department, priority + `priorityRank`, status, startDate, dueDate, completedAt, createdAt.
- One Employee has many Tasks (task → employee reference).

### Employee deletion
Deletion is rejected (400) while the employee has Todo / In Progress tasks. Otherwise the employee is removed and their tasks are flagged `employeeDeleted`. Each task stores an `employeeSnapshot` (ID, name, email, department, role) taken at assignment and refreshed whenever the employee is edited, so old tasks always show real details, rendered as "Name (deleted)".

## Assumptions
- Dates are date-only, stored at UTC midnight; "today" for overdue is the server's UTC date.
- Joining date cannot be in the future. Leave dates are cleared when status is not On Leave.
- Making an employee Inactive / On Leave does not touch their existing tasks.
- Editing a task re-checks assignment only if the employee or start date changes; reassigning checks the new employee's capacity.
- Completed and Cancelled tasks cannot be edited but can be deleted.
- Task IDs may skip a number if a create fails after the counter increments.
- The assignee dropdown loads up to 200 employees (the options endpoint).
- Row actions use a three-dot menu (View / Edit / Delete), rendered in a portal so the scrolling table never clips it.

## Questions from the assignment
1. **Where are status transitions validated, and why?** In `changeStatus` → `assertValidTransition` (backend), because anything checked only in the browser can be bypassed by a direct API call. The UI just shows the `allowedStatuses` the server sends. Normal create/edit rejects `status`, so this endpoint is the only door.
2. **Why does Completed Date come from the backend?** The client clock or payload can be wrong or forged. The server sets it from its own clock at the moment of the transition, so it can be trusted for reporting.
3. **How are inactive / on-leave assignments blocked?** `assertEmployeeAssignable` runs on create and on edit (when employee or start date changes): Inactive is always rejected; On Leave is rejected only if the start date is within the leave range, both ends inclusive.
4. **Why filtering and pagination on the backend?** The browser should not download every record; the database can use indexes, totals stay correct, filters combine consistently, and the CSV export reuses the exact same filter code.
5. **Why filters live in the URL?** Refresh, back/forward and copied links reproduce the same view, and the URL is the single source of truth for the list state.
6. **What goes wrong if two requests assign a 4th active task at once?** A naive "count tasks, then insert" lets both pass the check and the employee ends with 4. Here the slot is reserved with one atomic `findOneAndUpdate` (`activeTaskCount < 3` then `$inc`), so only one request wins and the other gets a 400. The slot is released if task creation fails, or when a task is completed, cancelled, deleted or reassigned. Status changes use compare-and-set on the old status so two concurrent requests can't both release a slot. A MongoDB transaction would be the alternative.
