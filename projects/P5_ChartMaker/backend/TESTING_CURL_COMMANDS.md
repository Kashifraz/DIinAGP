# CURL Commands for Testing Feature 4: Data Ingestion & Parsing

## Prerequisites
- Backend server running on `http://127.0.0.1:8000`
- A valid user account (or create one using signup)
- Test CSV or XLSX files ready for upload

---

## Step 1: Authentication

### Option A: Login (if you already have an account)
```bash
curl -X POST http://127.0.0.1:8000/api/auth/jwt/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Option B: Sign Up (create a new account)
```bash
curl -X POST http://127.0.0.1:8000/api/auth/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Note:** After signup, you'll need to login using Option A to get tokens.

---

## Step 2: Create a Project (if you don't have one)

```bash
# Replace YOUR_ACCESS_TOKEN with the access token from Step 1
curl -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Test Project",
    "description": "Project for testing data ingestion",
    "status": "active"
  }'
```

**Response:**
```json
{
  "id": 1,
  "owner": 1,
  "owner_username": "testuser",
  "name": "Test Project",
  "description": "Project for testing data ingestion",
  "status": "active",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Note:** Save the project `id` (e.g., `1`) for the next steps.

---

## Step 3: Upload a File

### Upload CSV File
```bash
# Replace YOUR_ACCESS_TOKEN and PROJECT_ID with actual values
# Replace /path/to/your/file.csv with your actual CSV file path
curl -X POST http://127.0.0.1:8000/api/projects/PROJECT_ID/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/file.csv"
```

**Example (Windows PowerShell):**
```powershell
curl.exe -X POST http://127.0.0.1:8000/api/projects/1/upload `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -F "file=@C:\Users\YourName\Documents\data.csv"
```

**Example (Windows CMD):**
```cmd
curl -X POST http://127.0.0.1:8000/api/projects/1/upload ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -F "file=@C:\Users\YourName\Documents\data.csv"
```

**Response:**
```json
{
  "id": 1,
  "project": 1,
  "filename": "data.csv",
  "content_type": "text/csv",
  "size_bytes": 1024,
  "storage_key": "projects/1/files/1234567890_data.csv",
  "checksum": "abc123...",
  "created_at": "2024-01-01T12:00:00Z"
}
```

**Note:** Save the uploaded file `id` (e.g., `1`) if you want to specify it during ingestion.

### Upload XLSX File
```bash
curl -X POST http://127.0.0.1:8000/api/projects/PROJECT_ID/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/file.xlsx"
```

---

## Step 4: Ingest (Parse) the Uploaded File

### Option A: Ingest Latest Uploaded File (Recommended)
```bash
# Replace YOUR_ACCESS_TOKEN and PROJECT_ID with actual values
curl -X POST http://127.0.0.1:8000/api/projects/PROJECT_ID/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{}'
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/projects/1/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -d '{}'
```

### Option B: Ingest Specific Uploaded File
```bash
# Replace YOUR_ACCESS_TOKEN, PROJECT_ID, and UPLOADED_FILE_ID with actual values
curl -X POST http://127.0.0.1:8000/api/projects/PROJECT_ID/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "uploaded_file_id": UPLOADED_FILE_ID
  }'
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/projects/1/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -d '{
    "uploaded_file_id": 1
  }'
```

**Response (Success - 201 Created or 200 OK):**
```json
{
  "id": 1,
  "project": 1,
  "source_file": 1,
  "source_file_name": "data.csv",
  "schema_json": {
    "column1": "number",
    "column2": "string",
    "column3": "date",
    "column4": "boolean"
  },
  "num_rows": 150,
  "sample_json": [
    {
      "column1": 10,
      "column2": "text value",
      "column3": "2024-01-01T00:00:00",
      "column4": true
    },
    {
      "column1": 20,
      "column2": "another text",
      "column3": "2024-01-02T00:00:00",
      "column4": false
    }
    // ... more sample rows (up to 100 by default)
  ],
  "created_at": "2024-01-01T12:00:00Z"
}
```

---

## Complete Test Workflow Example

Here's a complete example workflow using a CSV file:

```bash
# 1. Login
TOKEN_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/auth/jwt/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123!"
  }')

