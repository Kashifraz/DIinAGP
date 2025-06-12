export interface UploadedFile {
  id: number;
  project: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  storage_key: string;
  checksum: string;
  created_at: string;
}

export interface FileUploadResponse {
  id: number;
  project: number;
  filename: string;
  content_type: string;
  size_bytes: number;
  storage_key: string;
  checksum: string;
  created_at: string;
}

