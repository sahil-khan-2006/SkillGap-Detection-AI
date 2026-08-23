/**
 * SkillGap AI — Configurable project recommendation catalog.
 * Projects are recommended by scoring their skill overlap with the learner's
 * missing skills and the target role's requirements.
 */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface ProjectRecommendation {
  id: string;
  title: string;
  difficulty: Difficulty;
  technologies: string[];
  skillsLearned: string[];
  description: string;
  why: string;
  estimatedHours: number;
  roles: string[];
}

export const PROJECTS: ProjectRecommendation[] = [
  {
    id: "employee-management-api",
    title: "Employee Management REST API",
    difficulty: "Intermediate",
    technologies: ["Java", "Spring Boot", "MySQL", "Docker"],
    skillsLearned: ["Java", "Spring Boot", "REST API", "Hibernate", "MySQL", "Docker", "Unit Testing"],
    description:
      "A layered CRUD service for employees and departments with validation, pagination, global exception handling, JWT-based authentication and an OpenAPI contract.",
    why: "This single project demonstrates the exact stack recruiters screen for in Java/backend roles: Spring Boot + JPA + a relational database, containerized and tested.",
    estimatedHours: 32,
    roles: ["java-developer", "backend-developer", "software-engineer", "full-stack-developer"],
  },
  {
    id: "url-shortener-microservice",
    title: "Distributed URL Shortener",
    difficulty: "Advanced",
    technologies: ["Java", "Spring Boot", "Redis", "Docker", "Kubernetes"],
    skillsLearned: ["System Design", "Microservices", "Redis", "Caching", "Docker", "Kubernetes", "REST API"],
    description:
      "A high-throughput shortener with base62 encoding, Redis caching, rate limiting, health checks and horizontal scaling behind a load balancer.",
    why: "A classic system-design interview problem turned into working code — proves you understand caching, scaling and service boundaries.",
    estimatedHours: 40,
    roles: ["backend-developer", "java-developer", "software-engineer", "devops-engineer"],
  },
  {
    id: "skill-dashboard-react",
    title: "Analytics Dashboard Frontend",
    difficulty: "Intermediate",
    technologies: ["React", "TypeScript", "Tailwind CSS", "REST API"],
    skillsLearned: ["React", "TypeScript", "Data Visualization", "REST API", "Tailwind CSS", "Accessibility"],
    description:
      "A responsive dashboard with authentication, server-side pagination, client caching, charts and keyboard-accessible components consuming a public REST API.",
    why: "Frontend hiring managers look for real data-fetching, state management and accessibility work — not todo apps.",
    estimatedHours: 28,
    roles: ["frontend-developer", "full-stack-developer", "ui-ux-designer"],
  },
  {
    id: "fullstack-marketplace",
    title: "Full-Stack Marketplace App",
    difficulty: "Advanced",
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    skillsLearned: ["TypeScript", "React", "Node.js", "Next.js", "REST API", "PostgreSQL", "Authentication & Authorization", "Docker"],
    description:
      "A marketplace with listings, search, cart, orders, seller roles, payments sandbox integration and server-side rendering for SEO.",
    why: "End-to-end ownership (auth → data model → UI → deploy) is the strongest signal for full-stack roles.",
    estimatedHours: 55,
    roles: ["full-stack-developer", "backend-developer", "frontend-developer", "software-engineer"],
  },
  {
    id: "ml-salary-predictor",
    title: "Salary Prediction ML Pipeline",
    difficulty: "Intermediate",
    technologies: ["Python", "Pandas", "Scikit-learn", "Matplotlib"],
    skillsLearned: ["Machine Learning", "Pandas", "Scikit-learn", "Feature Engineering", "Data Analysis", "Matplotlib"],
    description:
      "End-to-end regression project: data cleaning, feature engineering, model comparison, cross-validation, error analysis and a small Flask API for inference.",
    why: "Shows you can own the full ML workflow including evaluation and error analysis, not just call model.fit().",
    estimatedHours: 30,
    roles: ["data-scientist", "machine-learning-engineer", "data-analyst", "python-developer"],
  },
  {
    id: "customer-churn-analysis",
    title: "Customer Churn Analysis & Dashboard",
    difficulty: "Beginner",
    technologies: ["Python", "SQL", "Pandas", "Power BI / Tableau"],
    skillsLearned: ["Data Analysis", "SQL", "Pandas", "Data Visualization", "Statistics", "Business Intelligence"],
    description:
      "Extract customer data with SQL, profile and clean it in Pandas, run cohort and churn analysis, and publish an interactive dashboard with 5 business recommendations.",
    why: "Analyst interviews are portfolio-driven — one clean dashboard with real insights beats a dozen certificates.",
    estimatedHours: 22,
    roles: ["data-analyst", "data-scientist"],
  },
  {
    id: "resume-parser-ml",
    title: "Resume Parser & Job Matcher (NLP)",
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "TF-IDF", "Scikit-learn", "FastAPI"],
    skillsLearned: ["NLP", "Machine Learning", "Python", "Scikit-learn", "FastAPI", "Feature Engineering"],
    description:
      "An NLP pipeline that extracts skills from resumes, vectorizes text with TF-IDF, trains a job-category classifier and serves predictions through an API.",
    why: "Directly relevant to AI/NLP roles and it is the same class of problem this platform solves.",
    estimatedHours: 38,
    roles: ["ai-engineer", "machine-learning-engineer", "data-scientist", "python-developer"],
  },
  {
    id: "image-classifier-cnn",
    title: "CNN Image Classifier with Web UI",
    difficulty: "Advanced",
    technologies: ["Python", "TensorFlow", "PyTorch", "Docker", "FastAPI"],
    skillsLearned: ["Deep Learning", "Computer Vision", "TensorFlow", "PyTorch", "MLOps", "Docker"],
    description:
      "Train a convolutional network (with transfer learning) on an image dataset, track experiments, export the model and serve predictions behind a simple web UI.",
    why: "Deep learning roles expect evidence of training, evaluating and serving models — this covers all three.",
    estimatedHours: 45,
    roles: ["machine-learning-engineer", "ai-engineer", "data-scientist"],
  },
  {
    id: "llm-rag-assistant",
    title: "RAG Knowledge Assistant",
    difficulty: "Advanced",
    technologies: ["Python", "LLM", "Vector DB", "FastAPI", "Docker"],
    skillsLearned: ["LLM", "NLP", "Python", "FastAPI", "Docker", "System Design"],
    description:
      "A retrieval-augmented assistant that chunks documents, embeds them into a local vector store, retrieves relevant context and answers with citations, plus an evaluation set.",
    why: "RAG is the most requested applied-AI skill right now; shipping one with an eval loop stands out immediately.",
    estimatedHours: 42,
    roles: ["ai-engineer", "machine-learning-engineer", "backend-developer"],
  },
  {
    id: "ci-cd-pipeline-docker-k8s",
    title: "Automated CI/CD Pipeline with GitOps",
    difficulty: "Advanced",
    technologies: ["GitHub Actions", "Docker", "Kubernetes", "Terraform", "AWS"],
    skillsLearned: ["CI/CD", "Docker", "Kubernetes", "Terraform", "AWS", "Linux", "Bash"],
    description:
      "Provision infrastructure with Terraform, containerize an app, set up GitHub Actions for test/build/deploy, and roll out to Kubernetes with health checks and rollbacks.",
    why: "DevOps hiring is practically a demo of this pipeline — build it once and you can talk through every stage in an interview.",
    estimatedHours: 50,
    roles: ["devops-engineer", "cloud-engineer", "backend-developer"],
  },
  {
    id: "cloud-file-vault",
    title: "Serverless Secure File Vault",
    difficulty: "Intermediate",
    technologies: ["AWS", "Serverless", "Terraform", "Python"],
    skillsLearned: ["AWS", "Serverless", "Cloud Fundamentals", "Terraform", "Python", "Web Security"],
    description:
      "An S3-backed file vault with pre-signed uploads, Lambda-based processing, IAM least-privilege policies, encryption at rest and everything defined as code.",
    why: "Cloud roles want IaC plus security awareness; this project makes both visible and reviewable on GitHub.",
    estimatedHours: 34,
    roles: ["cloud-engineer", "devops-engineer", "backend-developer"],
  },
  {
    id: "android-expense-tracker",
    title: "Offline-First Android Expense Tracker",
    difficulty: "Intermediate",
    technologies: ["Kotlin", "Jetpack Compose", "Room", "Firebase"],
    skillsLearned: ["Kotlin", "Android", "Jetpack Compose", "SQLite", "Firebase", "UI Design"],
    description:
      "A Material 3 Android app with local persistence, background sync, charts, notifications and an offline-first repository layer.",
    why: "Android portfolios need a published-quality app with clean architecture — this one covers Compose, Room and sync.",
    estimatedHours: 36,
    roles: ["android-developer", "frontend-developer"],
  },
  {
    id: "dsa-problem-tracker",
    title: "DSA Practice Tracker & Visualizer",
    difficulty: "Beginner",
    technologies: ["Java", "Python", "Data Structures", "React"],
    skillsLearned: ["Data Structures", "Java", "Python", "Object Oriented Programming", "React"],
    description:
      "Track 300+ solved problems by pattern, schedule spaced repetition, and visualize sorting/graph algorithms step by step.",
    why: "Interview-ready DSA plus a visible consistency record — it doubles as a study tool and a portfolio piece.",
    estimatedHours: 24,
    roles: ["software-engineer", "java-developer", "python-developer", "backend-developer"],
  },
  {
    id: "log-monitoring-stack",
    title: "Observability Stack for a Microservice",
    difficulty: "Intermediate",
    technologies: ["Prometheus", "Grafana", "Docker", "Linux", "Python"],
    skillsLearned: ["Prometheus", "Docker", "Linux", "Bash", "System Design", "Python"],
    description:
      "Instrument a service with metrics, ship logs, build Grafana dashboards, define SLOs and configure alerts with a documented incident runbook.",
    why: "SRE/DevOps interviews probe on 'what happens when it breaks' — an SLO + alerting project answers that convincingly.",
    estimatedHours: 28,
    roles: ["devops-engineer", "cloud-engineer", "backend-developer"],
  },
  {
    id: "portfolio-design-system",
    title: "Design System & Case Study Portfolio",
    difficulty: "Intermediate",
    technologies: ["Figma", "Design Systems", "Accessibility", "React"],
    skillsLearned: ["Figma", "Design Systems", "UI Design", "UX Research", "Accessibility", "Wireframing"],
    description:
      "Research a real usability problem, define personas and flows, then build a documented component library with tokens, states and accessibility annotations.",
    why: "Design portfolios are judged on process and systems thinking, not just pretty screens.",
    estimatedHours: 30,
    roles: ["ui-ux-designer", "frontend-developer"],
  },
  {
    id: "python-automation-suite",
    title: "Python Automation & Reporting Suite",
    difficulty: "Beginner",
    technologies: ["Python", "SQL", "Bash", "Docker"],
    skillsLearned: ["Python", "SQL", "Bash", "Unit Testing", "ETL", "Docker"],
    description:
      "A scheduled suite that pulls data from APIs and databases, transforms it, generates PDF/Excel reports and emails stakeholders, with pytest coverage.",
    why: "Automation impact is easy to quantify on a resume (hours saved per week) and shows scripting maturity.",
    estimatedHours: 20,
    roles: ["python-developer", "data-analyst", "backend-developer", "devops-engineer"],
  },
];

export const PROJECTS_BY_ID = new Map(PROJECTS.map((p) => [p.id, p]));