# Extract access token (requires jq or manual extraction)
ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access')

# 2. Create Project
PROJECT_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Test Project",
    "description": "Testing data ingestion"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.id')

# 3. Upload File
UPLOAD_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/upload \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "file=@/path/to/your/data.csv")

UPLOADED_FILE_ID=$(echo $UPLOAD_RESPONSE | jq -r '.id')

# 4. Ingest File
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"uploaded_file_id\": $UPLOADED_FILE_ID
  }"
```

---

## Error Responses

### 401 Unauthorized (Invalid/Missing Token)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found (Project doesn't exist or no permission)
```json
{
  "detail": "Project not found or you don't have permission to access it."
}
```

### 404 Not Found (No uploaded files)
```json
{
  "detail": "No uploaded files found for this project."
}
```

### 400 Bad Request (Parsing error)
```json
{
  "detail": "Failed to parse CSV file: [error message]"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Failed to parse file: [error message]"
}
```

---

## Testing Tips

1. **Create a test CSV file** (`test_data.csv`):
```csv
name,age,email,is_active,created_date
John Doe,30,john@example.com,true,2024-01-01
Jane Smith,25,jane@example.com,false,2024-01-02
Bob Johnson,35,bob@example.com,true,2024-01-03
```

2. **Create a test XLSX file** with the same data using Excel or LibreOffice

3. **Test error cases:**
   - Try ingesting without uploading a file first
   - Try ingesting with invalid project ID
   - Try ingesting with a non-existent uploaded_file_id

4. **Test duplicate ingestion:**
   - Call the ingest endpoint twice with the same file
   - Second call should return the existing DataTable (200 OK) instead of creating a new one

---

## Viewing Uploaded Files and Data Tables

### List Projects (to get project IDs)
```bash
curl -X GET http://127.0.0.1:8000/api/projects/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Project Details
```bash
curl -X GET http://127.0.0.1:8000/api/projects/PROJECT_ID/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Step 5: Test Data Grid Endpoints (Feature 5)

### Populate Full Data (Required for Data Grid)

**Note:** For the data grid to work, we need to store the full parsed data in the database. Currently, the ingestion only stores sample data. Let's modify the ingestion to also store full data for smaller files.

First, let's update the ingestion to store full data (for demonstration - in production you'd want to limit this based on file size):

```bash
# This will need to be done programmatically by updating the DataIngestionView
# For now, assume we've updated it to store full_data_json
```

---

## Step 6: Test Data Grid Features

### Get Paginated Data

#### Get first page (default 100 rows)
```bash
# Replace YOUR_ACCESS_TOKEN and PROJECT_ID with actual values
curl -X GET "http://127.0.0.1:8000/api/projects/PROJECT_ID/data" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get specific page with custom page size
```bash
curl -X GET "http://127.0.0.1:8000/api/projects/1/data?page=2&page_size=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "data": [
    {
      "column1": "value1",
      "column2": 123,
      "column3": true,
      "column4": "2024-01-01T00:00:00"
    }
    // ... page_size rows
  ],
  "schema": {
    "column1": "string",
    "column2": "number",
    "column3": "boolean",
    "column4": "date"
  },
  "pagination": {
    "page": 1,
    "page_size": 100,
    "total_rows": 1000,
    "total_pages": 10,
    "has_next": true,
    "has_previous": false
  }
}
```

### Apply Edits to Data

#### Single cell edit
```bash
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "edits": {
      "0": {
        "column1": "new_value"
      }
    }
  }'
```

#### Multiple cell edits
```bash
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "edits": {
      "0": {
        "column1": "updated_name",
        "column2": 999
      },
      "1": {
        "column3": false
      }
    }
  }'
```

