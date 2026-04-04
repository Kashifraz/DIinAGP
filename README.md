This repository is the replication package for our research study, "_Beyond Functional Correctness: Design Issues in AI IDE Generated Large-Scale Projects_". 

It contains:
- Implementation code for the 10 large-scale projects generated using an AI IDE (e.g., Cursor)
- Design issue identified by two analysis tools (`CodeScene` and `SonarQube`)
- Human evaluation screenshots for calculating the functional correctness of the generated projects
- List of 10 detailed project descriptions for generating projects using Cursor

## Repository Structure

```text
projects/
├── P1_CVbuilder/
├── P2_VocabularyApp/
├── P3_Ecommerce/
├── P4_JobApplication/
├── P5_ChartMaker/
├── P6_FormPlugin/
├── P7_BlogWebsite/
├── P8_SocialApp/
├── P9_LMS/
├── P10_POS/
└── pilot-projects/

manual_evaluation/
├── P1_CVbuilder/
├── P2_VocabularyApp/
├── P3_Ecommerce/
├── P4_JobApplication/
├── P5_ChartMaker/
├── P6_FormPlugin/
├── P7_BlogWebsite/
├── P8_SocialApp/
├── P9_LMS/
└── P10_POS/

design_issues/
├── CodeScene/
└── SonarQube/

Project_Descriptions.pdf
```
## 1) `projects/`

The `projects/` folder stores the implementation artifacts for the 10 large-scale generated systems.

For each main project (`P1` ... `P10`), the expected materials are:

- `requirements.md` (project detailed requirements)
- `tasklist.md` (testable features including low-level tasks)
- `frontend/` (client-side code)
- `backend/` (server-side code)

## 2) `design_issues/` 

This folder contains details of design issues identified by two code analysis tools:

- `codescene/`: `P1`...`P10` individual `.xlsx` files + `Summary.xlsx`
- `sonarqube/`: `P1`...`P10` individual `.xlsx` files + `Summary.xlsx` + `Merged_Issues.xlsx` + `Technology_Specific_Issues.xlsx`

## 3) `manual_evaluation/` 

This folder contains a record of manual human evaluation of the 10 large-scale cursor-generated projects.

- `functional_correctness.xlsx`: master spreadsheet with manual-evaluation records
- Project folders (`P1` ... `P10`): containing screenshots of fulfilled functional requirements

## 4) `Project_Descriptions.pdf`

- List of project descriptions for generating large-scale projects


