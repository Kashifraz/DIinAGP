<template>
  <div class="chart-preview-container">
    <div class="header">
      <h3>Chart Preview</h3>
      <div v-if="samplingNotice" class="sampling-notice">
        <ExclamationTriangleIcon class="warning-icon" />
        <span>{{ samplingNotice }}</span>
      </div>
    </div>

    <div v-if="previewLoading" class="loading-state">
      <ArrowPathIcon class="loading-spinner" />
      <p>Loading chart data...</p>
    </div>

    <div v-else-if="previewError" class="error-state">
      <p class="error-message">{{ previewError }}</p>
      <button @click="handleRetry" class="retry-button">Retry</button>
    </div>

    <div v-else-if="!chartConfig" class="empty-state">
      <p>Please configure your chart columns first.</p>
    </div>

    <div v-else-if="!previewData || previewData.data.length === 0" class="empty-state">
      <p>No data available for preview.</p>
    </div>

    <div v-else class="chart-wrapper">
      <div class="chart-actions">
        <button @click="handleExportClick" class="export-button" title="Export to PDF">
          <DocumentArrowDownIcon class="export-icon" />
          <span>Export to PDF</span>
        </button>
      </div>
      <div ref="chartContainer" class="chart-container"></div>
    </div>

    <!-- Export Dialog -->
    <ExportDialog
      :show="showExportDialog"
      :project-id="props.projectId"
      :chart-image-data-url="chartImageDataUrl"
      @close="showExportDialog = false"
      @exported="handleExportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { useProjectStore } from "@/stores/project";
import type { ChartType, ExportJob } from "@/types/chart";
import ExportDialog from "./ExportDialog.vue";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
} from "@heroicons/vue/24/outline";

interface Props {
  projectId: number;
}

const props = defineProps<Props>();

const projectStore = useProjectStore();
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// Export dialog state
const showExportDialog = ref(false);
const chartImageDataUrl = ref<string | null>(null);

// Computed properties
const chartConfig = computed(() => projectStore.chartConfig);
const previewData = computed(() => projectStore.previewData);
const previewLoading = computed(() => projectStore.previewLoading);
const previewError = computed(() => projectStore.previewError);

const samplingNotice = computed(() => {
  if (previewData.value?.is_sampled && previewData.value?.sampling_message) {
    return previewData.value.sampling_message;
  }
  return null;
});

// Transform data for ECharts based on chart type
function transformDataForChart(
  data: Record<string, any>[],
  chartType: ChartType,
  selectedColumns: { x: string; y: string[]; groupBy?: string | null; label?: string | null }
) {
  const { x, y, groupBy, label } = selectedColumns;

  if (chartType === "pie") {
    // Pie chart: x-axis as categories, first y-column as values
    return data.map((row) => ({
      name: String(row[x] || ""),
      value: Number(row[y[0]]) || 0,
    }));
  } else if (chartType === "scatter") {
    // Scatter plot: x and y as coordinates
    return data.map((row) => [
      Number(row[x]) || 0,
      Number(row[y[0]]) || 0,
    ]);
  } else {
    // Bar, line, area charts
    // Aggregate data by x-axis value to handle duplicates
    const aggregatedData: Record<string, Record<string, number>> = {};
    const xValuesSet = new Set<string>();

    data.forEach((row) => {
      const xValue = String(row[x] || "");
      xValuesSet.add(xValue);

      if (!aggregatedData[xValue]) {
        aggregatedData[xValue] = {};
        y.forEach((yCol) => {
          aggregatedData[xValue][yCol] = 0;
        });
      }

      y.forEach((yCol) => {
        aggregatedData[xValue][yCol] += Number(row[yCol]) || 0;
      });
    });

    const categories = Array.from(xValuesSet).sort(); // Sort for consistent ordering
    const series = y.map((yCol) => ({
      name: yCol,
      type: undefined, // Will be set in getChartOption
      data: categories.map((xVal) => {
        const value = aggregatedData[xVal]?.[yCol] || 0;
        return typeof value === 'number' && !isNaN(value) ? value : 0;
      }),
    }));

    // Handle grouping if groupBy is specified
    if (groupBy) {
      // Group data by groupBy value, then aggregate by x-axis
      const groupedMap: Record<string, Record<string, Record<string, number>>> = {};
      const xValues = new Set<string>();
      const groupValues = new Set<string>();

      data.forEach((row) => {
        const xValue = String(row[x] || "");
        const groupValue = String(row[groupBy] || "");
        xValues.add(xValue);
        groupValues.add(groupValue);

        if (!groupedMap[groupValue]) {
          groupedMap[groupValue] = {};
        }
        if (!groupedMap[groupValue][xValue]) {
          groupedMap[groupValue][xValue] = {};
        }

        y.forEach((yCol) => {
          if (!groupedMap[groupValue][xValue][yCol]) {
            groupedMap[groupValue][xValue][yCol] = 0;
          }
          groupedMap[groupValue][xValue][yCol] += Number(row[yCol]) || 0;
        });
      });

      const categories = Array.from(xValues);
      const series = Array.from(groupValues).flatMap((groupValue) =>
        y.map((yCol) => ({
          name: `${yCol} - ${groupValue}`,
          data: categories.map((xVal) => groupedMap[groupValue][xVal]?.[yCol] || 0),
        }))
      );

      return { categories, series };
    }

    return { categories, series };
  }
}

