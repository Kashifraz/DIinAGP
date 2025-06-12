/**
 * TypeScript interfaces for DataTable and related types.
 */

export interface DataTable {
  id: number;
  project: number;
  source_file: number;
  source_file_name: string;
  schema_json: Record<string, string>; // Column name -> type mapping
  num_rows: number;
  sample_json: Record<string, any>[]; // Array of sample row objects
  created_at: string;
}

export interface IngestFileData {
  uploaded_file_id?: number;
}

export type ColumnType = "string" | "number" | "boolean" | "date";

export interface SchemaColumn {
  name: string;
  type: ColumnType;
}

export interface DataGridResponse {
  data: Record<string, any>[];
  schema: Record<string, ColumnType>;
  pagination: {
    page: number;
    page_size: number;
    total_rows: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface DataEdit {
  row_index: number;
  column_name: string;
  new_value: any;
}

export interface BulkEditData {
  edits: Record<string, Record<string, any>>; // { "row_index": { "column_name": "new_value" } }
}

export interface EditValidationError {
  row_index: number;
  column_name: string;
  error: string;
}

export interface SaveResult {
  success: boolean;
  applied_edits?: Record<string, Record<string, any>>;
  errors?: string[];
}

