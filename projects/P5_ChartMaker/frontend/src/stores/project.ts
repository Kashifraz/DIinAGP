import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/services/api";
import type { Project, CreateProjectData, UpdateProjectData } from "@/types/project";
import type { DataTable, IngestFileData, DataGridResponse, SaveResult } from "@/types/datatable";
import type { UploadedFile } from "@/types/file";
import type { ChartConfig, CreateChartConfigData, UpdateChartConfigData, DataPreviewResponse, ExportJob, CreateExportData } from "@/types/chart";

export const useProjectStore = defineStore("project", () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const uploadedFiles = ref<UploadedFile[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all projects
  async function fetchProjects(status?: "active" | "archived") {
    loading.value = true;
    error.value = null;
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get<Project[]>("/api/projects/", { params });
      projects.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || "Failed to fetch projects";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Fetch a single project by ID
  async function fetchProject(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<Project>(`/api/projects/${id}/`);
      currentProject.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || "Failed to fetch project";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Create a new project
  async function createProject(data: CreateProjectData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.post<Project>("/api/projects/", {
        name: data.name,
        description: data.description || "",
        status: data.status || "active",
      });
      projects.value.unshift(response.data); // Add to beginning of list
      return response.data;
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        // Handle validation errors
        const fieldErrors = Object.keys(errorData)
          .filter((key) => key !== "detail")
          .map((key) => {
            const value = errorData[key];
            if (Array.isArray(value)) {
              return `${key}: ${value.join(", ")}`;
            }
            return `${key}: ${value}`;
          });

        if (fieldErrors.length > 0) {
          error.value = fieldErrors.join("; ");
        } else {
          error.value = errorData.detail || "Failed to create project";
        }
      } else {
        error.value = "Failed to create project";
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Update a project
  async function updateProject(id: number, data: UpdateProjectData) {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.patch<Project>(`/api/projects/${id}/`, data);
      
      // Update in projects list
      const index = projects.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        projects.value[index] = response.data;
      }
      
      // Update current project if it's the one being updated
      if (currentProject.value?.id === id) {
        currentProject.value = response.data;
      }
      
      return response.data;
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const fieldErrors = Object.keys(errorData)
          .filter((key) => key !== "detail")
          .map((key) => {
            const value = errorData[key];
            if (Array.isArray(value)) {
              return `${key}: ${value.join(", ")}`;
            }
            return `${key}: ${value}`;
          });

        if (fieldErrors.length > 0) {
          error.value = fieldErrors.join("; ");
        } else {
          error.value = errorData.detail || "Failed to update project";
        }
      } else {
        error.value = "Failed to update project";
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Delete a project
  async function deleteProject(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await apiClient.delete(`/api/projects/${id}/`);
      
      // Remove from projects list
      projects.value = projects.value.filter((p) => p.id !== id);
      
      // Clear current project if it's the one being deleted
      if (currentProject.value?.id === id) {
        currentProject.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || "Failed to delete project";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Clear error
  function clearError() {
    error.value = null;
  }

  // Clear current project
  function clearCurrentProject() {
    currentProject.value = null;
    uploadedFiles.value = [];
    // Clear any pending edits when switching projects
    pendingEdits.value = {};
    editErrors.value = {};
  }

  // Fetch uploaded files for a project
  async function fetchUploadedFiles(projectId: number) {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get<UploadedFile[]>(
        `/api/projects/${projectId}/upload`
      );
      uploadedFiles.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || "Failed to fetch uploaded files";
      uploadedFiles.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Add uploaded file to list (called after successful upload)
  function addUploadedFile(file: UploadedFile) {
    uploadedFiles.value.unshift(file); // Add to beginning
  }

  // Data ingestion state
  const dataTable = ref<DataTable | null>(null);
  const ingestionLoading = ref(false);
  const ingestionError = ref<string | null>(null);

  // Data grid state
  const gridData = ref<Record<string, any>[]>([]);
  const gridSchema = ref<Record<string, string>>({});
  const gridPagination = ref({
    page: 1,
    page_size: 100,
    total_rows: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });
  const gridLoading = ref(false);
  const gridError = ref<string | null>(null);

  // Edit tracking
  const pendingEdits = ref<Record<string, Record<string, any>>>({}); // { "row_index": { "column": "new_value" } }
  const editErrors = ref<Record<string, Record<string, string>>>({}); // { "row_index": { "column": "error" } }
  const savingEdits = ref(false);

  async function ingestFile(projectId: number, data?: IngestFileData) {
    ingestionLoading.value = true;
    ingestionError.value = null;
    try {
      const response = await apiClient.post<DataTable>(
        `/api/projects/${projectId}/ingest`,
        data || {}
      );
      dataTable.value = response.data;
      return { success: true, dataTable: response.data };
    } catch (err: any) {
      const errorDetail =
        err.response?.data?.detail || "Failed to ingest file";
      ingestionError.value = errorDetail;
      return { success: false, error: errorDetail };
    } finally {
      ingestionLoading.value = false;
    }
  }

  async function fetchDataTable(projectId: number) {
    // For now, we'll fetch the latest data table by attempting ingestion
    // In the future, we might have a GET endpoint for data tables
    return ingestFile(projectId);
  }

  async function fetchGridData(projectId: number, page: number = 1, pageSize: number = 100) {
    gridLoading.value = true;
    gridError.value = null;
    try {
      // First try to get full data from the data endpoint
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: pageSize.toString(),
        });

        const response = await apiClient.get<DataGridResponse>(
          `/api/projects/${projectId}/data?${params}`
        );

        gridData.value = response.data.data;
        gridSchema.value = response.data.schema;
        gridPagination.value = response.data.pagination;

        return response.data;
      } catch (err: any) {
        // If full data endpoint fails, try to use sample data from dataTable
        if (dataTable.value && dataTable.value.sample_json) {
          console.log('Full data not available, using sample data');
          const sampleData = Array.isArray(dataTable.value.sample_json) 
            ? dataTable.value.sample_json 
            : [];
          
          gridData.value = sampleData;
          gridSchema.value = dataTable.value.schema_json || {};
          gridPagination.value = {
            page: 1,
            page_size: sampleData.length,
            total_rows: dataTable.value.num_rows || sampleData.length,
            total_pages: 1,
            has_next: false,
            has_previous: false,
          };
          
          return {
            data: sampleData,
            schema: gridSchema.value,
            pagination: gridPagination.value,
          };
        }
        throw err;
      }
    } catch (err: any) {
      const errorDetail =
        err.response?.data?.detail || "Failed to fetch grid data";
      gridError.value = errorDetail;
      throw err;
    } finally {
      gridLoading.value = false;
    }
  }

  function updateCellValue(absoluteRowIndex: number, columnName: string, newValue: any) {
    // Store the edit locally using absolute row index
    const rowKey = absoluteRowIndex.toString();
    if (!pendingEdits.value[rowKey]) {
      pendingEdits.value[rowKey] = {};
    }
    pendingEdits.value[rowKey][columnName] = newValue;

    console.log('updateCellValue called:', {
      absoluteRowIndex,
      columnName,
      newValue,
      pendingEdits: pendingEdits.value[rowKey]
    });

    // Clear any previous error for this cell
    if (editErrors.value[rowKey]?.[columnName]) {
      delete editErrors.value[rowKey][columnName];
      if (Object.keys(editErrors.value[rowKey]).length === 0) {
        delete editErrors.value[rowKey];
      }
    }

    // Update the local display data if this row is currently visible
    // Calculate which page this row is on
    const pageSize = gridPagination.value.page_size;
    const page = Math.floor(absoluteRowIndex / pageSize) + 1;
    
    // Only update local display if we're on the correct page
    if (page === gridPagination.value.page) {
      const relativeIndex = absoluteRowIndex % pageSize;
      if (gridData.value[relativeIndex]) {
        gridData.value[relativeIndex][columnName] = newValue;
      }
    }
  }

  async function saveEdits(projectId: number): Promise<SaveResult> {
    if (Object.keys(pendingEdits.value).length === 0) {
      console.log('No pending edits to save');
      return { success: true };
    }

    console.log('Saving edits to backend:', {
      projectId,
      editsCount: Object.keys(pendingEdits.value).length,
      edits: pendingEdits.value
    });

    savingEdits.value = true;
    try {
      const response = await apiClient.patch(
        `/api/projects/${projectId}/data`,
        { edits: pendingEdits.value }
      );

      console.log('Backend response:', response.data);

      // Clear successful edits and errors
      pendingEdits.value = {};
      editErrors.value = {};

      // Reload grid data to show saved changes from backend
      console.log('Reloading grid data after save...');
      await fetchGridData(projectId, gridPagination.value.page, gridPagination.value.page_size);
      console.log('Grid data reloaded:', {
        dataLength: gridData.value.length,
        firstRow: gridData.value[0]
      });

      return {
        success: true,
        applied_edits: response.data.applied_edits
      };
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.errors) {
        // Handle validation errors
        editErrors.value = {};
        err.response.data.errors.forEach((error: string) => {
          // Parse error format: "Row {row_index}, column '{column_name}': {error}"
          const match = error.match(/Row (\d+), column '([^']+)': (.+)/);
          if (match) {
            const [, rowIndex, columnName, errorMsg] = match;
            if (!editErrors.value[rowIndex]) {
              editErrors.value[rowIndex] = {};
            }
            editErrors.value[rowIndex][columnName] = errorMsg;
          }
        });

        return {
          success: false,
          errors: err.response.data.errors
        };
      }

      return {
        success: false,
        errors: [err.response?.data?.detail || "Failed to save edits"]
      };
    } finally {
      savingEdits.value = false;
    }
  }

  function discardEdits() {
    // Revert local changes by refetching data
    pendingEdits.value = {};
    editErrors.value = {};
  }

  function clearDataTable() {
    dataTable.value = null;
    ingestionError.value = null;
  }

    function clearGridData() {
      gridData.value = [];
      gridSchema.value = {};
      gridPagination.value = {
        page: 1,
        page_size: 100,
        total_rows: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      };
      gridError.value = null;
      pendingEdits.value = {};
      editErrors.value = {};
    }

    // Chart configuration state
    const chartConfig = ref<ChartConfig | null>(null);
    const chartConfigLoading = ref(false);
    const chartConfigError = ref<string | null>(null);

    async function fetchChartConfig(projectId: number) {
      chartConfigLoading.value = true;
      chartConfigError.value = null;
      try {
        const response = await apiClient.get<ChartConfig>(
          `/api/projects/${projectId}/chart-config`
        );
        chartConfig.value = response.data;
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          // No config exists yet, that's ok
          chartConfig.value = null;
          chartConfigError.value = null;
          return null;
        }
        chartConfigError.value = err.response?.data?.detail || "Failed to fetch chart configuration";
        chartConfig.value = null;
        throw err;
      } finally {
        chartConfigLoading.value = false;
      }
    }

    async function createChartConfig(projectId: number, data: CreateChartConfigData) {
      chartConfigLoading.value = true;
      chartConfigError.value = null;
      try {
        const response = await apiClient.post<ChartConfig>(
          `/api/projects/${projectId}/chart-config`,
          data
        );
        chartConfig.value = response.data;
        return response.data;
      } catch (err: any) {
        const errorData = err.response?.data;
        if (errorData) {
          const fieldErrors = Object.keys(errorData)
            .filter((key) => key !== "detail")
            .map((key) => {
              const value = errorData[key];
              if (Array.isArray(value)) {
                return `${key}: ${value.join(", ")}`;
              }
              if (typeof value === "object") {
                return `${key}: ${JSON.stringify(value)}`;
              }
              return `${key}: ${value}`;
            });
          if (fieldErrors.length > 0) {
            chartConfigError.value = fieldErrors.join("; ");
          } else {
            chartConfigError.value = errorData.detail || "Failed to create chart configuration";
          }
        } else {
          chartConfigError.value = "Failed to create chart configuration";
        }
        throw err;
      } finally {
        chartConfigLoading.value = false;
      }
    }

    async function updateChartConfig(projectId: number, data: UpdateChartConfigData) {
      chartConfigLoading.value = true;
      chartConfigError.value = null;
      try {
        const response = await apiClient.patch<ChartConfig>(
          `/api/projects/${projectId}/chart-config`,
          data
        );
        chartConfig.value = response.data; // Update local state
        return response.data;
      } catch (err: any) {
        const errorData = err.response?.data;
        if (errorData) {
          const fieldErrors = Object.keys(errorData)
            .filter((key) => key !== "detail")
            .map((key) => {
              const value = errorData[key];
              if (Array.isArray(value)) {
                return `${key}: ${value.join(", ")}`;
              }
              if (typeof value === "object") {
                return `${key}: ${JSON.stringify(value)}`;
              }
              return `${key}: ${value}`;
            });
          if (fieldErrors.length > 0) {
            chartConfigError.value = fieldErrors.join("; ");
          } else {
            chartConfigError.value = errorData.detail || "Failed to update chart configuration";
          }
        } else {
          chartConfigError.value = "Failed to update chart configuration";
        }
        throw err;
      } finally {
        chartConfigLoading.value = false;
      }
    }

    function clearChartConfig() {
      chartConfig.value = null;
      chartConfigError.value = null;
    }

    // Data preview state (for chart rendering)
    const previewData = ref<DataPreviewResponse | null>(null);
    const previewLoading = ref(false);
    const previewError = ref<string | null>(null);

    async function fetchPreviewData(projectId: number, limit: number = 1000) {
      previewLoading.value = true;
      previewError.value = null;
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });
        const response = await apiClient.get<DataPreviewResponse>(
          `/api/projects/${projectId}/data/preview?${params}`
        );
        previewData.value = response.data;
        return response.data;
      } catch (err: any) {
        previewError.value = err.response?.data?.detail || "Failed to fetch preview data";
        previewData.value = null;
        throw err;
      } finally {
        previewLoading.value = false;
      }
    }

  function clearPreviewData() {
    previewData.value = null;
    previewError.value = null;
  }

  // PDF Export state
  const exportLoading = ref(false);
  const exportError = ref<string | null>(null);
  const currentExport = ref<ExportJob | null>(null);

  async function createExport(projectId: number, data: CreateExportData) {
    exportLoading.value = true;
    exportError.value = null;
    try {
      const response = await apiClient.post<ExportJob>(
        `/api/projects/${projectId}/export/pdf`,
        data
      );
      currentExport.value = response.data;
      return response.data;
    } catch (err: any) {
      const errorData = err.response?.data;
      exportError.value = errorData?.detail || "Failed to create export";
      throw err;
    } finally {
      exportLoading.value = false;
    }
  }

  async function getExportStatus(exportId: number) {
    exportLoading.value = true;
    exportError.value = null;
    try {
      const response = await apiClient.get<ExportJob>(
        `/api/exports/${exportId}`
      );
      currentExport.value = response.data;
      return response.data;
    } catch (err: any) {
      const errorData = err.response?.data;
      exportError.value = errorData?.detail || "Failed to get export status";
      throw err;
    } finally {
      exportLoading.value = false;
    }
  }

  function clearExport() {
    currentExport.value = null;
    exportError.value = null;
  }

  return {
    projects,
    currentProject,
    uploadedFiles,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    clearError,
    clearCurrentProject,
    fetchUploadedFiles,
    addUploadedFile,
    // Data ingestion
    dataTable,
    ingestionLoading,
    ingestionError,
    ingestFile,
    fetchDataTable,
    clearDataTable,
    // Data grid
    gridData,
    gridSchema,
    gridPagination,
    gridLoading,
    gridError,
    pendingEdits,
    editErrors,
    savingEdits,
    fetchGridData,
    updateCellValue,
    saveEdits,
    discardEdits,
    clearGridData,
    // Chart configuration
    chartConfig,
    chartConfigLoading,
    chartConfigError,
    fetchChartConfig,
    createChartConfig,
    updateChartConfig,
    clearChartConfig,
    // Data preview
    previewData,
    previewLoading,
    previewError,
    fetchPreviewData,
    clearPreviewData,
    // PDF Export
    exportLoading,
    exportError,
    currentExport,
    createExport,
    getExportStatus,
    clearExport,
  };
});

