import apiClient from "@/services/api";
import type { FileUploadResponse } from "@/types/file";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a file to a project
 * @param projectId - The project ID
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the uploaded file data
 */
export async function uploadFile(
  projectId: number,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<FileUploadResponse>(
    `/api/projects/${projectId}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
          });
        }
      },
    }
  );

  return response.data;
}

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50 MB
  const allowedExtensions = [".csv", ".xlsx"];
  const allowedMimeTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (50 MB)`,
    };
  }

  // Check file extension
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type '${fileExtension}' is not allowed. Allowed types: ${allowedExtensions.join(", ")}`,
    };
  }

  // Check MIME type (if available)
  if (file.type && !allowedMimeTypes.includes(file.type)) {
    // Some browsers might not set MIME type correctly, so we'll still allow if extension is valid
    // But warn the user
  }

  return { valid: true };
}