#### Bulk row edits
```bash
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "edits": {
      "5": {
        "name": "John Smith",
        "age": 30,
        "active": true
      },
      "10": {
        "name": "Jane Doe",
        "age": 25,
        "active": false
      }
    }
  }'
```

**Success Response:**
```json
{
  "detail": "Successfully applied 2 row edits.",
  "applied_edits": {
    "5": {
      "name": "John Smith",
      "age": 30,
      "active": true
    },
    "10": {
      "name": "Jane Doe",
      "age": 25,
      "active": false
    }
  }
}
```

**Validation Error Response:**
```json
{
  "detail": "Validation failed.",
  "errors": [
    "Row 0, column 'age': invalid value 'not_a_number' for type 'number'.",
    "Row 5: unknown column 'invalid_column'."
  ]
}
```

---

## Data Grid Testing Scenarios

### 1. Basic Data Retrieval
```bash
# Get first page
curl -X GET "http://127.0.0.1:8000/api/projects/1/data" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get second page with smaller page size
curl -X GET "http://127.0.0.1:8000/api/projects/1/data?page=2&page_size=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Data Editing
```bash
# Edit a text field
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"edits": {"0": {"name": "Updated Name"}}}'

# Edit a number field
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"edits": {"1": {"age": 42}}}'

# Edit a boolean field
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"edits": {"2": {"active": false}}}'
```

### 3. Validation Testing
```bash
# Test invalid number
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"edits": {"0": {"age": "not_a_number"}}}'

# Test unknown column
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"edits": {"0": {"unknown_column": "value"}}}'

# Test out of range row
curl -X PATCH http://127.0.0.1:8000/api/projects/1/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"edits": {"9999": {"name": "invalid"}}}'
```

### 4. Error Cases

#### No Data Table
```bash
curl -X GET "http://127.0.0.1:8000/api/projects/1/data" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Response:**
```json
{
  "detail": "No data table found for this project. Please upload and parse a file first."
}
```

#### Invalid Project
```bash
curl -X GET "http://127.0.0.1:8000/api/projects/999/data" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Response:**
```json
{
  "detail": "Project not found or you don't have permission to access it."
}
```

#### Page Out of Range
```bash
curl -X GET "http://127.0.0.1:8000/api/projects/1/data?page=999" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
**Response:**
```json
{
  "detail": "Page out of range."
}
```

---

## Complete Feature 5 Test Workflow

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/jwt/create \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "TestPassword123!"}' | jq -r '.access')

# 2. Create project
PROJECT_ID=$(curl -s -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Data Grid Test", "description": "Testing data grid"}' | jq -r '.id')

# 3. Upload file (assume you have test.csv ready)
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.csv"

# 4. Ingest file (assume this now stores full data)
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'

# 5. Get first page of data
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data" \
  -H "Authorization: Bearer $TOKEN"

# 6. Make some edits
curl -X PATCH http://127.0.0.1:8000/api/projects/$PROJECT_ID/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"edits": {"0": {"name": "Edited Name"}, "1": {"age": 99}}}'

# 7. Get data again to see edits
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data" \
  -H "Authorization: Bearer $TOKEN"
```

---

# Feature 6: Column Selection & Schema Mapping

## Prerequisites
- Backend server running on `http://127.0.0.1:8000`
- A valid user account with access token
- A project with uploaded and parsed data (from Feature 4)

---

## Step 1: Authentication (if not already done)

```bash
# Login to get access token
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/jwt/create \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "TestPassword123!"}' | jq -r '.access')

# Verify token is set
echo "Token: $TOKEN"
```

---

## Step 2: Ensure Project Has Data

```bash
# Set your project ID (replace with actual project ID)
PROJECT_ID=1

# Verify project exists and has data table
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/" \
  -H "Authorization: Bearer $TOKEN" | jq

# Check if data table exists (via ingestion endpoint)
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}' | jq '.schema_json'
```

---

## Step 3: Create Chart Configuration (POST)

### Example 1: Bar Chart Configuration
```bash
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "bar",
    "selected_columns": {
      "x": "Country",
      "y": ["Population", "GDP"],
      "groupBy": null,
      "label": "Country"
    },
    "style": {
      "title": "Population and GDP by Country",
      "xAxisLabel": "Country",
      "yAxisLabel": "Value"
    }
  }' | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "project": 1,
  "chart_type": "bar",
  "selected_columns": {
    "x": "Country",
    "y": ["Population", "GDP"],
    "groupBy": null,
    "label": "Country"
  },
  "style": {
    "title": "Population and GDP by Country",
    "xAxisLabel": "Country",
    "yAxisLabel": "Value"
  },
  "version": 1,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Example 2: Pie Chart Configuration (Single Y Column)
```bash
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "pie",
    "selected_columns": {
      "x": "Country",
      "y": ["Population"],
      "groupBy": null,
      "label": "Country"
    },
    "style": {
      "title": "Population Distribution by Country"
    }
  }' | jq
