# Trade-offs and Design Decisions

## Why SQLite?

### Chosen

SQLite

### Alternatives

* PostgreSQL
* MySQL

### Reasoning

The assessment allows a relational database of your choice. SQLite was chosen as it requires no separate database server, simplifies setup, and handles 10,000 employee records comfortably. It can be swapped for PostgreSQL or MySQL later if needed.

---

## Why Separate Salary History Table?

### Chosen

Dedicated Salary Revision table.

### Alternative

Updating salary records directly.

### Reasoning

Historical compensation data is important for HR operations and auditing. A separate history table preserves all changes.

---

## Why Server-Side Filtering?

### Chosen

Filtering handled by backend APIs.

### Alternative

Load all employees into frontend and filter locally.

### Reasoning

With 10,000 employees, server-side filtering scales better and reduces browser memory usage.

---

## Why Pagination?

### Chosen

Paginated employee listing.

### Alternative

Load all employees at once.

### Reasoning

Improves performance and user experience for large datasets.

---

## Why Single Repository?

### Chosen

Monorepo containing frontend and backend.

### Alternative

Separate repositories.

### Reasoning

Simplifies review, setup, deployment, and assessment evaluation.

---

## Why Not Build Payroll Features?

### Excluded

* Payroll processing
* Payslips
* Tax calculations

### Reasoning

The assessment focuses on compensation management rather than payroll execution. Excluding these features keeps the MVP focused and achievable.

---

## Future Enhancements

* Role-based access control
* Employee self-service portal
* Payslip generation
* Advanced reporting
* Multi-currency conversion
* Payroll integration
* Export to Excel and CSV
