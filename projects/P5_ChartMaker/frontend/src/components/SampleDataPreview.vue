<template>
  <div class="sample-preview">
    <div class="preview-header">
      <h3 class="preview-title">Sample Data Preview</h3>
      <div class="preview-info">
        <span class="row-count">{{ numRows.toLocaleString() }} rows</span>
        <span class="sample-count">Showing first {{ sampleData.length }} rows</span>
      </div>
    </div>
    <div v-if="sampleData.length > 0" class="table-container">
      <table class="sample-table">
        <thead>
          <tr>
            <th
              v-for="columnName in columnNames"
              :key="columnName"
              class="table-header"
            >
              {{ columnName }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in sampleData" :key="index" class="table-row">
            <td
              v-for="columnName in columnNames"
              :key="columnName"
              class="table-cell"
            >
              <span v-if="row[columnName] === null || row[columnName] === undefined" class="null-value">
                <em>null</em>
              </span>
              <span v-else-if="typeof row[columnName] === 'boolean'" :class="['boolean-value', row[columnName] ? 'true' : 'false']">
                {{ row[columnName] ? 'true' : 'false' }}
              </span>
              <span v-else class="cell-value">
                {{ formatValue(row[columnName]) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="no-data">
      <p>No sample data available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  sampleData: Record<string, any>[];
  numRows: number;
}

const props = defineProps<Props>();

const columnNames = computed(() => {
  if (props.sampleData.length === 0) return [];
  return Object.keys(props.sampleData[0]);
});

function formatValue(value: any): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
</script>

<style scoped>
.sample-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-title {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
}

.preview-info {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
  color: #666;
}

.row-count {
  font-weight: 600;
  color: #4a90e2;
}

.sample-count {
  color: #999;
}

.table-container {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: white;
}

.sample-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.table-header {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.9rem;
  white-space: nowrap;
}

.table-row {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.table-row:hover {
  background: #fafafa;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px 16px;
  font-size: 0.9rem;
  color: #333;
  border-right: 1px solid #f0f0f0;
}

.table-cell:last-child {
  border-right: none;
}

.cell-value {
  word-break: break-word;
}

.null-value {
  color: #999;
  font-style: italic;
}

.boolean-value {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
}

.boolean-value.true {
  background: #e8f5e9;
  color: #2e7d32;
}

.boolean-value.false {
  background: #ffebee;
  color: #c62828;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>

