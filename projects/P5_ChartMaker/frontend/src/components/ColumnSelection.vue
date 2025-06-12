<template>
  <div class="column-selection-container">
    <div class="header">
      <h3>Chart Configuration</h3>
      <p class="subtitle">Select columns for your chart</p>
    </div>

    <div v-if="chartConfigLoading" class="loading-state">
      <ArrowPathIcon class="loading-spinner" />
      <p>Loading configuration...</p>
    </div>

    <div v-else-if="chartConfigError" class="error-state">
      <p class="error-message">{{ chartConfigError }}</p>
      <button @click="handleRetry" class="retry-button">Retry</button>
    </div>

    <form v-else @submit.prevent="handleSave" class="config-form">
      <!-- Chart Type Selection -->
      <div class="form-section">
        <label for="chart-type" class="form-label">
          Chart Type <span class="required">*</span>
        </label>
        <select
          id="chart-type"
          v-model="localConfig.chart_type"
          @change="handleChartTypeChange"
          class="form-select"
          required
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="area">Area Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="scatter">Scatter Plot</option>
        </select>
        <p class="form-hint">
          {{ getChartTypeHint(localConfig.chart_type) }}
        </p>
      </div>

      <!-- X-Axis Column -->
      <div class="form-section">
        <label for="x-column" class="form-label">
          X-Axis Column <span class="required">*</span>
        </label>
        <select
          id="x-column"
          v-model="localConfig.selected_columns.x"
          class="form-select"
          required
        >
          <option value="">-- Select X-axis column --</option>
          <option v-for="column in availableColumns" :key="column" :value="column">
            {{ column }} ({{ schema[column] }})
          </option>
        </select>
      </div>

      <!-- Y-Axis Columns -->
      <div class="form-section">
        <label class="form-label">
          Y-Axis Columns <span class="required">*</span>
        </label>
        <div class="checkbox-group">
          <label
            v-for="column in availableColumns"
            :key="column"
            class="checkbox-label"
          >
            <input
              type="checkbox"
              :value="column"
              :checked="localConfig.selected_columns.y.includes(column)"
              @change="handleYColumnChange(column, $event)"
              :disabled="isYColumnDisabled(column)"
            />
            <span>{{ column }} ({{ schema[column] }})</span>
          </label>
        </div>
        <p v-if="localConfig.selected_columns.y.length === 0" class="form-error">
          At least one Y-axis column is required.
        </p>
        <p v-else class="form-hint">
          Selected: {{ localConfig.selected_columns.y.join(", ") }}
        </p>
      </div>

      <!-- Group By Column (Optional) -->
      <div class="form-section">
        <label for="group-by-column" class="form-label">
          Group By Column (Optional)
        </label>
        <select
          id="group-by-column"
          v-model="localConfig.selected_columns.groupBy"
          class="form-select"
        >
          <option :value="null">-- None --</option>
          <option v-for="column in availableColumns" :key="column" :value="column">
            {{ column }} ({{ schema[column] }})
          </option>
        </select>
        <p class="form-hint">
          Use this column to group data series.
        </p>
      </div>

      <!-- Label Column (Optional) -->
      <div class="form-section">
        <label for="label-column" class="form-label">
          Label Column (Optional)
        </label>
        <select
          id="label-column"
          v-model="localConfig.selected_columns.label"
          class="form-select"
        >
          <option :value="null">-- None --</option>
          <option v-for="column in availableColumns" :key="column" :value="column">
            {{ column }} ({{ schema[column] }})
          </option>
        </select>
        <p class="form-hint">
          Use this column for data point labels.
        </p>
      </div>

      <!-- Validation Errors -->
      <div v-if="validationErrors.length > 0" class="validation-errors">
        <h4>Validation Errors:</h4>
        <ul>
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <!-- Save Button -->
      <div class="form-actions">
        <button
          type="submit"
          :disabled="!isValid || saving"
          class="save-button"
        >
          {{ saving ? "Saving..." : "Save Configuration" }}
        </button>
        <button
          type="button"
          @click="handleReset"
          :disabled="saving"
          class="reset-button"
        >
          Reset
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="saveSuccess" class="success-message">
        <CheckCircleIcon class="success-icon" />
        <span>Configuration saved successfully!</span>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useProjectStore } from "@/stores/project";
