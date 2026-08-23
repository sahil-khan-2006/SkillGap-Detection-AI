/**
 * SkillGap AI — Sample training dataset for the ML job-category classifier.
 *
 * IMPORTANT: This is SYNTHETIC SAMPLE DATA generated deterministically from
 * role-specific sentence pools (seed = 42). It contains no real people and no
 * real company names. It is used only to train the demo TF-IDF classifier so
 * the project runs out of the box. Replace `RESUME_DATASET` with your own
 * labeled resumes (e.g. the public "resume dataset" CSVs) for better accuracy.
 */

import { JOB_ROLES } from "./jobRoles";

export interface ResumeRecord {
  resume_text: string;
  job_role: string;
  skills: string[];
  experience: number;
}

/* ------------------------------------------------------------------ helpers */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface RolePool {
  summaries: string[];
  bullets: string[];
  projects: string[];
  skills: string[];
}

const POOLS: Record<string, RolePool> = {
  "java-developer": {
    summaries: [
      "Java developer experienced in building enterprise REST services with Spring Boot and Hibernate.",
      "Backend engineer focused on JVM based microservices, JPA and relational data modelling.",
      "Software developer with strong Core Java, Spring Boot and SQL experience across billing systems.",
    ],
    skills: ["Java", "Spring Boot", "Hibernate", "REST API", "MySQL", "Git", "Maven", "Data Structures", "Unit Testing", "Microservices", "Docker", "AWS"],
    bullets: [
      "Developed REST APIs using Spring Boot and Spring Data JPA for a customer onboarding service.",
      "Refactored a monolith into Spring Boot microservices with Docker based deployments.",
      "Optimized Hibernate queries and added indexes, cutting p95 response time by 40 percent.",
      "Wrote JUnit and Mockito tests reaching 80 percent service layer coverage.",
      "Implemented JWT authentication and role based authorization for internal admin tools.",
      "Built Maven based build pipelines and published artifacts to an internal repository.",
    ],
    projects: [
      "Employee Management REST API with Spring Boot, MySQL and Swagger documentation.",
      "Banking transaction service with Spring Batch jobs and scheduled reconciliation.",
      "Microservices demo with Eureka discovery, API gateway and Docker Compose.",
    ],
  },
  "python-developer": {
    summaries: [
      "Python developer building REST APIs, automation and data processing services.",
      "Backend engineer with Django, Flask and FastAPI experience and a testing-first mindset.",
      "Python-focused developer who enjoys automation, integrations and clean code.",
    ],
    skills: ["Python", "Django", "FastAPI", "Flask", "REST API", "PostgreSQL", "Redis", "Pandas", "Docker", "Git", "Unit Testing"],
    bullets: [
      "Built REST APIs with FastAPI and Flask consumed by three internal products.",
      "Automated manual reporting workflows with Python scripts saving several hours weekly.",
      "Created data cleaning pipelines with Pandas and scheduled them with cron.",
      "Wrote pytest suites and integrated them into GitHub Actions pipelines.",
      "Containerized Python services with Docker and managed PostgreSQL migrations.",
      "Integrated third party payment and notification APIs with retry logic.",
    ],
    projects: [
      "Expense splitting API built with FastAPI, PostgreSQL and JWT auth.",
      "Automated PDF and Excel report generator using Python and Jinja templates.",
      "Web scraping toolkit with rate limiting, proxies and structured output.",
    ],
  },
  "full-stack-developer": {
    summaries: [
      "Full stack developer owning features from database schema to responsive UI.",
      "Product engineer working across React frontends and Node/Java backends.",
      "Developer who ships end-to-end features with TypeScript, REST APIs and SQL.",
    ],
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "REST API", "MongoDB", "PostgreSQL", "Git", "Docker", "Tailwind CSS"],
    bullets: [
      "Delivered end-to-end features using React, Node.js and PostgreSQL.",
      "Designed REST APIs and matching typed client libraries in TypeScript.",
      "Built responsive admin dashboards with React, Tailwind CSS and Redux.",
      "Containerized the stack with Docker Compose for local development.",
      "Implemented authentication, file uploads and background jobs.",
      "Set up CI pipelines running lint, unit tests and build on every pull request.",
    ],
    projects: [
      "Marketplace web app with listings, cart, orders and seller roles.",
      "Realtime collaboration board using websockets and optimistic UI updates.",
      "Booking platform with server-side rendering and payment sandbox integration.",
    ],
  },
  "frontend-developer": {
    summaries: [
      "Frontend developer specialized in React, TypeScript and accessible UI engineering.",
      "UI engineer building responsive, performant web applications from Figma designs.",
      "Frontend focused developer with design system and web performance experience.",
    ],
    skills: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Next.js", "Tailwind CSS", "Redux", "Accessibility", "Figma", "Jest"],
    bullets: [
      "Built and maintained a React component library documented in Storybook.",
      "Improved Lighthouse performance scores using code splitting and memoization.",
      "Implemented WCAG 2.1 AA accessibility fixes across core user journeys.",
      "Integrated 20+ REST endpoints with typed clients and error boundaries.",
      "Collaborated with designers in Figma to translate designs into pixel-accurate UI.",
      "Wrote Jest and React Testing Library tests for critical components.",
    ],
    projects: [
      "Realtime chat interface built with Next.js and websockets.",
      "Design system package with theming, tokens and dark mode support.",
      "Analytics dashboard with virtualized tables and accessible charts.",
    ],
  },
  "backend-developer": {
    summaries: [
      "Backend developer designing scalable APIs, data models and service boundaries.",
      "Server-side engineer with a focus on reliability, caching and observability.",
      "API and data platform developer experienced with containers and cloud services.",
    ],
    skills: ["Java", "Python", "Node.js", "REST API", "SQL", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes", "System Design", "Microservices"],
    bullets: [
      "Designed REST APIs and database schemas for a multi-tenant platform.",
      "Introduced Redis caching that reduced database load by 55 percent.",
      "Implemented event driven workflows using Kafka topics and consumers.",
      "Added structured logging, metrics and alerts for all critical services.",
      "Deployed services on Kubernetes with health checks and autoscaling.",
      "Led system design reviews and documented service contracts.",
    ],
    projects: [
      "URL shortener service with Redis caching and rate limiting.",
      "Order processing system with message queues and idempotent consumers.",
      "Multi-tenant API gateway with authentication and quota management.",
    ],
  },
  "data-analyst": {
    summaries: [
      "Data analyst converting raw operational data into dashboards and decisions.",
      "Analyst with strong SQL, Excel and Python skills and a business-first mindset.",
      "Reporting analyst experienced in KPI definition, dashboards and ad-hoc analysis.",
    ],
    skills: ["SQL", "Excel", "Python", "Pandas", "Matplotlib", "Seaborn", "Data Analysis", "Statistics", "Data Visualization", "Power BI", "A/B Testing"],
    bullets: [
      "Built recurring Power BI dashboards used by regional business managers.",
      "Wrote complex SQL queries with window functions, CTEs and aggregations.",
      "Performed cohort, funnel and basket analysis using Python and Pandas.",
      "Automated weekly reporting with scheduled SQL extracts and Python scripts.",
      "Cleaned and validated three years of transactional data before migration.",
      "Partnered with stakeholders to define KPIs and reporting requirements.",
    ],
    projects: [
      "Sales performance dashboard combining four data sources.",
      "Customer segmentation using RFM analysis and clustering.",
      "Survey analysis report with visualized insights for leadership.",
    ],
  },
  "data-scientist": {
    summaries: [
      "Data scientist building predictive models and experiments that drive decisions.",
      "ML practitioner with strong statistics, Python and model evaluation background.",
      "Data scientist focused on applied machine learning and causal measurement.",
    ],
    skills: ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "Statistics", "SQL", "Data Visualization", "Feature Engineering", "Deep Learning", "A/B Testing"],
    bullets: [
      "Built churn prediction models with Scikit-learn improving recall by 18 percent.",
      "Designed and analyzed A/B tests, documenting statistical significance and power.",
      "Engineered features from raw event logs and validated them with cross-validation.",
      "Communicated model results to non-technical stakeholders through clear visuals.",
      "Built forecasting models for demand planning with time series methods.",
      "Collaborated with engineers to productionize models behind an API.",
    ],
    projects: [
      "Customer churn prediction with model comparison and error analysis.",
      "Credit risk scoring model with explainability using SHAP values.",
      "Recommendation prototype using collaborative filtering.",
    ],
  },
  "machine-learning-engineer": {
    summaries: [
      "Machine learning engineer productionizing training and inference pipelines.",
      "ML engineer focused on model deployment, monitoring and reproducible training.",
      "Engineer who bridges data science and platform engineering for ML systems.",
    ],
    skills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "MLOps", "Docker", "Kubernetes", "SQL", "AWS", "Scikit-learn", "Feature Engineering"],
    bullets: [
      "Built training pipelines with reproducible configs and experiment tracking.",
      "Deployed models behind a FastAPI service with Docker and autoscaling.",
      "Set up model monitoring for drift, latency and data quality regressions.",
      "Optimized inference latency by 3x using quantization and batching.",
      "Implemented feature pipelines feeding both training and online inference.",
      "Automated retraining jobs with GitHub Actions and cloud schedulers.",
    ],
    projects: [
      "Image classification service with model registry and canary rollout.",
      "Recommendation system deployed with feature store and online serving.",
      "Forecasting pipeline with automated backtesting and evaluation reports.",
    ],
  },
  "ai-engineer": {
    summaries: [
      "AI engineer building LLM and deep learning powered product features.",
      "Applied AI engineer working on NLP, retrieval augmented generation and evaluation.",
      "AI developer who takes models from prototype to production responsibly.",
    ],
    skills: ["Python", "Artificial Intelligence", "Machine Learning", "Deep Learning", "NLP", "LLM", "PyTorch", "TensorFlow", "Docker", "MLOps", "Computer Vision"],
    bullets: [
      "Built retrieval augmented generation pipelines over internal documentation.",
      "Fine-tuned transformer models for classification and summarization tasks.",
      "Created evaluation harnesses measuring groundedness, latency and cost.",
      "Shipped AI features behind feature flags with human-in-the-loop review.",
      "Trained computer vision models for defect detection on production images.",
      "Deployed models with Docker and monitored quality and token costs.",
    ],
    projects: [
      "RAG knowledge assistant with citations and offline evaluation set.",
      "Document summarizer with chunking strategies and quality scoring.",
      "Vision based quality inspection prototype using transfer learning.",
    ],
  },
  "devops-engineer": {
    summaries: [
      "DevOps engineer automating build, release and infrastructure workflows.",
      "Platform engineer focused on CI/CD, containers and reliable operations.",
      "SRE-minded engineer who treats infrastructure as code and automates everything.",
    ],
    skills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "AWS", "Bash", "Jenkins", "Prometheus", "Git", "Python"],
    bullets: [
      "Built CI/CD pipelines with GitHub Actions and Jenkins for 12 services.",
      "Managed AWS infrastructure with Terraform modules and remote state.",
      "Operated Kubernetes clusters including upgrades, autoscaling and ingress.",
      "Set up Prometheus and Grafana dashboards with SLO based alerting.",
      "Automated server provisioning and configuration with Ansible playbooks.",
      "Reduced deployment time from 45 minutes to 7 minutes through pipeline caching.",
    ],
    projects: [
      "GitOps deployment pipeline with Argo style rollouts and rollbacks.",
      "Infrastructure as code repository for a multi-environment AWS setup.",
      "Observability stack with metrics, logs and incident runbooks.",
    ],
  },
  "cloud-engineer": {
    summaries: [
      "Cloud engineer designing secure, scalable and cost-efficient infrastructure.",
      "Cloud infrastructure specialist with AWS, networking and IaC experience.",
      "Engineer who builds resilient cloud platforms and automates provisioning.",
    ],
    skills: ["AWS", "Azure", "Google Cloud", "Terraform", "Linux", "Docker", "Kubernetes", "Computer Networks", "Serverless", "Cloud Fundamentals", "Python", "Web Security"],
    bullets: [
      "Provisioned cloud infrastructure with Terraform across dev, staging and prod.",
      "Designed VPC networking, IAM policies and least-privilege access controls.",
      "Migrated on-premise workloads to AWS with minimal downtime.",
      "Implemented serverless workflows using Lambda, S3 and API Gateway.",
      "Optimized cloud spend by 28 percent through right-sizing and scheduling.",
      "Automated backups, disaster recovery drills and compliance reporting.",
    ],
    projects: [
      "Serverless file processing pipeline with S3 events and Lambda.",
      "Multi-cloud disaster recovery setup documented as code.",
      "Secure data lake foundation with encryption and access auditing.",
    ],
  },
  "android-developer": {
    summaries: [
      "Android developer building native apps with Kotlin and Jetpack Compose.",
      "Mobile engineer focused on clean architecture and smooth user experiences.",
      "Android app developer experienced with offline-first apps and Play Store releases.",
    ],
    skills: ["Kotlin", "Java", "Android", "Jetpack Compose", "REST API", "SQLite", "Firebase", "Git", "UI Design", "Unit Testing"],
    bullets: [
      "Developed Android features using Kotlin, coroutines and Jetpack Compose.",
      "Integrated REST APIs and cached responses with Room for offline support.",
      "Improved app startup time by 35 percent using lazy initialization.",
      "Wrote unit and UI tests, raising coverage on the presentation layer.",
      "Published releases to the Play Store and monitored crash-free sessions.",
      "Added push notifications and analytics using Firebase services.",
    ],
    projects: [
      "Offline-first expense tracker with Room database and charts.",
      "Habit tracking app with widgets, notifications and Material 3 theming.",
      "Ride booking UI prototype with maps integration and navigation flows.",
    ],
  },
  "software-engineer": {
    summaries: [
      "Software engineer with strong fundamentals across the stack and a testing mindset.",
      "Generalist developer who designs, builds and maintains production systems.",
      "Engineer comfortable in Java, Python and JavaScript with solid CS foundations.",
    ],
    skills: ["Java", "Python", "JavaScript", "Data Structures", "Object Oriented Programming", "SQL", "DBMS", "Git", "REST API", "System Design", "Unit Testing", "Operating Systems", "Computer Networks"],
    bullets: [
      "Implemented features across services using Java, Python and TypeScript.",
      "Solved performance bottlenecks identified through profiling and logging.",
      "Participated in design reviews and wrote technical design documents.",
      "Maintained unit and integration test suites as part of the release checklist.",
      "Mentored two interns and reviewed their pull requests daily.",
      "Debugged production incidents and wrote post-incident action items.",
    ],
    projects: [
      "Algorithm visualizer covering sorting, graphs and dynamic programming.",
      "Internal ticketing tool with role based access and audit logging.",
      "CLI productivity tool packaged and distributed internally.",
    ],
  },
  "ui-ux-designer": {
    summaries: [
      "UI/UX designer who turns research into accessible, intuitive product experiences.",
      "Product designer with a strong portfolio of end-to-end case studies.",
      "Designer comfortable with research, prototyping and design systems work.",
    ],
    skills: ["Figma", "UI Design", "UX Research", "Wireframing", "Design Systems", "Accessibility", "Photoshop", "Illustrator", "HTML", "CSS", "Documentation"],
    bullets: [
      "Conducted user interviews and usability tests to validate design decisions.",
      "Created wireframes, interactive prototypes and high fidelity UI in Figma.",
      "Built and maintained a component library with tokens and usage guidelines.",
      "Improved checkout completion by 12 percent through a redesigned flow.",
      "Annotated accessibility requirements and partnered with engineers on implementation.",
      "Documented research findings and shared them in cross-functional reviews.",
    ],
    projects: [
      "Mobile banking app redesign case study with research and testing.",
      "Design system for a multi-product SaaS suite with 60 components.",
      "Onboarding flow prototype validated with eight usability sessions.",
    ],
  },
};