```

### Example 3: Scatter Plot Configuration
```bash
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "scatter",
    "selected_columns": {
      "x": "GDP",
      "y": ["Population"],
      "groupBy": null,
      "label": null
    },
    "style": {
      "title": "GDP vs Population"
    }
  }' | jq
```

---

## Step 4: Get Chart Configuration (GET)

```bash
curl -X GET http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "id": 1,
  "project": 1,
  "chart_type": "bar",
  "selected_columns": {
    "x": "Country",
    "y": ["Population", "GDP"],
    "groupBy": null,
    "label": "Country"
  },
  "style": {
    "title": "Population and GDP by Country",
    "xAxisLabel": "Country",
    "yAxisLabel": "Value"
  },
  "version": 1,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**If no config exists:**
```json
{
  "detail": "No chart configuration found for this project."
}
```

---

## Step 5: Update Chart Configuration (PUT)

```bash
curl -X PUT http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "line",
    "selected_columns": {
      "x": "Year",
      "y": ["Sales", "Revenue"],
      "groupBy": "Region",
      "label": "Product"
    },
    "style": {
      "title": "Sales and Revenue Over Time",
      "xAxisLabel": "Year",
      "yAxisLabel": "Amount"
    }
  }' | jq
```

**Note:** PUT requires all fields. Version will be incremented automatically.

---

## Step 6: Partially Update Chart Configuration (PATCH)

```bash
# Update only chart type
curl -X PATCH http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "area"
  }' | jq

# Update only selected columns
curl -X PATCH http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "selected_columns": {
      "x": "Month",
      "y": ["Revenue"],
      "groupBy": null,
      "label": null
    }
  }' | jq

# Update only style
curl -X PATCH http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "style": {
      "title": "Updated Chart Title",
      "colors": ["#FF5733", "#33FF57", "#3357FF"],
      "legendPosition": "right"
    }
  }' | jq
```

---

## Step 7: Validation Error Tests

### Test 1: Missing Required Fields
```bash
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "bar",
    "selected_columns": {
      "x": "Country"
    }
  }' | jq
```

**Expected Error:**
```json
{
  "selected_columns": {
    "non_field_errors": ["selected_columns must include 'y' as a non-empty array."]
  }
}
```

### Test 2: Invalid Column Name
```bash
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "bar",
    "selected_columns": {
      "x": "NonExistentColumn",
      "y": ["Population"]
    }
  }' | jq
```

**Expected Error:**
```json
{
  "non_field_errors": ["Column 'NonExistentColumn' (x-axis) does not exist in the data schema."]
}
```

### Test 3: Pie Chart with Multiple Y Columns
```bash
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "pie",
    "selected_columns": {
      "x": "Country",
      "y": ["Population", "GDP"]
    }
  }' | jq
```

**Expected Error:**
```json
{
  "non_field_errors": ["Pie charts support only one y-axis column."]
}
```

