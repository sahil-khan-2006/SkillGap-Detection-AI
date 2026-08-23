/**
 * SkillGap AI — Demo profiles.
 * These let a first-time visitor see the complete dashboard without uploading
 * a resume (Demo Mode). The text below is hand-written sample data.
 */

export interface DemoProfile {
  id: string;
  label: string;
  name: string;
  headline: string;
  targetRole: string;
  accent: string;
  resumeText: string;
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: "demo-java",
    label: "Java Developer",
    name: "Aarav Sharma",
    headline: "B.Tech CSE final year · 2 internships · Core Java + Web",
    targetRole: "java-developer",
    accent: "from-amber-500/20 to-orange-500/10",
    resumeText: `AARAV SHARMA
B.Tech Computer Science, Final Year | aarav.sharma@example.com | +91-90000-00001
SUMMARY
Motivated computer science student with hands-on experience building web applications using Core Java, Hibernate and MySQL. Strong foundation in object oriented programming, data structures and SQL. Comfortable with Git-based team workflows.

SKILLS
Programming: Java, Python (basic), SQL
Web: HTML, CSS, JavaScript (basic), JSP Servlet
Databases: MySQL
Concepts: Object Oriented Programming, Data Structures and Algorithms, DBMS
Tools: Git, GitHub, Eclipse, Maven

EXPERIENCE
Web Development Intern — Campus Innovation Lab (6 months)
- Built a library management web application using JSP Servlet and MySQL with 12 database tables.
- Implemented CRUD operations, search and fine calculation modules using JDBC.
- Reduced duplicate records by adding uniqueness constraints and input validation.
- Participated in code reviews and used Git branches for every feature.

PROJECTS
1. Student Result Management System
   - Java desktop application with Swing UI and MySQL backend.
   - Implemented role based login for admin, teacher and student.
2. Library Management System
   - JSP/Servlet web app with JDBC connection pooling and MVC structure.
3. DSA Practice Repository
   - 150+ problems solved in Java covering arrays, linked lists, trees and dynamic programming.

CERTIFICATIONS
- Java Programming Fundamentals — online course completion
- SQL for Data Analysis — online course completion

EDUCATION
B.Tech in Computer Science and Engineering — 2026 (CGPA 8.1)
Class XII (PCM) — 92% | Class X — 94%
`,
  },
  {
    id: "demo-python",
    label: "Python Developer",
    name: "Neha Verma",
    headline: "Backend & automation enthusiast · Python, Flask, PostgreSQL",
    targetRole: "python-developer",
    accent: "from-emerald-500/20 to-teal-500/10",
    resumeText: `NEHA VERMA
Python Developer | neha.verma@example.com | +91-90000-00002
SUMMARY
Python developer with 2 years of experience building REST APIs, automation scripts and data processing jobs. Comfortable owning a feature from requirement to deployment.

SKILLS
Languages: Python, SQL, JavaScript (basic)
Frameworks: Flask, FastAPI, Django (basic)
Data: Pandas, NumPy, Matplotlib
Databases: PostgreSQL, SQLite, Redis (basic)
Tools: Git, GitHub, Docker (basic), Postman, Linux
Practices: Unit testing with pytest, Agile, code reviews

EXPERIENCE
Backend Developer — Mid-size SaaS company (2 years)
- Developed 18 REST API endpoints using Flask and FastAPI serving 40k requests/day.
- Automated a manual reporting workflow with Python scripts, saving ~6 hours per week.
- Built data cleaning pipelines with Pandas processing 2 GB of CSV data nightly.
- Wrote pytest unit tests raising service coverage from 35% to 78%.
- Containerized two services with Docker and documented deployment steps.

PROJECTS
1. Expense Splitter API
   - FastAPI service with JWT auth, PostgreSQL and Alembic migrations.
2. Automated Report Generator
   - Python package producing formatted Excel and PDF reports from SQL queries.
3. Web Scraping Toolkit
   - Scripts with retry logic, rate limiting and structured JSON output.

EDUCATION
B.Sc. Computer Science — 2023
`,
  },
  {
    id: "demo-data-analyst",
    label: "Data Analyst",
    name: "Rahul Menon",
    headline: "Excel + SQL + Python · dashboards and business insights",
    targetRole: "data-analyst",
    accent: "from-sky-500/20 to-indigo-500/10",
    resumeText: `RAHUL MENON
Data Analyst | rahul.menon@example.com | +91-90000-00003
SUMMARY
Detail-oriented analyst with 1.5 years of experience turning messy operational data into dashboards and decisions. Strong in SQL, Advanced Excel and Python for analysis.

SKILLS
Analysis: Data Analysis, Exploratory Data Analysis, Statistics, A/B Testing (basic)
Languages: SQL, Python
Libraries: Pandas, NumPy, Matplotlib, Seaborn
Tools: Advanced Excel, Power BI, Google Sheets
Databases: MySQL, PostgreSQL (basic)
Other: Data Visualization, report documentation

EXPERIENCE
Data Analyst — Retail analytics team (1.5 years)
- Built 12 recurring Power BI dashboards used by regional managers.
- Wrote complex SQL queries with joins, window functions and aggregations.
- Performed cohort and basket analysis in Python (Pandas), identifying a 7% upsell opportunity.
- Automated weekly reporting with Python scripts and scheduled SQL extracts.
- Cleaned and validated 3 years of transactional data before migration.

PROJECTS
1. Sales Performance Dashboard
   - Power BI dashboard combining 4 data sources with drill-through reports.
2. Customer Segmentation Analysis
   - RFM segmentation using Pandas and K-means; presented findings to leadership.
3. Survey Insights Report
   - Analyzed 4,000 responses, visualized results with Seaborn and Matplotlib.

EDUCATION
B.Com (Honours) — 2022
Google Data Analytics Professional Certificate — 2023
`,
  },
  {
    id: "demo-frontend",
    label: "Frontend Developer",
    name: "Ishita Roy",
    headline: "React + TypeScript · accessibility-focused UI engineer",
    targetRole: "frontend-developer",
    accent: "from-fuchsia-500/20 to-purple-500/10",
    resumeText: `ISHITA ROY
Frontend Developer | ishita.roy@example.com | +91-90000-00004
SUMMARY
Frontend developer who enjoys building accessible, fast interfaces. Two years of React and TypeScript work on design-system driven products.

SKILLS
Languages: JavaScript, TypeScript, HTML5, CSS3
Frameworks: React, Next.js, Tailwind CSS, Redux Toolkit
Testing: Jest, React Testing Library
Design: Figma (hand-off), responsive layouts, accessibility/WCAG basics
Tools: Git, GitHub, Vite, npm, Storybook
Concepts: REST API integration, state management, web performance

EXPERIENCE
Frontend Engineer — Product studio (2 years)
- Migrated a 60-screen admin panel from class components to React hooks + TypeScript.
- Built a reusable component library (28 components) documented in Storybook.
- Improved Lighthouse performance score from 61 to 94 via code splitting and memoization.
- Implemented keyboard navigation and ARIA labels to meet WCAG 2.1 AA on core flows.
- Integrated 20+ REST endpoints with typed clients and optimistic UI updates.

PROJECTS
1. Realtime Chat UI
   - Next.js app with websocket messaging, typing indicators and virtualized lists.
2. Component Library
   - Tailwind + TypeScript design system with theming and dark mode.
3. Weather Dashboard
   - Client-side caching, geolocation and accessible data visualizations.

EDUCATION
B.Tech Information Technology — 2023
`,
  },
];

export const DEMO_BY_ID = new Map(DEMO_PROFILES.map((p) => [p.id, p]));
