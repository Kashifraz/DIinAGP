# Replication Package for the Paper: *Beyond Functional Correctness: Design Issues in AI IDE Generated Large-Scale Projects*

**DIinAGP** (<ins>D</ins>esign <ins>I</ins>ssues <ins>in</ins> <ins>A</ins>I IDE–<ins>G</ins>enerated Large-Scale <ins>P</ins>rojects)

This repository contains:
- Implementation code for the 10 large-scale projects generated using an AI IDE (e.g., Cursor)
- Design issue identified by two analysis tools (`CodeScene` and `SonarQube`)
- Human evaluation screenshots for calculating the functional correctness of the generated projects
- List of 10 detailed project descriptions for generating projects using Cursor

## 📁 Repository Structure

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
├── pilot-projects/
└── Project_Descriptions.pdf/



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
```
## 📁 `projects/`

The `projects/` folder stores the implementation artifacts for the 10 large-scale generated systems. 

For each main project (`P1` ... `P10`), the expected materials are:

- `requirements.md` (project detailed requirements)
- `tasklist.md` (testable features including low-level tasks)
- `frontend/` (client-side code)
- `backend/` (server-side code)

It also contains `Project_Descriptions.pdf`, which comprises a list of project descriptions for generating large-scale projects.

## 📁 `design_issues/` 

This folder contains details of design issues identified by two code analysis tools:

- `codescene/`: `P1`...`P10` individual `.xlsx` files + `Summary.xlsx`
- `sonarqube/`: `P1`...`P10` individual `.xlsx` files + `Summary.xlsx` + `Merged_Issues.xlsx` + `Technology_Specific_Issues.xlsx`

## 📁 `manual_evaluation/` 

This folder contains a record of manual human evaluation of the 10 large-scale cursor-generated projects.

- `functional_correctness.xlsx`: master spreadsheet with manual-evaluation records
- Project folders (`P1` ... `P10`): containing screenshots of fulfilled functional requirements

## 📝 Citation

```bibtex
@article{DIinAGP,
  author = {Mohammad Kashif, Syed and Li, Ruiyin and Liang, Peng and Tahir, Amjed and Feng, Qiong, Li, Zengyang and Shahin, Mojtaba},
  title = {{Beyond Functional Correctness: Design Issues in AI IDE Generated Large-Scale Projects}},
  journal={arXiv preprint arXiv:xxxx.xxxxx},
  year={2026}
}
```