### Test 4: Scatter Plot with Multiple Y Columns
```bash
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "scatter",
    "selected_columns": {
      "x": "GDP",
      "y": ["Population", "Sales"]
    }
  }' | jq
```

**Expected Error:**
```json
{
  "non_field_errors": ["Scatter plots require exactly one y-axis column."]
}
```

### Test 5: Duplicate POST (Should Fail)
```bash
# Try to create config again (should fail)
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "bar",
    "selected_columns": {
      "x": "Country",
      "y": ["Population"]
    }
  }' | jq
```

**Expected Error:**
```json
{
  "detail": "Chart configuration already exists for this project. Use PUT or PATCH to update."
}
```

---

## Step 8: Complete Workflow Test

```bash
# 1. Get or create project
PROJECT_ID=$(curl -s -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Chart Config Test", "description": "Testing chart configuration"}' | jq -r '.id')

# 2. Upload file (if not already done)
# ... (upload and ingest steps from Feature 4)

# 3. Create chart config
curl -X POST http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "bar",
    "selected_columns": {
      "x": "Country",
      "y": ["Population"],
      "groupBy": null,
      "label": "Country"
    }
  }' | jq

# 4. Get config
curl -X GET http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Update config
curl -X PATCH http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chart_type": "line",
    "selected_columns": {
      "x": "Year",
      "y": ["Sales", "Revenue"]
    }
  }' | jq

# 6. Verify version incremented
curl -X GET http://127.0.0.1:8000/api/projects/$PROJECT_ID/chart-config \
  -H "Authorization: Bearer $TOKEN" | jq '.version'
```

---

## Notes

