<template>
  <div class="style-panel-container">
    <div class="header">
      <h3>Chart Styling</h3>
      <p class="subtitle">Customize your chart appearance</p>
      <div v-if="saveStatus === 'saving'" class="save-status saving">
        <ArrowPathIcon class="spinner" />
        <span>Saving...</span>
      </div>
      <div v-else-if="saveStatus === 'saved'" class="save-status saved">
        <CheckCircleIcon class="status-icon" />
        <span>Saved</span>
      </div>
      <div v-else-if="saveStatus === 'error'" class="save-status error">
        <XCircleIcon class="status-icon" />
        <span>Save failed</span>
      </div>
    </div>

    <div v-if="!chartConfig" class="empty-state">
      <p>Please configure your chart columns first.</p>
    </div>

    <form v-else @submit.prevent="handleSave" class="style-form">
      <!-- Title and Subtitle -->
      <div class="form-section">
        <label for="chart-title" class="form-label">Chart Title</label>
        <input
          id="chart-title"
          v-model="localStyle.title"
          @input="handleStyleChange"
          type="text"
          class="form-input"
          placeholder="Enter chart title"
          maxlength="200"
        />
      </div>

      <div class="form-section">
        <label for="chart-subtitle" class="form-label">Subtitle</label>
        <input
          id="chart-subtitle"
          v-model="localStyle.subtitle"
          @input="handleStyleChange"
          type="text"
          class="form-input"
          placeholder="Enter subtitle (optional)"
          maxlength="200"
        />
      </div>

      <!-- Axis Labels -->
      <div class="form-section">
        <label for="x-axis-label" class="form-label">X-Axis Label</label>
        <input
          id="x-axis-label"
          v-model="localStyle.xAxisLabel"
          @input="handleStyleChange"
          type="text"
          class="form-input"
          placeholder="Enter X-axis label"
          maxlength="100"
        />
      </div>

      <div class="form-section">
        <label for="y-axis-label" class="form-label">Y-Axis Label</label>
        <input
          id="y-axis-label"
          v-model="localStyle.yAxisLabel"
          @input="handleStyleChange"
          type="text"
          class="form-input"
          placeholder="Enter Y-axis label"
          maxlength="100"
        />
      </div>

      <!-- Legend Position -->
      <div class="form-section">
        <label for="legend-position" class="form-label">Legend Position</label>
        <select
          id="legend-position"
          v-model="localStyle.legendPosition"
          @change="handleStyleChange"
          class="form-select"
        >
          <option :value="undefined">Default</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>

      <!-- Color Palette -->
      <div class="form-section">
        <label class="form-label">Color Palette</label>
        <div class="colors-container">
          <div
            v-for="(color, index) in colorPalette"
            :key="index"
            class="color-item"
          >
            <input
              :id="`color-${index}`"
              v-model="colorPalette[index]"
              @input="handleColorChange"
              type="color"
              class="color-input"
            />
            <button
              v-if="colorPalette.length > 1"
              @click="removeColor(index)"
              type="button"
              class="remove-color-btn"
              title="Remove color"
            >
              <XMarkIcon class="remove-icon" />
            </button>
          </div>
          <button
            v-if="colorPalette.length < 10"
            @click="addColor"
            type="button"
            class="add-color-btn"
            title="Add color"
          >
            + Add Color
          </button>
        </div>
        <p class="form-hint">Click color swatches to customize the palette</p>
      </div>

      <!-- Toggle Options -->
      <div class="form-section">
        <label class="form-label">Display Options</label>
        <div class="toggle-group">
          <label class="toggle-label">
            <input
              v-model="localStyle.gridlines"
              @change="handleStyleChange"
              type="checkbox"
              class="toggle-checkbox"
            />
            <span>Show Gridlines</span>
          </label>
          <label class="toggle-label">
            <input
              v-model="localStyle.tooltips"
              @change="handleStyleChange"
              type="checkbox"
              class="toggle-checkbox"
            />
            <span>Show Tooltips</span>
          </label>
          <label class="toggle-label">
            <input
              v-model="localStyle.dataLabels"
              @change="handleStyleChange"
              type="checkbox"
              class="toggle-checkbox"
            />
            <span>Show Data Labels</span>
          </label>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="form-actions">
        <button
          @click="handleReset"
          type="button"
          class="btn btn-secondary"
        >
          Reset to Defaults
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useProjectStore } from "@/stores/project";
import type { ChartStyle, UpdateChartConfigData } from "@/types/chart";
import {
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{
  projectId: number;
}>();

const projectStore = useProjectStore();

// Default color palette
const DEFAULT_COLORS = [
  "#5470c6",
  "#91cc75",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
];

// Local style state
const localStyle = ref<ChartStyle>({
  title: undefined,
  subtitle: undefined,
  xAxisLabel: undefined,
  yAxisLabel: undefined,
  colors: [...DEFAULT_COLORS],
  legendPosition: undefined,
  gridlines: undefined,
  tooltips: undefined,
  dataLabels: undefined,
});

// Color palette for editing
const colorPalette = ref<string[]>([...DEFAULT_COLORS]);

// Save status
const saveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");

// Autosave debounce timer
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
const AUTOSAVE_DELAY = 1000; // 1 second debounce

// Computed
const chartConfig = computed(() => projectStore.chartConfig);

// Initialize local style from chart config
function initializeStyle() {
  if (chartConfig.value?.style) {
    const style = chartConfig.value.style;
    localStyle.value = {
      title: style.title,
      subtitle: style.subtitle,
      xAxisLabel: style.xAxisLabel,
      yAxisLabel: style.yAxisLabel,
      colors: style.colors && style.colors.length > 0 ? [...style.colors] : [...DEFAULT_COLORS],
      legendPosition: style.legendPosition,
      gridlines: style.gridlines,
      tooltips: style.tooltips,
      dataLabels: style.dataLabels,
    };
    colorPalette.value = localStyle.value.colors || [...DEFAULT_COLORS];
  } else {
    // Reset to defaults
    localStyle.value = {
      title: undefined,
      subtitle: undefined,
      xAxisLabel: undefined,
      yAxisLabel: undefined,
      colors: [...DEFAULT_COLORS],
      legendPosition: undefined,
      gridlines: undefined,
      tooltips: undefined,
      dataLabels: undefined,
    };
    colorPalette.value = [...DEFAULT_COLORS];
  }
}

// Handle style changes with debounced autosave
function handleStyleChange() {
  // Update colors from palette
  localStyle.value.colors = [...colorPalette.value];
  
  // Optimistic update - update chart config immediately
  if (chartConfig.value) {
    const updatedConfig = {
      ...chartConfig.value,
      style: { ...localStyle.value },
    };
    projectStore.chartConfig = updatedConfig;
  }
  
  // Clear existing timer
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
  }
  
  // Set save status to saving
  saveStatus.value = "saving";
  
  // Debounce autosave
  autosaveTimer = setTimeout(() => {
    saveStyle();
  }, AUTOSAVE_DELAY);
}

