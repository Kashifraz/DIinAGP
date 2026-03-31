# AI IDE Replication Package

This repository is a replication package for a research study on large-scale software generation with AI IDEs (e.g., Cursor).  
It contains:

- Source code for 10 generated projects
- Design issue reports from two analysis tools (`CodeScene` and `SonarQube`)
- Manual functional-correctness evaluation artifacts and evidence

## Repository Structure

```text
.
├── projects/
│   ├── P1_CVbuilder/
│   ├── P2_VocabularyApp/
│   ├── P3_Ecommerce/
│   ├── P4_JobApplication/
│   ├── P5_ChartMaker/
│   ├── P6_FormPlugin/
│   ├── P7_BlogWebsite/
│   ├── P8_SocialApp/
│   ├── P9_LMS/
│   ├── P10_POS/
│   └── pilot-projects/
├── design_issues/
│   ├── codescene/
│   └── sonarqube/
└── manual_evaluation/
    ├── P1_CVBuilder/ ... P10_POS/
    └── functional_correctness.xlsx
```

## 1) `projects/` - Generated Project Implementations

The `projects/` folder stores the implementation artifacts for the 10 large-scale generated systems.

For each main project (`P1` ... `P10`), the expected materials are:

- `requirements.md` (project requirements/specification)
- `tasklist.md` (planned implementation tasks)
- `frontend/` (client-side code)
- `backend/` (server-side code)

### Notes from the current repository snapshot

- All 10 projects include `requirements.md` and `tasklist.md`.
- Most projects contain both `frontend/` and `backend/`.
- `P6_FormPlugin` currently includes the markdown files but does not include `frontend/` or `backend/`.
- `P7_BlogWebsite` currently includes `backend/` but no `frontend/`.
- `pilot-projects/` is an additional folder with extra project material not part of the core `P1`-`P10` set.

## 2) `design_issues/` - Static/Design Analysis Outputs

This folder contains issue reports produced by two code analysis tools:

- `design_issues/codescene/`
- `design_issues/sonarqube/`

Each tool subfolder includes per-project spreadsheets (one file per project) with detailed findings.

### File organization

- `codescene/`: `P1`...`P10` individual `.xlsx` files + `Summary.xlsx`
- `sonarqube/`: `P1`...`P10` individual `.xlsx` files + `Summary.xlsx` + `Merged_Issues.xlsx`

In total, the repository currently contains 23 spreadsheets under `design_issues/`.

## 3) `manual_evaluation/` - Functional Correctness Validation

This folder documents manual human evaluation of generated project functionality.

- `functional_correctness.xlsx`: master spreadsheet with manual-evaluation records
- Project folders (`P1_*` ... `P10_*`): requirement-level evidence files

The evidence files are currently stored as `.pdf` captures (164 files in total), which provide verifiable proof that requirements were fulfilled during evaluation.

## Naming Conventions and Minor Inconsistencies

There are small naming differences between folders across sections (for example, `P1_CVbuilder` in `projects/` vs `P1_CVBuilder` in `design_issues/` and `manual_evaluation/`; and `P2_VocabularyApp` vs `P2_Vocabulary` in `manual_evaluation/`).  
These appear to refer to the same project identities (`P1`...`P10`) and should be interpreted accordingly during analysis.

## Intended Usage

This package enables replication and secondary analysis by providing:

- Generated source projects
- Tool-based design issue datasets (CodeScene and SonarQube)
- Human-evaluated functional-correctness records with supporting evidence

