### ChartMaker Incremental Roadmap (Feature-Based)

Each section is a complete feature slice with database, backend (BE), and frontend (FE) tasks. Build in order. Items marked "(opt)" are optional for the first iteration and can be deferred.

## 1) Foundations: Project Scaffolding and Auth

- DB:
  - Configure MySQL; create base migrations
- BE:
  - Scaffold Django project and DRF
  - Add JWT auth (Djoser or DRF SimpleJWT)
  - Implement `/auth/users/`, `/auth/jwt/create`, `/auth/jwt/refresh`, `/auth/users/me`
  - Global exception handling and request/response logging
- FE:
  - Scaffold Vue 3 + Vite + TypeScript + Router + Pinia
  - Auth pages: Login, Sign Up; token storage and Axios interceptors
  - Route guards and basic layout/shell

## 2) Projects CRUD

- DB:
  - `Project` model (owner, name, description, status, timestamps)
- BE:
  - Endpoints: `GET/POST /projects/`, `GET/PATCH/DELETE /projects/{id}/`
  - Ownership permissions
- FE:
  - Project list (create, list, delete)
  - Project detail shell page

## 3) File Upload & Storage

- DB:
  - `UploadedFile` model (project, filename, content_type, size, storage_key, checksum)
- BE:
  - Endpoint: `POST /projects/{id}/upload` (multipart)
  - Validate type/size; compute checksum; store to object storage (local dev)
- FE:
  - Upload widget (drag & drop + picker), progress, error states
  - Show uploaded file metadata

## 4) Data Ingestion & Parsing

- DB:
  - `DataTable` model (project, source_file, schema_json, num_rows, sample_json)
- BE:
  - Endpoint: `POST /projects/{id}/ingest` (trigger parse after upload)
  - Parse CSV/XLSX (pandas/openpyxl); infer schema; generate sample
- FE:
  - After upload, show parsing state and then sample preview
  - Display inferred schema details

## 5) Editable Data Grid

- DB:
  - Persist edited data strategy (row-diff or full table); add `updated_at`
- BE:
  - Endpoints:
    - `GET /projects/{id}/data?page=...` (pagination)
    - `PUT/PATCH /projects/{id}/data` (apply edits with validation)
- FE:
  - Data grid with pagination/virtualization
  - Inline edits; save changes; display validation errors per cell

## 6) Column Selection & Schema Mapping

- DB:
  - Extend `ChartConfig` (or create) to store `selected_columns` (x, y[], groupBy, label)
- BE:
  - Endpoint: `POST/PUT /projects/{id}/chart-config` (validate against schema)
- FE:
  - UI to pick columns compatible with chart types; persist selection

## 7) Chart Types and Live Preview

- DB:
  - Ensure `ChartConfig.type` persisted (bar, line, area, pie, scatter)
- BE:
  - `GET /projects/{id}/data/preview` for sampled data when large (opt)
- FE:
  - Integrate ECharts; render preview from selected columns
  - Handle large datasets via sampling notice

## 8) Styling Controls and Autosave

- DB:
  - `ChartConfig.style_json` (title, colors, legend position, axes labels, gridlines, tooltips)
- BE:
  - Validate style payload; version bump on change
- FE:
  - Style panel; debounce + autosave; optimistic updates

## 9) PDF Export (Approach A: client-rendered image upload)

- DB:
  - `ExportJob` model (status, result_storage_key, error, timestamps)
- BE:
  - `POST /projects/{id}/export/pdf` -> creates job and accepts chart image payload
  - Generate PDF (WeasyPrint/ReportLab), store to object storage
  - `GET /exports/{id}` -> status + download URL
- FE:
  - Export dialog (paper size/orientation)
  - Render chart to image, submit export, poll, download