- **POST**: Creates a new configuration (fails if one already exists)
- **PUT**: Updates entire configuration (creates if doesn't exist)
- **PATCH**: Partially updates configuration (creates if doesn't exist)
- **GET**: Retrieves configuration (404 if doesn't exist)
- **Version**: Automatically incremented on each update
- **Validation**: Columns are validated against the project's data schema
- **Chart Type Compatibility**: 
  - Pie charts: Only 1 y-column allowed
  - Scatter plots: Exactly 1 y-column required
  - Other types: Multiple y-columns allowed
```

---

## Notes for Testing

1. **Data Storage**: The current implementation only stores sample data. For the data grid to work fully, you need to modify the `DataIngestionView` to also store `full_data_json`.

2. **File Size Limits**: For large files, you might want to implement streaming or chunked storage instead of storing everything in JSON.

3. **Pagination**: The pagination is implemented on the server side. For very large datasets, you might want to implement database-level pagination.

4. **Validation**: The validation checks type compatibility but doesn't perform complex business logic validation.

5. **Concurrency**: If multiple users edit the same data simultaneously, there could be race conditions. Consider implementing optimistic locking for production use.

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{id}/data?page=1&page_size=100` | Get paginated data |
| PATCH | `/api/projects/{id}/data` | Apply data edits |

The data grid backend is ready for testing. The frontend integration can now be implemented using these endpoints.

---

# Feature 7: Chart Types and Live Preview

## Prerequisites
- Backend server running on `http://127.0.0.1:8000`
- A valid user account with access token
- A project with uploaded and parsed data (from Feature 4)
- Chart configuration created (from Feature 6)

---

## Step 1: Authentication (if not already done)

```bash
# Login to get access token
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/jwt/create \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "TestPassword123!"}' | jq -r '.access')

# Verify token is set
echo "Token: $TOKEN"
```

---

## Step 2: Get Data Preview (Default Limit: 1000 rows)

```bash
# Set your project ID (replace with actual project ID)
PROJECT_ID=1

# Get preview data (default limit: 1000 rows)
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "Country": "USA",
      "Population": 331000000,
      "GDP": 21400000
    },
    ...
  ],
  "schema": {
    "Country": "string",
    "Population": "number",
    "GDP": "number"
  },
  "total_rows": 5000,
  "preview_rows": 1000,
  "is_sampled": true,
  "sampling_message": "Showing 1000 of 5000 rows (sampled for preview)"
}
```

---

## Step 3: Get Data Preview with Custom Limit

```bash
# Get preview with custom limit (e.g., 500 rows)
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview?limit=500" \
  -H "Authorization: Bearer $TOKEN" | jq

# Get preview with maximum limit (10000 rows)
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview?limit=10000" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Response for small dataset (not sampled):**
```json
{
  "data": [
    {
      "Country": "USA",
      "Population": 331000000,
      "GDP": 21400000
    },
    ...
  ],
  "schema": {
    "Country": "string",
    "Population": "number",
    "GDP": "number"
  },
  "total_rows": 50,
  "preview_rows": 50,
  "is_sampled": false,
  "sampling_message": null
}
```

---

## Step 4: Test Sampling Behavior

### Test with Large Dataset
```bash
# If you have a dataset with more than 1000 rows, test sampling
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview?limit=100" \
  -H "Authorization: Bearer $TOKEN" | jq '.is_sampled, .sampling_message, .total_rows, .preview_rows'
```

**Expected Output:**
```json
true
"Showing 100 of 5000 rows (sampled for preview)"
5000
100
```

### Test with Small Dataset
```bash
# If you have a dataset with less than 1000 rows, verify no sampling
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview" \
  -H "Authorization: Bearer $TOKEN" | jq '.is_sampled, .sampling_message, .total_rows, .preview_rows'
```

**Expected Output:**
```json
false
null
50
50
```

---

## Step 5: Error Cases

### Test 1: Project Not Found
```bash
curl -X GET "http://127.0.0.1:8000/api/projects/99999/data/preview" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Error:**
```json
{
  "detail": "Project not found or you don't have permission to access it."
}
```

### Test 2: No Data Table
```bash
# Use a project without parsed data
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Error:**
```json
{
  "detail": "No data table found for this project. Please upload and parse a file first."
}
```

### Test 3: Invalid Limit Parameter
```bash
# Test with negative limit (should default to 1000)
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview?limit=-10" \
  -H "Authorization: Bearer $TOKEN" | jq '.preview_rows'

# Test with very large limit (should clamp to 10000)
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview?limit=99999" \
  -H "Authorization: Bearer $TOKEN" | jq '.preview_rows'

# Test with non-numeric limit (should default to 1000)
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview?limit=abc" \
  -H "Authorization: Bearer $TOKEN" | jq '.preview_rows'
```

---

## Step 6: Complete Workflow Test

```bash
# 1. Get or create project
PROJECT_ID=$(curl -s -X POST http://127.0.0.1:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Preview Test", "description": "Testing data preview"}' | jq -r '.id')

# 2. Upload and ingest file (steps from Feature 4)
# ... (upload and ingest)

# 3. Get preview data
curl -X GET "http://127.0.0.1:8000/api/projects/$PROJECT_ID/data/preview" \
  -H "Authorization: Bearer $TOKEN" | jq '{
    total_rows: .total_rows,
    preview_rows: .preview_rows,
    is_sampled: .is_sampled,
    sampling_message: .sampling_message,
    sample_data: .data[0:3]
  }'

# 4. Verify data includes edits (if any were made)
# The preview endpoint returns data with edits applied automatically
```

---

## Notes

- **Sampling Algorithm**: Uses evenly distributed sampling (not random) to ensure consistent results
- **Limit Range**: Limits are clamped between 1 and 10,000 rows
- **Edits Applied**: Preview data automatically includes any edits made to the data grid
- **Performance**: Sampling helps improve performance for large datasets when rendering charts
- **Use Case**: This endpoint is optimized for chart rendering, not data editing (use `/data` endpoint for editing)

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/{id}/data/preview?limit=1000` | Get preview data for chart rendering (sampled if large) |

The data preview backend is ready for testing. The frontend integration can now be implemented using this endpoint.

---

# CURL Commands for Testing Feature 9: PDF Export

## Prerequisites
- Backend server running on `http://127.0.0.1:8000`
- A valid user account (or create one using signup)
- A project with chart configuration set up
- A base64-encoded chart image (PNG format)

---

## Step 1: Authentication

Get your access token first (see authentication section above).

**Set your token:**
```bash
export ACCESS_TOKEN="your_access_token_here"
```

---

## Step 2: Create PDF Export

### Basic Export (A4 Portrait)

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/1/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "paper_size": "A4",
    "orientation": "portrait",
    "title": "My Chart Export"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "project": 1,
  "status": "done",
  "result_storage_key": "exports/1_a1b2c3d4.pdf",
  "error": null,
  "download_url": "/media/exports/1_a1b2c3d4.pdf",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:01Z"
}
```

### Export with A3 Landscape

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/1/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "paper_size": "A3",
    "orientation": "landscape",
    "title": "Large Format Chart"
  }'
```

### Export with Letter Size

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/1/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "paper_size": "LETTER",
    "orientation": "portrait"
  }'
```

### Export without Title (uses chart config title or project name)

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/1/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

---

## Step 3: Get Export Status

### Get Export Status

```bash
curl -X GET "http://127.0.0.1:8000/api/exports/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "project": 1,
  "status": "done",
  "result_storage_key": "exports/1_a1b2c3d4.pdf",
  "error": null,
  "download_url": "/media/exports/1_a1b2c3d4.pdf",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:01Z"
}
```

### Download PDF (if export is done)

```bash
curl -O "http://127.0.0.1:8000/media/exports/1_a1b2c3d4.pdf"
```

---

## Error Cases

### Missing chart_image

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/1/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paper_size": "A4"
  }'
```

