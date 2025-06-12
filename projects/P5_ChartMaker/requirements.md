### ChartMaker Requirements and Architecture

This document defines the single source of truth for the ChartMaker system: architecture, components, modules, and detailed functional and non-functional requirements.

## 1. System Overview

ChartMaker enables authenticated users to create projects, upload CSV/XLSX data, review and edit data in a web grid, configure charts, preview them live, and export the final chart as a high-quality PDF.

## 2. Architecture

- **Frontend**: Vue 3, Vite, TypeScript, Pinia, Vue Router, ECharts (charts), AG Grid/Handsontable/Tabulator (editable data grid), Axios
- **Backend**: Python, Django, Django REST Framework (DRF), Djoser or DRF SimpleJWT for auth, pandas/openpyxl for parsing, WeasyPrint/ReportLab or HTML-to-PDF via headless Chromium for exports
- **Database**: MySQL
- **Cache/Queue**: Redis; Celery for background jobs (optional but recommended for large files/exports)
- **Object Storage**: Local in dev; S3-compatible (S3/Azure/GCS) in prod via django-storages
- **Auth**: JWT (access/refresh) or cookie-based session (JWT preferred for SPA)
- **Deployment**: Docker containers; Nginx reverse proxy; HTTPS via TLS; CI/CD pipeline

### 2.1 High-Level Component Diagram

- Browser (Vue SPA)
  - Interacts with DRF REST API (JWT)
  - Renders charts (ECharts) and editable table
- Django API
  - Auth, Projects, Files, Data, Chart Config, Export endpoints
  - Coordinates storage (DB + object storage)
  - Offloads heavy work to Celery workers (optional)
- MySQL (relational state)
- Object Storage (original uploads + export artifacts)
- Redis (cache + Celery broker/backend)

## 3. Major Components and Modules

1) Authentication & User Management
2) Project Management
3) File Upload & Storage
4) Data Ingestion & Parsing
5) Data Model & Editing
6) Column Selection & Schema Mapping
7) Chart Configuration
8) Chart Rendering & Preview (client-side)
9) PDF Export

## 4. Detailed Requirements by Module

### 1 Authentication
1.1 - Must support sign up, login, logout.

Backend Requirements:
- Endpoints (Djoser or custom DRF views):
  - POST /auth/jwt/create, POST /auth/jwt/refresh, POST /auth/users/
  - GET /auth/users/me
- User model can be Django default; support unique email and username; email optional but recommended

Frontend Requirements:
- Auth pages: Sign Up, Login, (optional) Forgot Password
- Store tokens; Axios interceptors for auth headers and refresh
- Guarded routes; redirect unauthenticated users to login

### 2 Project Management
2.1 - Users can create, list, update name/description, archive/delete projects


Backend Requirements:
- Model: Project { id, owner, name, description, status, created_at, updated_at }
- Endpoints:
  - GET/POST /projects/
  - GET/PATCH/DELETE /projects/{id}/
  - Ownership enforcement via permissions

Frontend Requirements:
- Project list page (pagination, create button)
- Project detail dashboard (upload area, data grid, chart config, preview, export)

### 3 File Upload & Storage
3.1 - Accept CSV and XLSX; size limits configurable; validate MIME and extensions
3.2 - Store original file in object storage; persist file metadata and link to project

Backend Requirements:
- Model: UploadedFile { id, project, filename, content_type, size_bytes, storage_key, checksum, created_at }
- Endpoint: POST /projects/{id}/upload (multipart)
- Validate file; compute checksum; store to storage; return metadata

Frontend Requirements:
- Drag & drop and file picker; show progress; handle errors; display uploaded file metadata

### 4 Data Ingestion & Parsing
4.1 - Parse uploaded file to a normalized tabular representation
4.2 - Generate a typed schema (string/number/boolean/date) with best-effort inference
4.3 - Produce a row count and sample preview

Backend Requirements:
- Model: DataTable { id, project, source_file, schema_json, num_rows, sample_json, created_at }
- Use pandas/openpyxl for parsing; handle large files via streaming or background job
- Endpoint: POST /projects/{id}/ingest -> returns schema + sample; may be triggered automatically after upload

Frontend Requirements:
- After upload, fetch and display sample + inferred schema; show parsing errors with guidance

### 5 Data Model & Editing
5.1 - Display full dataset or paginated chunks in an editable grid
5.2 - Support edit cells, add/remove rows, undo (client-level), and persist changes

