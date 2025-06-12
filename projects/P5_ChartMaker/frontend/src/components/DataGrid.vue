<template>
  <div class="data-grid-container">
    <div class="grid-header">
      <h3>Editable Data Grid</h3>
      <div class="grid-controls">
        <div class="pagination-controls">
          <button
            @click="goToPage(gridPagination.page - 1)"
            :disabled="!gridPagination.has_previous || gridLoading"
            class="page-btn"
          >
            ← Previous
          </button>
          <span class="page-info">
            Page {{ gridPagination.page }} of {{ gridPagination.total_pages }}
            ({{ gridPagination.total_rows.toLocaleString() }} total rows)
          </span>
          <button
            @click="goToPage(gridPagination.page + 1)"
            :disabled="!gridPagination.has_next || gridLoading"
            class="page-btn"
          >
            Next →
          </button>
        </div>
        <div class="edit-controls" v-if="hasPendingEdits">
          <span class="edit-count">({{ Object.keys(pendingEdits).length }} cell{{ Object.keys(pendingEdits).length !== 1 ? 's' : '' }} edited)</span>
          <button @click="discardEdits" :disabled="savingEdits" class="discard-btn">
            Discard Changes
          </button>
          <button @click="saveEdits" :disabled="savingEdits" class="save-btn">
            {{ savingEdits ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="gridLoading" class="loading-state">
      <ArrowPathIcon class="loading-spinner" />
      <p>Loading data...</p>
    </div>

    <div v-else-if="gridError" class="error-state">
      <h4>Error Loading Data</h4>
      <p>{{ gridError }}</p>
      <button @click="retryLoad" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="gridData.length > 0" class="grid-wrapper">
      <div class="edit-hint">
        💡 <strong>Tip:</strong> Hover over cells to highlight, click to edit. Press Enter to save or Escape to cancel.
      </div>
      <div class="grid-table-container">
        <table class="data-grid-table">
          <thead>
            <tr>
              <th class="row-number-header">#</th>
              <th v-for="columnName in columnNames" :key="columnName" class="data-header">
                {{ columnName }}
                <span class="column-type" :class="`type-${gridSchema[columnName]}`">
                  {{ getTypeDisplay(gridSchema[columnName]) }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIndex) in gridData"
              :key="rowIndex"
              :class="{ 'has-changes': hasRowChanges(rowIndex) }"
            >
              <td class="row-number">
                {{ (gridPagination.page - 1) * gridPagination.page_size + rowIndex + 1 }}
              </td>
              <td
                v-for="columnName in columnNames"
                :key="columnName"
                class="data-cell"
                :class="{
                  'has-error': hasCellError(rowIndex, columnName),
                  'has-change': hasCellChange(rowIndex, columnName),
                  'is-editing': isEditingCell(rowIndex, columnName)
                }"
              >
                <!-- Display mode -->
                <div
                  v-if="!isEditingCell(rowIndex, columnName)"
                  class="cell-display"
                  @click="handleCellClick(rowIndex, columnName)"
                >
                  {{ formatCellValue(row[columnName]) || '—' }}
                </div>

                <!-- Edit mode -->
                <input
                  v-else
                  :ref="el => setInputRef(el, rowIndex, columnName)"
                  :value="getEditingValue(rowIndex, columnName)"
                  @input="updateEditingValue($event, rowIndex, columnName)"
                  @blur="finishEditing(rowIndex, columnName)"
                  @keydown.enter.prevent="finishEditing(rowIndex, columnName)"
                  @keydown.escape.prevent="cancelEditing"
                  @click.stop
                  class="cell-input"
                  :type="getInputType(gridSchema[columnName])"
                  :title="`Editing ${columnName}`"
                  :placeholder="`Enter ${columnName}`"
                  :aria-label="`Edit ${columnName} in row ${rowIndex + 1}`"
                />

                <!-- Error message -->
                <div v-if="hasCellError(rowIndex, columnName)" class="cell-error">
                  {{ getCellError(rowIndex, columnName) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="empty-state">
      <h4>No Data Available</h4>
      <p>Please upload and parse a file first to view data in the grid.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from "vue";
import { useProjectStore } from "@/stores/project";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  projectId: number;
}>();

const projectStore = useProjectStore();

// Editing state
const editingCell = ref<{ rowIndex: number; columnName: string } | null>(null);
const editingValues = ref<Record<string, string>>({});
const inputRefs = ref<Map<string, HTMLInputElement>>(new Map());

// Computed
const gridData = computed(() => projectStore.gridData);
const gridSchema = computed(() => projectStore.gridSchema);
const gridPagination = computed(() => projectStore.gridPagination);
const gridLoading = computed(() => projectStore.gridLoading);
const gridError = computed(() => projectStore.gridError);
const pendingEdits = computed(() => projectStore.pendingEdits);
const editErrors = computed(() => projectStore.editErrors);
const savingEdits = computed(() => projectStore.savingEdits);

const columnNames = computed(() => Object.keys(gridSchema.value));
const hasPendingEdits = computed(() => Object.keys(pendingEdits.value).length > 0);

function getCellKey(rowIndex: number, columnName: string): string {
  return `${rowIndex}-${columnName}`;
}

function getTypeDisplay(type: string): string {
  const displays: Record<string, string> = {
    string: "TXT",
    number: "NUM",
    boolean: "BOOL",
    date: "DATE",
  };
  return displays[type] || type.toUpperCase();
}

function getInputType(type: string): string {
  const types: Record<string, string> = {
    number: "number",
    boolean: "checkbox",
    date: "date",
  };
  return types[type] || "text";
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function getAbsoluteRowIndex(rowIndex: number): number {
  return (gridPagination.value.page - 1) * gridPagination.value.page_size + rowIndex;
}

function hasRowChanges(rowIndex: number): boolean {
  const absoluteRowIndex = getAbsoluteRowIndex(rowIndex);
  return !!pendingEdits.value[absoluteRowIndex.toString()];
}

function hasCellChange(rowIndex: number, columnName: string): boolean {
  const absoluteRowIndex = getAbsoluteRowIndex(rowIndex);
  const rowKey = absoluteRowIndex.toString();
  return !!(pendingEdits.value[rowKey] && pendingEdits.value[rowKey][columnName] !== undefined);
}

function hasCellError(rowIndex: number, columnName: string): boolean {
  const absoluteRowIndex = getAbsoluteRowIndex(rowIndex);
  const rowKey = absoluteRowIndex.toString();
  return !!(editErrors.value[rowKey] && editErrors.value[rowKey][columnName]);
}

function getCellError(rowIndex: number, columnName: string): string {
  const absoluteRowIndex = getAbsoluteRowIndex(rowIndex);
  const rowKey = absoluteRowIndex.toString();
  return editErrors.value[rowKey]?.[columnName] || "";
}

function isEditingCell(rowIndex: number, columnName: string): boolean {
  return editingCell.value?.rowIndex === rowIndex && editingCell.value?.columnName === columnName;
}

function getEditingValue(rowIndex: number, columnName: string): string {
  const cellKey = getCellKey(rowIndex, columnName);
  if (editingValues.value[cellKey] !== undefined) {
    return editingValues.value[cellKey];
  }
  const currentValue = gridData.value[rowIndex]?.[columnName];
  return currentValue === null || currentValue === undefined ? "" : String(currentValue);
}

function updateEditingValue(event: Event, rowIndex: number, columnName: string) {
  const cellKey = getCellKey(rowIndex, columnName);
  const target = event.target as HTMLInputElement;
  editingValues.value[cellKey] = target.value;
}

function setInputRef(el: any, rowIndex: number, columnName: string) {
  if (el) {
    const cellKey = getCellKey(rowIndex, columnName);
    inputRefs.value.set(cellKey, el);
    nextTick(() => {
      el.focus();
      // Position cursor at the end of the text for better UX
      const length = el.value.length;
      el.setSelectionRange(length, length);
    });
  }
}

function handleCellClick(rowIndex: number, columnName: string) {
  console.log('CELL CLICKED:', { rowIndex, columnName });
  if (!isEditingCell(rowIndex, columnName)) {
    startEditing(rowIndex, columnName);
  }
}

function startEditing(rowIndex: number, columnName: string) {
  editingCell.value = { rowIndex, columnName };
  const cellKey = getCellKey(rowIndex, columnName);
  const currentValue = gridData.value[rowIndex]?.[columnName];
  editingValues.value[cellKey] = currentValue === null || currentValue === undefined ? "" : String(currentValue);
  nextTick(() => {
    const input = inputRefs.value.get(cellKey);
    if (input) {
      input.focus();
      // Position cursor at the end of the text for better UX
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  });
}

function cancelEditing() {
  if (editingCell.value) {
    const cellKey = getCellKey(editingCell.value.rowIndex, editingCell.value.columnName);
    delete editingValues.value[cellKey];
  }
  editingCell.value = null;
}

function finishEditing(rowIndex: number, columnName: string) {
  if (!editingCell.value) return;
  const cellKey = getCellKey(rowIndex, columnName);
  const newValue = editingValues.value[cellKey] || "";
  const originalValue = gridData.value[rowIndex]?.[columnName];
  let processedValue: any = newValue;
  const columnType = gridSchema.value[columnName];

  if (columnType === "number") {
    processedValue = newValue === "" ? null : Number(newValue);
    if (Number.isNaN(processedValue)) {
      processedValue = originalValue;
    }
  } else if (columnType === "boolean") {
    processedValue = newValue.toLowerCase() === "true" || newValue === "1" || newValue === "yes";
  } else if (newValue === "") {
    processedValue = null;
  } else {
    processedValue = newValue;
  }

  if (processedValue !== originalValue) {
    const absoluteRowIndex = getAbsoluteRowIndex(rowIndex);
    console.log('Updating cell value:', {
      absoluteRowIndex,
      columnName,
      oldValue: originalValue,
      newValue: processedValue
    });
    projectStore.updateCellValue(absoluteRowIndex, columnName, processedValue);
  } else {
    console.log('No change detected, skipping update');
  }

  delete editingValues.value[cellKey];
  editingCell.value = null;
}

async function goToPage(page: number) {
  try {
    await projectStore.fetchGridData(props.projectId, page, gridPagination.value.page_size);
  } catch (error) {
    console.error("Failed to load page:", error);
  }
}

async function saveEdits() {
  const editsCount = Object.keys(pendingEdits.value).length;
  console.log('Saving edits...', { 
    editsCount,
    pendingEdits: pendingEdits.value 
  });
  
  if (editsCount === 0) {
    alert('No changes to save');
    return;
  }
  
  try {
    const result = await projectStore.saveEdits(props.projectId);
    console.log('Save result:', result);
    
    if (result.success) {
      // Data is already reloaded in the store's saveEdits function
      alert(`Successfully saved ${editsCount} cell edit(s)!`);
    } else if (result.errors) {
      console.error("Save errors:", result.errors);
      alert('Failed to save: ' + (result.errors.join(', ') || 'Unknown error'));
    }
  } catch (error: any) {
    console.error("Failed to save edits:", error);
    const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
    alert(`Failed to save edits: ${errorMsg}`);
  }
}

function discardEdits() {
  projectStore.discardEdits();
  goToPage(gridPagination.value.page);
}

async function retryLoad() {
  await goToPage(gridPagination.value.page);
}

watch(
  () => props.projectId,
  async (newProjectId) => {
    if (newProjectId) {
      await goToPage(1);
    }
  },
  { immediate: true }
);

onMounted(() => {
  console.log('DataGrid mounted', { projectId: props.projectId, dataLength: gridData.value.length });
});
</script>

<style scoped>
.data-grid-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.grid-header h3 {
  margin: 0;
  color: #333;
}

.grid-controls {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #4a90e2;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

.edit-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.edit-count {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.discard-btn, .save-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.discard-btn {
  border: 1px solid #dc3545;
  background: white;
  color: #dc3545;
}

.discard-btn:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

.save-btn {
  border: 1px solid #28a745;
  background: #28a745;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto 12px;
  color: #667eea;
  animation: spin 1s linear infinite;
}

.retry-btn {
  padding: 10px 20px;
  border: 1px solid #4a90e2;
  background: #4a90e2;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #357abd;
}

.edit-hint {
  padding: 12px 16px;
  background: #e3f2fd;
  border-left: 4px solid #4a90e2;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #1976d2;
}

.grid-wrapper {
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.grid-table-container {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

.data-grid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.row-number-header, .row-number {
  width: 60px;
  text-align: center;
  background: #f8f9fa;
  border-right: 2px solid #e0e0e0;
  position: sticky;
  left: 0;
  z-index: 10;
}

.data-header {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  background: #f8f9fa;
  border-bottom: 2px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 5;
  white-space: nowrap;
}

.column-type {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.type-string { background: #e3f2fd; color: #1976d2; }
.type-number { background: #f3e5f5; color: #7b1fa2; }
.type-boolean { background: #fff3e0; color: #e65100; }
.type-date { background: #e8f5e9; color: #2e7d32; }

.data-cell {
  padding: 0;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* HOVER EFFECT - Must be on .data-cell */
.data-cell:hover:not(.is-editing) {
  background-color: #e3f2fd !important;
}

.data-cell.is-editing {
  background: #fff9e6;
}

.cell-display {
  padding: 8px 12px;
  min-height: 40px;
  display: flex;
  align-items: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: pointer;
  width: 100%;
}

.cell-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #4a90e2;
  border-radius: 4px;
  outline: none;
  font-size: inherit;
  font-family: inherit;
  background: white;
  min-height: 40px;
  box-sizing: border-box;
}

.cell-input:focus {
  border-color: #357abd;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.has-changes {
  background: #fff3cd;
}

.has-change .cell-display {
  background: #d4edda;
  color: #155724;
}

.has-error {
  background: #f8d7da;
}

.has-error .cell-display {
  background: #f5c6cb;
  color: #721c24;
}

.cell-error {
  color: #721c24;
  font-size: 0.8rem;
  margin-top: 4px;
  font-weight: 500;
  padding: 0 12px 4px 12px;
}

tbody tr:last-child .data-cell {
  border-bottom: none;
}

tbody tr .data-cell:last-child {
  border-right: none;
}

@media (max-width: 768px) {
  .grid-header {
    flex-direction: column;
    align-items: stretch;
  }
  .grid-controls {
    flex-direction: column;
    align-items: stretch;
  }
  .pagination-controls {
    justify-content: center;
  }
  .edit-controls {
    justify-content: center;
  }
  .data-grid-table {
    font-size: 0.8rem;
  }
}
</style>