function getChartOption(chartType: ChartType, transformedData: any, style: any) {
  // Extract categories early for grid calculation (for bar/line/area charts)
  const categories = transformedData?.categories || [];
  const numCategories = categories.length;
  
  const baseOption: any = {
    title: {
      text: style?.title || "Chart",
      left: "center",
      textStyle: {
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: chartType === "scatter" ? "item" : "axis",
      show: style?.tooltips !== false,
      axisPointer: {
        type: chartType === "bar" ? "shadow" : "line",
      },
    },
    legend: {
      show: chartType !== "pie" && chartType !== "scatter",
      orient: style?.legendPosition === "left" || style?.legendPosition === "right" ? "vertical" : "horizontal",
      left: style?.legendPosition === "left" ? "left" : style?.legendPosition === "right" ? "right" : "center",
      top: style?.legendPosition === "top" ? "top" : style?.legendPosition === "bottom" ? "bottom" : "auto",
    },
    color: style?.colors || [
      "#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"
    ],
    grid: {
      show: style?.gridlines !== false,
      left: "10%",
      right: "10%",
      bottom: numCategories > 10 ? "25%" : "15%", // More space for rotated labels
      top: "15%",
      containLabel: true,
    },
  };

  if (chartType === "pie") {
    return {
      ...baseOption,
      series: [
        {
          type: "pie",
          radius: "50%",
          data: transformedData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          label: {
            show: style?.dataLabels !== false,
          },
        },
      ],
    };
  } else if (chartType === "scatter") {
    return {
      ...baseOption,
      xAxis: {
        type: "value",
        name: style?.xAxisLabel || chartConfig.value?.selected_columns.x,
      },
      yAxis: {
        type: "value",
        name: style?.yAxisLabel || chartConfig.value?.selected_columns.y[0],
      },
      series: [
        {
          type: "scatter",
          data: transformedData,
          symbolSize: 10,
        },
      ],
    };
  } else {
    // Bar, line, area
    const { categories, series } = transformedData;
    
    // Validate data structure
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error("Invalid categories:", categories);
      return baseOption;
    }
    
    if (!series || !Array.isArray(series) || series.length === 0) {
      console.error("Invalid series:", series);
      return baseOption;
    }
    
    return {
      ...baseOption,
      xAxis: {
        type: "category",
        data: categories,
        name: style?.xAxisLabel || chartConfig.value?.selected_columns.x,
        nameLocation: "middle",
        nameGap: 30,
        axisLabel: {
          interval: 0, // Show all labels - no auto-hiding
          rotate: categories.length > 10 ? 45 : 0, // Rotate if many categories
          show: true,
          showMinLabel: true,
          showMaxLabel: true,
          overflow: "truncate", // Truncate if too long
          width: categories.length > 10 ? 60 : undefined, // Set width for rotated labels
        },
      },
      yAxis: {
        type: "value",
        name: style?.yAxisLabel || (chartConfig.value?.selected_columns.y.length === 1 ? chartConfig.value.selected_columns.y[0] : "Value"),
        nameLocation: "middle",
        nameGap: 50,
      },
      series: series.map((s: any, index: number) => {
        // Ensure data is an array of numbers with same length as categories
        let dataArray: number[] = [];
        
        if (Array.isArray(s.data)) {
          dataArray = s.data.map((val: any) => {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
          });
        }
        
        // Ensure data length matches categories length
        if (dataArray.length !== categories.length) {
          console.warn(`Series "${s.name}" data length (${dataArray.length}) doesn't match categories length (${categories.length}). Padding/truncating.`);
          if (dataArray.length < categories.length) {
            // Pad with zeros
            dataArray = [...dataArray, ...Array(categories.length - dataArray.length).fill(0)];
          } else {
            // Truncate
            dataArray = dataArray.slice(0, categories.length);
          }
        }
        
        return {
          name: s.name || "Series",
          type: chartType,
          data: dataArray,
          label: {
            show: style?.dataLabels === true,
          },
          emphasis: {
            focus: "series",
          },
          animation: true,
          animationDuration: 1000,
        };
      }),
    };
  }
}