import type { ChartType, SelectedColumns, CreateChartConfigData } from "@/types/chart";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";

interface Props {
  projectId: number;
  schema: Record<string, string>;
}

const props = defineProps<Props>();

const projectStore = useProjectStore();

// Local state
const localConfig = ref<CreateChartConfigData>({
  chart_type: "bar",
  selected_columns: {
    x: "",
    y: [],
    groupBy: null,
    label: null,
  },
});

const saving = ref(false);
const saveSuccess = ref(false);
const validationErrors = ref<string[]>([]);

// Computed properties
const chartConfigLoading = computed(() => projectStore.chartConfigLoading);
const chartConfigError = computed(() => projectStore.chartConfigError);
const chartConfig = computed(() => projectStore.chartConfig);

const availableColumns = computed(() => Object.keys(props.schema));

const isValid = computed(() => {
  return (
    localConfig.value.selected_columns.x !== "" &&
    localConfig.value.selected_columns.y.length > 0 &&
    validationErrors.value.length === 0
  );
});

// Methods
function getChartTypeHint(chartType: ChartType): string {
  const hints: Record<ChartType, string> = {
    bar: "Good for comparing categories. Supports multiple Y-axis columns.",
    line: "Good for showing trends over time. Supports multiple Y-axis columns.",
    area: "Similar to line chart with filled areas. Supports multiple Y-axis columns.",
    pie: "Good for showing proportions. Only supports one Y-axis column.",
    scatter: "Good for showing relationships between two variables. Requires exactly one Y-axis column.",
  };
  return hints[chartType] || "";
}

function isYColumnDisabled(column: string): boolean {
  const chartType = localConfig.value.chart_type;
  const currentYCount = localConfig.value.selected_columns.y.length;
  const isSelected = localConfig.value.selected_columns.y.includes(column);

  if (chartType === "pie") {
    // Pie charts: only allow 1 Y column
    return currentYCount >= 1 && !isSelected;
  } else if (chartType === "scatter") {
    // Scatter plots: exactly 1 Y column
    return currentYCount >= 1 && !isSelected;
  }
  return false;
}

function handleChartTypeChange() {
  const chartType = localConfig.value.chart_type;
  const currentY = localConfig.value.selected_columns.y;

  // Enforce chart type rules
  if (chartType === "pie" && currentY.length > 1) {
    // Keep only the first Y column
    localConfig.value.selected_columns.y = [currentY[0]];
  } else if (chartType === "scatter" && currentY.length !== 1) {
    // Keep only the first Y column if multiple, or clear if none
    localConfig.value.selected_columns.y = currentY.length > 0 ? [currentY[0]] : [];
  }

  validateConfiguration();
}

function handleYColumnChange(column: string, event: Event) {
  const target = event.target as HTMLInputElement;
  const currentY = [...localConfig.value.selected_columns.y];

  if (target.checked) {
    // Add column
    if (!currentY.includes(column)) {
      currentY.push(column);
    }
  } else {
    // Remove column
    const index = currentY.indexOf(column);
    if (index > -1) {
      currentY.splice(index, 1);
    }
  }

  localConfig.value.selected_columns.y = currentY;
  validateConfiguration();
}

