<template>
  <div class="resultsheet-card">
    <div class="resultsheet-header">
      <h3>{{ resultsheet.courseCode }} - {{ resultsheet.courseName }}</h3>
      <div class="grade-badge" :class="gradeLetterClass">
        <span class="grade-letter">{{ resultsheet.gradeLetter }}</span>
        <span class="grade-percentage">{{ resultsheet.overallGrade.toFixed(2) }}%</span>
      </div>
    </div>
    
    <div class="resultsheet-body">
      <!-- Assessment Breakdown Table -->
      <div class="assessment-table">
        <table>
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Type</th>
              <th>Marks</th>
              <th>Weight</th>
              <th>Score %</th>
              <th>Weighted</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="assessment in resultsheet.assessmentGrades"
              :key="assessment.assessmentId"
              :class="{ 'not-graded': !assessment.marksObtained || assessment.marksObtained === 0 }"
            >
              <td class="assessment-title">{{ assessment.assessmentTitle }}</td>
              <td>
                <span class="type-badge" :class="assessment.assessmentType.toLowerCase()">
                  {{ assessment.assessmentType }}
                </span>
              </td>
              <td>
                <span v-if="assessment.marksObtained !== null && assessment.marksObtained !== undefined">
                  {{ assessment.marksObtained.toFixed(2) }} / {{ assessment.maximumMarks.toFixed(2) }}
                </span>
                <span v-else class="not-graded-text">Not Graded</span>
              </td>
              <td>{{ assessment.weightPercentage.toFixed(1) }}%</td>
              <td>
                <span v-if="assessment.percentageScore !== null && assessment.percentageScore !== undefined">
                  {{ assessment.percentageScore.toFixed(2) }}%
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <span v-if="assessment.weightedScore !== null && assessment.weightedScore !== undefined">
                  {{ assessment.weightedScore.toFixed(2) }}%
                </span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="summary-row">
              <td colspan="3"><strong>Total</strong></td>
              <td><strong>{{ resultsheet.totalWeight.toFixed(1) }}%</strong></td>
              <td colspan="2"><strong>{{ resultsheet.overallGrade.toFixed(2) }}%</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Visual Grade Representation -->
      <div class="grade-visualization">
        <div class="grade-bar">
          <div
            class="grade-fill"
            :style="{ width: resultsheet.overallGrade + '%' }"
            :class="gradeLetterClass"
          ></div>
        </div>
        <div class="grade-labels">
          <span>F (0-59%)</span>
          <span>D (60-69%)</span>
          <span>C (70-79%)</span>
          <span>B (80-89%)</span>
          <span>A (90-100%)</span>
        </div>
      </div>

      <!-- Weight Breakdown -->
      <div class="weight-breakdown">
        <h4>Weight Breakdown</h4>
        <div class="weight-items">
          <div
            v-for="assessment in resultsheet.assessmentGrades"
            :key="assessment.assessmentId"
            class="weight-item"
          >
            <div class="weight-label">{{ assessment.assessmentTitle }}</div>
            <div class="weight-bar">
              <div
                class="weight-fill"
                :style="{ width: (assessment.weightPercentage / resultsheet.totalWeight * 100) + '%' }"
              ></div>
            </div>
            <div class="weight-value">{{ assessment.weightPercentage.toFixed(1) }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  resultsheet: {
    type: Object,
    required: true
  }
})

const gradeLetterClass = computed(() => {
  if (!props.resultsheet.gradeLetter) return 'grade-f'
  return `grade-${props.resultsheet.gradeLetter.toLowerCase()}`
})
</script>

<style scoped>
.resultsheet-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resultsheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.resultsheet-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.grade-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 700;
}

.grade-letter {
  font-size: 32px;
  line-height: 1;
}

.grade-percentage {
  font-size: 14px;
  margin-top: 4px;
  opacity: 0.9;
}

.grade-badge.grade-a {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
}

.grade-badge.grade-b {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.grade-badge.grade-c {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.grade-badge.grade-d {
  background: linear-gradient(135deg, #ff5722, #d84315);
  color: white;
}

.grade-badge.grade-f {
  background: linear-gradient(135deg, #f44336, #c62828);
  color: white;
}

.assessment-table {
  margin-bottom: 24px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f5f5f5;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  font-weight: 600;
  color: #333;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  font-size: 14px;
  color: #666;
}

.assessment-title {
  font-weight: 500;
  color: #333;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-badge.assignment {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.quiz {
  background: #fff3e0;
  color: #e65100;
}

.type-badge.exam {
  background: #fce4ec;
  color: #c2185b;
}

.not-graded {
  opacity: 0.6;
}

.not-graded-text {
  color: #999;
  font-style: italic;
}

.summary-row {
  background: #f9f9f9;
  font-weight: 600;
}

.summary-row td {
  color: #333;
  padding-top: 16px;
  padding-bottom: 16px;
}

.grade-visualization {
  margin-bottom: 24px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.grade-bar {
  width: 100%;
  height: 32px;
  background: #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
  position: relative;
}

.grade-fill {
  height: 100%;
  transition: width 0.5s;
  border-radius: 16px;
}

.grade-fill.grade-a {
  background: linear-gradient(90deg, #4caf50, #2e7d32);
}

.grade-fill.grade-b {
  background: linear-gradient(90deg, #2196f3, #1976d2);
}

.grade-fill.grade-c {
  background: linear-gradient(90deg, #ff9800, #f57c00);
}

.grade-fill.grade-d {
  background: linear-gradient(90deg, #ff5722, #d84315);
}

.grade-fill.grade-f {
  background: linear-gradient(90deg, #f44336, #c62828);
}

.grade-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}

.weight-breakdown {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.weight-breakdown h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.weight-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weight-label {
  min-width: 150px;
  font-size: 13px;
  color: #666;
}

.weight-bar {
  flex: 1;
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.weight-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s;
}

.weight-value {
  min-width: 50px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .resultsheet-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .assessment-table {
    font-size: 12px;
  }

  th, td {
    padding: 8px;
  }

  .weight-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .weight-label {
    min-width: auto;
    width: 100%;
  }

  .weight-bar {
    width: 100%;
  }
}
</style>