Backend Requirements:
- Model: DataRow (optional if storing normalized data per row) or store compact columnar JSON
- For phase 1, persist edits via PATCH to DataTable with row diffs
- Endpoints:
  - GET /projects/{id}/data?page=...&page_size=...
  - PUT/PATCH /projects/{id}/data (apply edits)
- Validate types against schema; reject invalid rows with details

Frontend Requirements:
- Data grid with pagination/virtualization; inline edit; dirty state highlighting; save button; error toasts

### 6 Column Selection & Schema Mapping
6.1 - User selects columns to use for charts (X axis, Y series, grouping, category)
6.2 - Persist selection per project; server validates selection against schema

Backend Requirements:
- Extend ChartConfig to include selected_columns { x, y[], groupBy?, label? }
- Endpoint: POST/PUT /projects/{id}/chart-config

Frontend Requirements:
- UI for selecting columns; show compatible columns by type; instant preview refresh

### 7 Chart Configuration and styling
7.1 - Support chart types: bar, line, area, pie/donut, scatter, histogram (phase 2), stacked variants
7.2 - Style options: title, subtitle, colors, legend position, axes labels, gridlines, tooltips, data labels

Backend Requirements:
- Model: ChartConfig { id, project, type, selected_columns, style_json, version, created_at, updated_at }
- Validate config against schema and data availability
- Endpoint: GET/POST/PUT /projects/{id}/chart-config

Frontend Requirements:
- Panels to choose chart type and styles; two-way bind to preview (ECharts)
- Autosave changes to server; optimistic UI

### 8 Chart Rendering & Preview (Client-Side)
8.1 - Use ECharts to render preview from current data slice and config

Backend Requirements:
- Provide sampled data endpoint if dataset is large: GET /projects/{id}/data/preview

Frontend Requirements:
- Render chart with current config; update on data/selection changes; resize responsive

### 9 PDF Export
9.1 - Generate a high-quality PDF of the final chart

Backend Requirements:
- Model: ExportJob { id, project, status, result_storage_key, error, created_at }
- Endpoint: POST /projects/{id}/export/pdf -> returns job; GET /exports/{id} for status/result


Frontend Requirements:
- Export button; choose paper size/orientation; trigger export; poll job until ready; download link


## 5. Data Models (Initial)

- User (Django default)
- Project (id, owner_id, name, description, status[active|archived], created_at, updated_at)
- UploadedFile (id, project_id, filename, content_type, size_bytes, storage_key, checksum, created_at)
- DataTable (id, project_id, source_file_id, schema_json, num_rows, sample_json, created_at)
- ChartConfig (id, project_id, type, selected_columns_json, style_json, version, created_at, updated_at)
- ExportJob (id, project_id, status[pending|running|done|error], result_storage_key, error, created_at)
- (Phase 2) ProjectMember, ActivityLog

## 6. API Endpoints (Initial Set)

- Auth:
  - POST /auth/jwt/create, POST /auth/jwt/refresh, POST /auth/users/, GET /auth/users/me
- Projects:
  - GET/POST /projects/
  - GET/PATCH/DELETE /projects/{id}/
- Files & Data:
  - POST /projects/{id}/upload
  - POST /projects/{id}/ingest
  - GET /projects/{id}/data (pagination)
  - PUT/PATCH /projects/{id}/data (apply edits)
- Chart Config & Preview:
  - GET/POST/PUT /projects/{id}/chart-config
  - GET /projects/{id}/data/preview (sampled)
- Export:
  - POST /projects/{id}/export/pdf
  - GET /exports/{id}

## 7. Non-Functional Requirements

- Security: JWT, HTTPS, CSRF (if cookies), input validation, file scanning (optional), principle of least privilege
- Performance: pagination/virtualization, server-side sampling, async jobs for heavy tasks
- Reliability: transactional DB writes; idempotent uploads; retry policies for storage
- Observability: structured logs, request/response metrics, error tracking (Sentry), health checks
- Scalability: stateless API; horizontal scaling; CDN for static assets
- Compliance: GDPR-ready data deletion; configurable data retention

## 8. Validation & Constraints

- Max upload size (configurable, default 50 MB)
- Supported formats: .csv, .xlsx
- Schema inference best-effort; explicit overrides allowed in UI (phase 2)
- Edits must pass type validation; report row/column errors to client

## 9. Acceptance Criteria (Phase 1)

- Users can sign up/login and create projects
- Upload CSV/XLSX to a project and see parsed sample
- View and edit data in a grid with persistence
- Select columns and chart type; see live preview
- Customize basic styles (title, colors, legend, axis labels)
- Export a PDF containing the final chart and download it successfully