async function renderChart() {
  if (!chartContainer.value || !chartConfig.value || !previewData.value) {
    console.warn("Cannot render chart: missing requirements", {
      hasContainer: !!chartContainer.value,
      hasConfig: !!chartConfig.value,
      hasData: !!previewData.value,
    });
    return;
  }
  
  if (!previewData.value.data || previewData.value.data.length === 0) {
    console.warn("Cannot render chart: no data available");
    return;
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }

  // Wait for DOM update and ensure container has dimensions
  await nextTick();
  
  // Ensure container has dimensions
  if (!chartContainer.value) {
    console.error("Chart container element not found");
    return;
  }
  
  // Ensure container has explicit dimensions
  const containerRect = chartContainer.value.getBoundingClientRect();
  if (containerRect.width === 0 || containerRect.height === 0) {
    console.warn("Chart container has no dimensions, waiting...");
    // Set explicit height if not set
    if (containerRect.height === 0) {
      chartContainer.value.style.height = '500px';
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Create new chart instance with explicit dimensions
  const finalRect = chartContainer.value.getBoundingClientRect();
  chartInstance = echarts.init(chartContainer.value, null, {
    width: finalRect.width || undefined,
    height: finalRect.height || 500,
    renderer: 'canvas',
  });

  // Debug logging
  console.log("=== Chart Rendering Debug ===");
  console.log("Chart Type:", chartConfig.value.chart_type);
  console.log("Selected Columns:", chartConfig.value.selected_columns);
  console.log("Preview Data Length:", previewData.value.data.length);
  console.log("Preview Data Sample:", previewData.value.data.slice(0, 3));

  // Transform data
  const transformedData = transformDataForChart(
    previewData.value.data,
    chartConfig.value.chart_type,
    chartConfig.value.selected_columns
  );
  
  console.log("Transformed Data:", transformedData);
  if (transformedData.categories) {
    console.log("Categories Count:", transformedData.categories.length);
    console.log("Categories Sample:", transformedData.categories.slice(0, 5));
  }
  if (transformedData.series) {
    console.log("Series Count:", transformedData.series.length);
    transformedData.series.forEach((s: any, idx: number) => {
      console.log(`Series ${idx} (${s.name}):`, {
        dataLength: s.data?.length,
        dataSample: s.data?.slice(0, 5),
        dataSum: s.data?.reduce((a: number, b: number) => a + b, 0),
      });
    });
  }

  // Get chart option
  const option = getChartOption(
    chartConfig.value.chart_type,
    transformedData,
    chartConfig.value.style || {}
  );

  console.log("Chart Option Series:", JSON.stringify(option.series, null, 2));
  console.log("Chart Option XAxis:", JSON.stringify(option.xAxis, null, 2));
  console.log("Chart Option YAxis:", JSON.stringify(option.yAxis, null, 2));
  console.log("Full Chart Option:", JSON.stringify(option, null, 2));

  // Validate option before rendering
  if (!option.series || option.series.length === 0) {
    console.error("No series data to render!");
    return;
  }

    // Set option and render
  try {
    // Clear any existing option first
    chartInstance.clear();
    
    // Set the option with proper configuration
    chartInstance.setOption(option, {
      notMerge: true,
      lazyUpdate: false,
    });
    
    // Ensure chart DOM is visible and has proper dimensions
    const chartDom = chartInstance.getDom();
    if (chartDom && chartContainer.value) {
      chartDom.style.display = 'block';
      chartDom.style.width = '100%';
      chartDom.style.height = '500px';
      
      // Ensure container has height
      if (!chartContainer.value.style.height) {
        chartContainer.value.style.height = '500px';
      }
    }
    
    // Force resize immediately with explicit dimensions
    const containerWidth = chartContainer.value?.offsetWidth || chartContainer.value?.clientWidth || 800;
    const containerHeight = chartContainer.value?.offsetHeight || chartContainer.value?.clientHeight || 500;
    chartInstance.resize({
      width: containerWidth,
      height: containerHeight,
    });
    
    // Additional resize after a short delay to ensure proper rendering
    setTimeout(() => {
      if (chartInstance && chartContainer.value) {
        const finalWidth = chartContainer.value.offsetWidth || chartContainer.value.clientWidth;
        const finalHeight = chartContainer.value.offsetHeight || chartContainer.value.clientHeight;
        chartInstance.resize({
          width: finalWidth,
          height: finalHeight,
        });
        console.log("Chart resize completed", { width: finalWidth, height: finalHeight });
      }
    }, 300);
    
    // Another resize after layout settles
    setTimeout(() => {
      if (chartInstance && chartContainer.value) {
        chartInstance.resize();
      }
    }, 600);
    
    console.log("Chart rendered successfully. Container dimensions:", {
      width: chartContainer.value?.offsetWidth,
      height: chartContainer.value?.offsetHeight,
      clientWidth: chartContainer.value?.clientWidth,
      clientHeight: chartContainer.value?.clientHeight,
    });
  } catch (error) {
    console.error("Error rendering chart:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
  }

  // Handle resize with debouncing
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  const handleResize = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(() => {
      if (chartInstance && chartContainer.value) {
        const width = chartContainer.value.offsetWidth || chartContainer.value.clientWidth;
        const height = chartContainer.value.offsetHeight || chartContainer.value.clientHeight;
        if (width > 0 && height > 0) {
          chartInstance.resize({
            width: width,
            height: height,
          });
        }
      }
    }, 150);
  };
  window.addEventListener("resize", handleResize);

  // Also listen for ResizeObserver for container size changes
  let resizeObserver: ResizeObserver | null = null;
  if (chartContainer.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (chartInstance && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          chartInstance.resize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    resizeObserver.observe(chartContainer.value);
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleResize);
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });
}

async function loadPreviewData() {
  if (!chartConfig.value) {
    return;
  }

  try {
    await projectStore.fetchPreviewData(props.projectId, 1000);
    await renderChart();
  } catch (error) {
    console.error("Failed to load preview data:", error);
  }
}

function handleRetry() {
  loadPreviewData();
}

// Export handlers
async function handleExportClick() {
  if (!chartInstance) {
    alert("Chart is not ready. Please wait for the chart to load.");
    return;
  }

  try {
    // Get chart as base64 image
    const imageDataUrl = chartInstance.getDataURL({
      type: "png",
      pixelRatio: 2, // Higher quality
      backgroundColor: "#fff",
    });
    
    chartImageDataUrl.value = imageDataUrl;
    showExportDialog.value = true;
  } catch (error) {
    console.error("Failed to export chart image:", error);
    alert("Failed to prepare chart for export. Please try again.");
  }
}

function handleExportSuccess(job: ExportJob) {
  console.log("Export successful:", job);
  // Dialog will show success state
}

// Watch for config changes - reload preview data and re-render
watch(
  () => chartConfig.value,
  async (newConfig, oldConfig) => {
    if (newConfig) {
      // If only style changed, just re-render chart (optimistic update)
      if (oldConfig && 
          JSON.stringify(newConfig.style) !== JSON.stringify(oldConfig.style)) {
        // Style changed, just re-render if we have data
        if (previewData.value) {
          await renderChart();
        }
      } else {
        // Config or columns changed, reload preview data
        await loadPreviewData();
      }
    }
  },
  { deep: true }
);

// Watch for preview data changes - re-render chart
watch(
  () => previewData.value,
  async (newData) => {
    if (newData && chartConfig.value) {
      await renderChart();
    }
  },
  { deep: true }
);

onMounted(async () => {
  // Wait a bit for DOM to be fully ready
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Ensure container is ready
  if (chartContainer.value) {
    // Set explicit height if not already set
    if (!chartContainer.value.style.height) {
      chartContainer.value.style.height = '500px';
    }
  }
  
  if (chartConfig.value) {
    await loadPreviewData();
  } else {
    // If no config yet, try again after a short delay
    setTimeout(async () => {
      if (chartConfig.value && !previewData.value) {
        await loadPreviewData();
      }
    }, 500);
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.chart-preview-container {
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

.sampling-notice {
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-size: 0.9rem;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
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

.empty-state p {
  color: #666;
  font-size: 1rem;
}

.chart-wrapper {
  width: 100%;
  min-height: 400px;
  position: relative;
}

.chart-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.export-button {
  padding: 8px 16px;
  background: #5470c6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-icon {
  width: 18px;
  height: 18px;
}

.export-button:hover {
  background: #4562a8;
}

.chart-container {
  width: 100% !important;
  height: 500px !important;
  min-height: 500px;
  display: block !important;
  position: relative;
  overflow: visible;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .chart-preview-container {
    padding: 16px;
  }

  .chart-container {
    height: 400px;
  }
}
</style>

