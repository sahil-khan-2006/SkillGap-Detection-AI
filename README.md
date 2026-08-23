# SkillGap Detection AI

SkillGap Detection AI is a Next.js application that analyzes a resume against a target job role or job description, detects missing skills, calculates a match score, and generates a personalized learning roadmap with project recommendations.

## Short Description

AI-powered resume and job-skill gap analyzer that uses local NLP/ML to extract skills, compare them with job requirements, and recommend learning paths, projects, and career opportunities.

## Features

- Resume upload and text extraction from PDF, DOCX, and TXT files
- Job role selection and job description analysis
- Skill extraction with alias normalization
- Skill gap detection with matched, partial, and missing skills
- Compatibility match score based on weighted scoring components
- Learning roadmap with weekly skill-building steps
- Project recommendations based on missing skills
- Career recommendations using local ML classification
- Demo mode for testing without uploading a resume
- PostgreSQL and Drizzle ORM support for storing analysis history

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- Local NLP and ML utilities

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd SkillGap-Detection-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root if you want to use PostgreSQL storage:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Some demo and analysis features can run locally without external paid AI APIs.

### 4. Run the Development Server

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the app for production.

```bash
npm run start
```

Runs the production build.

```bash
npm run lint
```

Runs ESLint checks.

```bash
npm run typecheck
```

Runs TypeScript type checking.

## Project Structure

```text
src/
  app/          Next.js pages and API routes
  components/   Reusable UI and app components
  data/         Job roles, skills, projects, and demo profiles
  db/           Drizzle ORM database schema and connection
  engine/       Resume parsing, skill matching, scoring, and roadmap logic
  lib/          Shared helpers
  ml/           Local ML classifier, TF-IDF, and model store
```

## Important Git Note

The following folders should not be uploaded to GitHub:

```text
node_modules/
.next/
```

They are generated automatically after running:

```bash
npm install
npm run dev
```

or:

```bash
npm run build
```

## Disclaimer

The match score and recommendations are learning guidance tools. They do not guarantee hiring outcomes or represent official recruiter decisions.