const EDU_LINES = [
  "B.Tech in Computer Science and Engineering — 2023",
  "B.Tech in Information Technology — 2022",
  "B.Sc. Computer Science — 2024",
  "MCA — 2023",
  "M.Tech in Computer Science — 2024",
  "B.Des in Interaction Design — 2023",
  "B.Sc. Statistics — 2022",
];

function sampleN<T>(rng: () => number, pool: T[], n: number): T[] {
  const copy = [...pool];
  const out: T[] = [];
  const count = Math.max(1, Math.min(n, copy.length));
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/** Deterministically build the synthetic dataset (seed 42). */
function buildDataset(): ResumeRecord[] {
  const rng = mulberry32(42);
  const records: ResumeRecord[] = [];

  for (const role of JOB_ROLES) {
    const pool = POOLS[role.id];
    if (!pool) continue;
    const count = 18; // 14 roles × 18 = 252 records
    for (let i = 0; i < count; i++) {
      const summary = sampleN(rng, pool.summaries, 1)[0];
      const skills = sampleN(rng, pool.skills, 6 + Math.floor(rng() * 4));
      const bullets = sampleN(rng, pool.bullets, 3 + Math.floor(rng() * 2));
      const projects = sampleN(rng, pool.projects, 1 + Math.floor(rng() * 2));
      const experience = Math.round((rng() * 7 + 0.5) * 10) / 10; // 0.5 - 7.5 yrs
      const hasCloud = rng() > 0.5;
      const text = [
        `CANDIDATE ${i + 1} — ${role.name.toUpperCase()} PROFILE`,
        `SUMMARY`,
        summary,
        `EXPERIENCE (${experience} years)`,
        ...bullets.map((b) => `- ${b}`),
        `SKILLS`,
        skills.join(", "),
        hasCloud ? "Comfortable with version control, code reviews and agile delivery." : "",
        `PROJECTS`,
        ...projects.map((p) => `- ${p}`),
        `EDUCATION`,
        sampleN(rng, EDU_LINES, 1)[0],
      ]
        .filter(Boolean)
        .join("\n");

      records.push({ resume_text: text, job_role: role.name, skills, experience });
    }
  }
  return records;
}

export const RESUME_DATASET: ResumeRecord[] = buildDataset();

export const DATASET_META = {
  name: "SkillGap AI synthetic resume dataset",
  records: RESUME_DATASET.length,
  classes: JOB_ROLES.length,
  seed: 42,
  synthetic: true,
  note: "Sample/demo data generated from role-specific sentence pools. No real personal data.",
};