**Expected:** 400 Bad Request
```json
{"detail": "chart_image is required."}
```

### Invalid paper size

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/1/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "paper_size": "A5"
  }'
```

**Expected:** 400 Bad Request
```json
{"detail": "Invalid paper_size. Must be one of: A4, A3, LETTER"}
```

### Invalid orientation

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/1/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "orientation": "diagonal"
  }'
```

**Expected:** 400 Bad Request
```json
{"detail": "Invalid orientation. Must be 'portrait' or 'landscape'"}
```

### Project without chart config

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/2/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**Expected:** 400 Bad Request
```json
{"detail": "No chart configuration found for this project. Please configure your chart first."}
```

### Invalid image data

```bash
curl -X POST "http://127.0.0.1:8000/api/projects/1/export/pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart_image": "invalid_base64_data"
  }'
```

**Expected:** 400 Bad Request
```json
{"detail": "Invalid image data: ..."}
```

### Get non-existent export

```bash
curl -X GET "http://127.0.0.1:8000/api/exports/999" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:** 404 Not Found
```json
{"detail": "Export job not found."}
```

### Get export for project you don't own

```bash
curl -X GET "http://127.0.0.1:8000/api/exports/5" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected:** 403 Forbidden
```json
{"detail": "You don't have permission to access this export job."}
```

---

## Testing Notes

1. **Getting a real chart image for testing:**
   - You can use a chart from your frontend (ECharts can export to base64)
   - Or create a simple test image and convert to base64:
     ```bash
     python -c "import base64; print(base64.b64encode(open('test.png', 'rb').read()).decode())"
     ```

2. **Download the PDF:**
   - Use the `download_url` from the response to download the PDF:
     ```bash
     curl -O "http://127.0.0.1:8000/media/exports/1_a1b2c3d4.pdf"
     ```

3. **PDF Storage:**
   - PDFs are stored in `media/exports/` directory
   - Make sure the directory exists or Django will create it automatically

4. **Export Jobs:**
   - Export jobs are created synchronously (no background job queue needed)
   - Status will be "done" immediately if successful, "error" if failed

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/{id}/export/pdf` | Create PDF export job from chart image |
| GET | `/api/exports/{id}` | Get export job status and download URL |

The PDF export backend is ready for testing. The frontend integration can now be implemented using these endpoints.
