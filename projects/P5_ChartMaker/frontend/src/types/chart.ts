/**
 * TypeScript interfaces for Chart Configuration and related types.
 */

export type ChartType = "bar" | "line" | "area" | "pie" | "scatter";

export interface SelectedColumns {
  x: string; // X-axis column name
  y: string[]; // Y-axis column names (array)
  groupBy?: string | null; // Optional grouping column
  label?: string | null; // Optional label column
}

export interface ChartStyle {
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  legendPosition?: "top" | "bottom" | "left" | "right";
  gridlines?: boolean;
  tooltips?: boolean;
  dataLabels?: boolean;
}

export interface ChartConfig {
  id: number;
  project: number;
  chart_type: ChartType;
  selected_columns: SelectedColumns;
  style: ChartStyle;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChartConfigData {
  chart_type: ChartType;
  selected_columns: SelectedColumns;
  style?: ChartStyle;
}

export interface UpdateChartConfigData {
  chart_type?: ChartType;
  selected_columns?: SelectedColumns;
  style?: ChartStyle;
}

export interface DataPreviewResponse {
  data: Record<string, any>[];
  schema: Record<string, string>;
  total_rows: number;
  preview_rows: number;
  is_sampled: boolean;
  sampling_message: string | null;
}

export type ExportStatus = "pending" | "running" | "done" | "error";

export type PaperSize = "A4" | "A3" | "LETTER";

export type Orientation = "portrait" | "landscape";

export interface ExportJob {
  id: number;
  project: number;
  status: ExportStatus;
  result_storage_key: string | null;
  error: string | null;
  download_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExportData {
  chart_image: string; // Base64 encoded image data URL
  paper_size?: PaperSize;
  orientation?: Orientation;
  title?: string;
}