// Handle color changes
function handleColorChange() {
  localStyle.value.colors = [...colorPalette.value];
  handleStyleChange();
}

// Add color
function addColor() {
  if (colorPalette.value.length < 10) {
    colorPalette.value.push("#000000");
    handleColorChange();
  }
}

// Remove color
function removeColor(index: number) {
  if (colorPalette.value.length > 1) {
    colorPalette.value.splice(index, 1);
    handleColorChange();
  }
}

// Save style to backend
async function saveStyle() {
  if (!chartConfig.value) {
    return;
  }

  try {
    saveStatus.value = "saving";
    
    // Prepare update data
    const updateData: UpdateChartConfigData = {
      style: {
        ...localStyle.value,
        // Remove undefined values
        title: localStyle.value.title || undefined,
        subtitle: localStyle.value.subtitle || undefined,
        xAxisLabel: localStyle.value.xAxisLabel || undefined,
        yAxisLabel: localStyle.value.yAxisLabel || undefined,
        colors: localStyle.value.colors || undefined,
        legendPosition: localStyle.value.legendPosition || undefined,
        gridlines: localStyle.value.gridlines !== undefined ? localStyle.value.gridlines : undefined,
        tooltips: localStyle.value.tooltips !== undefined ? localStyle.value.tooltips : undefined,
        dataLabels: localStyle.value.dataLabels !== undefined ? localStyle.value.dataLabels : undefined,
      },
    };

    // Remove undefined properties
    Object.keys(updateData.style).forEach((key) => {
      if (updateData.style[key as keyof ChartStyle] === undefined) {
        delete updateData.style[key as keyof ChartStyle];
      }
    });

    await projectStore.updateChartConfig(props.projectId, updateData);
    
    saveStatus.value = "saved";
    
    // Clear saved status after 2 seconds
    setTimeout(() => {
      if (saveStatus.value === "saved") {
        saveStatus.value = "idle";
      }
    }, 2000);
  } catch (error) {
    console.error("Failed to save style:", error);
    saveStatus.value = "error";
    
    // Clear error status after 3 seconds
    setTimeout(() => {
      if (saveStatus.value === "error") {
        saveStatus.value = "idle";
      }
    }, 3000);
  }
}

// Manual save (for form submit)
async function handleSave() {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  await saveStyle();
}

// Reset to defaults
function handleReset() {
  localStyle.value = {
    title: undefined,
    subtitle: undefined,
    xAxisLabel: undefined,
    yAxisLabel: undefined,
    colors: [...DEFAULT_COLORS],
    legendPosition: undefined,
    gridlines: undefined,
    tooltips: undefined,
    dataLabels: undefined,
  };
  colorPalette.value = [...DEFAULT_COLORS];
  handleStyleChange();
}

// Watch for chart config changes
watch(
  () => chartConfig.value,
  () => {
    initializeStyle();
  },
  { deep: true }
);

// Initialize on mount
onMounted(() => {
  initializeStyle();
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
  }
});
</script>

<style scoped>
.style-panel-container {
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
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.9rem;
}

.save-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.save-status.saving {
  background: #e3f2fd;
  color: #1976d2;
}

.save-status.saved {
  background: #e8f5e9;
  color: #2e7d32;
}

.save-status.error {
  background: #ffebee;
  color: #c62828;
}

.spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.style-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #5470c6;
  box-shadow: 0 0 0 3px rgba(84, 112, 198, 0.1);
}

.form-hint {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
}

.colors-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-input {
  width: 50px;
  height: 40px;
  border: 2px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.remove-color-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #ff5252;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  padding: 0;
}

.remove-icon {
  width: 14px;
  height: 14px;
}

.remove-color-btn:hover {
  background: #d32f2f;
}

.add-color-btn {
  padding: 8px 16px;
  border: 2px dashed #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.add-color-btn:hover {
  border-color: #5470c6;
  color: #5470c6;
  background: #f5f7ff;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .style-panel-container {
    padding: 16px;
  }

  .colors-container {
    gap: 8px;
  }
}
</style>