function validateConfiguration() {
  validationErrors.value = [];

  const { chart_type, selected_columns } = localConfig.value;

  // Validate X column
  if (!selected_columns.x) {
    validationErrors.value.push("X-axis column is required.");
  } else if (!availableColumns.value.includes(selected_columns.x)) {
    validationErrors.value.push(`X-axis column "${selected_columns.x}" does not exist in the schema.`);
  }

  // Validate Y columns
  if (selected_columns.y.length === 0) {
    validationErrors.value.push("At least one Y-axis column is required.");
  } else {
    // Check if all Y columns exist
    for (const yCol of selected_columns.y) {
      if (!availableColumns.value.includes(yCol)) {
        validationErrors.value.push(`Y-axis column "${yCol}" does not exist in the schema.`);
      }
    }

    // Chart type specific validation
    if (chart_type === "pie" && selected_columns.y.length > 1) {
      validationErrors.value.push("Pie charts support only one Y-axis column.");
    } else if (chart_type === "scatter" && selected_columns.y.length !== 1) {
      validationErrors.value.push("Scatter plots require exactly one Y-axis column.");
    }
  }

  // Validate groupBy if provided
  if (selected_columns.groupBy && !availableColumns.value.includes(selected_columns.groupBy)) {
    validationErrors.value.push(`Group By column "${selected_columns.groupBy}" does not exist in the schema.`);
  }

  // Validate label if provided
  if (selected_columns.label && !availableColumns.value.includes(selected_columns.label)) {
    validationErrors.value.push(`Label column "${selected_columns.label}" does not exist in the schema.`);
  }
}

async function handleSave() {
  if (!isValid.value) {
    validateConfiguration();
    return;
  }

  saving.value = true;
  saveSuccess.value = false;

  try {
    if (chartConfig.value) {
      // Update existing config
      await projectStore.updateChartConfig(props.projectId, localConfig.value);
    } else {
      // Create new config
      await projectStore.createChartConfig(props.projectId, localConfig.value);
    }

    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error("Failed to save chart configuration:", error);
  } finally {
    saving.value = false;
  }
}

function handleReset() {
  if (chartConfig.value) {
    // Reset to saved config
    localConfig.value = {
      chart_type: chartConfig.value.chart_type,
      selected_columns: { ...chartConfig.value.selected_columns },
      style: chartConfig.value.style,
    };
  } else {
    // Reset to defaults
    localConfig.value = {
      chart_type: "bar",
      selected_columns: {
        x: "",
        y: [],
        groupBy: null,
        label: null,
      },
    };
  }
  validationErrors.value = [];
}

function handleRetry() {
  projectStore.fetchChartConfig(props.projectId);
}

// Watch for chart config changes
watch(
  () => chartConfig.value,
  (newConfig) => {
    if (newConfig) {
      localConfig.value = {
        chart_type: newConfig.chart_type,
        selected_columns: { ...newConfig.selected_columns },
        style: newConfig.style,
      };
    }
  },
  { immediate: true }
);

// Validate on mount and when config changes
watch(
  () => localConfig.value,
  () => {
    validateConfiguration();
  },
  { deep: true }
);

onMounted(async () => {
  // Fetch existing config
  await projectStore.fetchChartConfig(props.projectId);
  validateConfiguration();
});
</script>

<style scoped>
.column-selection-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 24px;
}

.header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.5rem;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  color: #667eea;
  animation: spin 1s linear infinite;
}

.error-message {
  color: #dc3545;
  margin-bottom: 16px;
}

.retry-button {
  padding: 10px 20px;
  border: 1px solid #4a90e2;
  background: #4a90e2;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #357abd;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.required {
  color: #dc3545;
}

.form-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

.form-error {
  margin: 0;
  font-size: 0.85rem;
  color: #dc3545;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #f8f9fa;
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.checkbox-label span {
  font-size: 0.9rem;
  color: #555;
}

.validation-errors {
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
}

.validation-errors h4 {
  margin: 0 0 8px 0;
  color: #856404;
  font-size: 1rem;
}

.validation-errors ul {
  margin: 0;
  padding-left: 20px;
  color: #856404;
}

.validation-errors li {
  margin: 4px 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.save-button {
  padding: 12px 24px;
  border: none;
  background: #28a745;
  color: white;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #218838;
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-button {
  padding: 12px 24px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #bbb;
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message {
  padding: 12px 16px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #155724;
}

@media (max-width: 768px) {
  .column-selection-container {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .save-button,
  .reset-button {
    width: 100%;
  }
}
</style>

