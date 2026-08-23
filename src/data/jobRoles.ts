/**
 * SkillGap AI — Target Job Role Dataset
 * -------------------------------------
 * Adding a role = adding one entry here. Nothing else in the app has to change.
 * importance: 1..5 (5 = must-have day-one skill for this role)
 */

export interface RoleSkill {
  skill: string;
  importance: number;
}

export interface JobRole {
  id: string;
  name: string;
  family: string;
  summary: string;
  responsibilities: string[];
  minExperienceYears: number;
  education: string[];
  certifications: string[];
  required: RoleSkill[];
  preferred: RoleSkill[];
  defaultDescription: string;
}

const r = (skill: string, importance: number): RoleSkill => ({ skill, importance });

export const JOB_ROLES: JobRole[] = [
  {
    id: "java-developer",
    name: "Java Developer",
    family: "Software Engineering",
    summary: "Builds and maintains server-side applications on the JVM using Spring Boot, REST services and relational databases.",
    responsibilities: [
      "Design and develop REST APIs with Spring Boot",
      "Model and optimize relational database schemas",
      "Write unit and integration tests for services",
      "Collaborate on code reviews and CI/CD pipelines",
    ],
    minExperienceYears: 2,
    education: ["B.Tech/B.E. in Computer Science", "B.Sc. Computer Science", "MCA"],
    certifications: ["Oracle Certified Professional: Java SE", "AWS Certified Developer"],
    required: [
      r("Java", 5), r("Spring Boot", 5), r("REST API", 5), r("SQL", 5), r("Hibernate", 4),
      r("MySQL", 4), r("Git", 4), r("Data Structures", 4), r("Maven", 3), r("Unit Testing", 4),
    ],
    preferred: [
      r("Microservices", 4), r("Docker", 4), r("AWS", 3), r("Kafka", 3), r("Kubernetes", 2),
      r("System Design", 3), r("CI/CD", 3), r("Redis", 2),
    ],
    defaultDescription:
      "We are looking for a Java Developer with hands-on experience in Java, Spring Boot, REST APIs, Hibernate/JPA, MySQL and Git. The candidate should be comfortable writing unit tests with JUnit, working with Maven and understanding object oriented design. Knowledge of microservices, Docker and AWS is preferred.",
  },
  {
    id: "python-developer",
    name: "Python Developer",
    family: "Software Engineering",
    summary: "Develops backend services, automation and data-driven applications using Python and modern web frameworks.",
    responsibilities: [
      "Build REST APIs using Django/Flask/FastAPI",
      "Write clean, testable and documented Python code",
      "Integrate third-party APIs and databases",
      "Automate recurring processes and reporting",
    ],
    minExperienceYears: 1,
    education: ["B.Tech/B.E.", "B.Sc. Computer Science", "MCA"],
    certifications: ["Python Institute PCAP", "AWS Certified Developer"],
    required: [
      r("Python", 5), r("SQL", 4), r("REST API", 4), r("Git", 4), r("Django", 4),
      r("Data Structures", 4), r("Unit Testing", 3), r("Object Oriented Programming", 4),
    ],
    preferred: [
      r("FastAPI", 3), r("Flask", 3), r("Docker", 4), r("AWS", 3), r("Pandas", 3),
      r("Redis", 2), r("Celery-like task queues", 1), r("CI/CD", 3),
    ],
    defaultDescription:
      "We are hiring a Python Developer with strong Python fundamentals, experience with Django or FastAPI, REST API design, SQL databases and Git. Exposure to Docker, cloud deployment and data processing with Pandas is a plus.",
  },
  {
    id: "full-stack-developer",
    name: "Full Stack Developer",
    family: "Software Engineering",
    summary: "Owns features end to end: responsive front-end interfaces plus the APIs and data layers behind them.",
    responsibilities: [
      "Build responsive UIs with React and modern CSS",
      "Design and consume REST APIs",
      "Model data and manage schema migrations",
      "Deploy and monitor features in production",
    ],
    minExperienceYears: 2,
    education: ["B.Tech/B.E.", "B.Sc. Computer Science", "Bootcamp + portfolio"],
    certifications: ["AWS Certified Developer", "Meta Front-End Professional Certificate"],
    required: [
      r("JavaScript", 5), r("React", 5), r("HTML", 4), r("CSS", 4), r("Node.js", 4),
      r("REST API", 5), r("SQL", 4), r("Git", 4), r("TypeScript", 3),
    ],
    preferred: [
      r("Next.js", 3), r("MongoDB", 3), r("Docker", 3), r("Tailwind CSS", 3), r("CI/CD", 3),
      r("AWS", 3), r("Unit Testing", 3), r("GraphQL", 2),
    ],
    defaultDescription:
      "Looking for a Full Stack Developer skilled in JavaScript/TypeScript, React, Node.js, REST API development and SQL/NoSQL databases. Experience with Git, Docker and cloud deployment is preferred.",
  },
  {
    id: "frontend-developer",
    name: "Frontend Developer",
    family: "Software Engineering",
    summary: "Translates product design into fast, accessible and responsive web interfaces.",
    responsibilities: [
      "Implement pixel-accurate, responsive components",
      "Manage application state and data fetching",
      "Optimize performance and accessibility",
      "Collaborate closely with designers",
    ],
    minExperienceYears: 1,
    education: ["B.Tech/B.E.", "B.Sc. Computer Science", "Design + code bootcamp"],
    certifications: ["Meta Front-End Professional Certificate"],
    required: [
      r("JavaScript", 5), r("React", 5), r("HTML", 5), r("CSS", 5), r("TypeScript", 4),
      r("Git", 4), r("REST API", 3), r("Responsive design", 1),
    ],
    preferred: [
      r("Next.js", 3), r("Tailwind CSS", 3), r("Redux", 3), r("Accessibility", 3),
      r("Unit Testing", 3), r("Figma", 3), r("CI/CD", 2),
    ],
    defaultDescription:
      "We need a Frontend Developer with strong JavaScript, TypeScript, React, HTML and CSS skills. You should understand responsive layouts, accessibility, state management and how to consume REST APIs. Experience with Next.js and Figma hand-off is a plus.",
  },
  {
    id: "backend-developer",
    name: "Backend Developer",
    family: "Software Engineering",
    summary: "Designs APIs, services and data stores that power products, with a focus on scalability and reliability.",
    responsibilities: [
      "Design REST APIs and service boundaries",
      "Optimize database queries and caching",
      "Implement authentication and authorization",
      "Instrument services with logs and metrics",
    ],
    minExperienceYears: 2,
    education: ["B.Tech/B.E.", "B.Sc. Computer Science", "MCA"],
    certifications: ["AWS Certified Developer", "Oracle Certified Professional: Java SE"],
    required: [
      r("Java", 4), r("Python", 4), r("Node.js", 4), r("REST API", 5), r("SQL", 5),
      r("Git", 4), r("Data Structures", 4), r("System Design", 4), r("Docker", 3),
    ],
    preferred: [
      r("Microservices", 4), r("Kubernetes", 3), r("AWS", 4), r("Redis", 3), r("Kafka", 3),
      r("CI/CD", 3), r("Authentication & Authorization", 3), r("Message Queues", 3),
    ],
    defaultDescription:
      "Hiring a Backend Developer experienced with server-side languages (Java/Python/Node.js), REST API design, relational databases, caching and containerization. Knowledge of microservices, message queues and cloud platforms is preferred.",
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    family: "Data",
    summary: "Turns raw data into dashboards, reports and decisions that stakeholders can act on.",
    responsibilities: [
      "Clean, transform and validate datasets",
      "Build dashboards and recurring reports",
      "Run ad-hoc analyses and present insights",
      "Partner with product and business teams",
    ],
    minExperienceYears: 1,
    education: ["B.Tech/B.E.", "B.Sc. Statistics/Mathematics", "B.Com + analytics certification"],
    certifications: ["Google Data Analytics Professional Certificate", "Microsoft PL-300 Power BI"],
    required: [
      r("SQL", 5), r("Excel", 4), r("Python", 4), r("Pandas", 4), r("Data Visualization", 5),
      r("Statistics", 4), r("Data Analysis", 5), r("Matplotlib", 3),
    ],
    preferred: [
      r("Tableau", 3), r("Business Intelligence", 3), r("Seaborn", 2), r("ETL", 3),
      r("A/B Testing", 3), r("Big Data", 2), r("Google Cloud", 2), r("Documentation", 3),
    ],
    defaultDescription:
      "We are looking for a Data Analyst with strong SQL, Advanced Excel, Python (Pandas, Matplotlib), statistics and dashboarding skills. Experience with Power BI/Tableau and A/B testing is preferred.",
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    family: "Data",
    summary: "Builds predictive models and experiments that quantify and improve business outcomes.",
    responsibilities: [
      "Frame business problems as ML problems",
      "Build, validate and ship predictive models",
      "Design and analyze experiments",
      "Communicate results to non-technical stakeholders",
    ],
    minExperienceYears: 2,
    education: ["B.Tech/B.E.", "M.Tech", "M.Sc. Statistics/Mathematics"],
    certifications: ["Google Professional Machine Learning Engineer", "IBM Data Science Professional"],
    required: [
      r("Python", 5), r("Machine Learning", 5), r("Pandas", 5), r("NumPy", 4), r("Statistics", 5),
      r("Scikit-learn", 4), r("SQL", 4), r("Data Visualization", 4), r("Feature Engineering", 4),
    ],
    preferred: [
      r("Deep Learning", 4), r("TensorFlow", 3), r("PyTorch", 3), r("A/B Testing", 3),
      r("Big Data", 3), r("MLOps", 3), r("NLP", 3), r("AWS", 2),
    ],
    defaultDescription:
      "Seeking a Data Scientist with Python, statistics, machine learning, Pandas/NumPy, Scikit-learn, SQL and data visualization skills. Exposure to deep learning, experimentation and MLOps is preferred.",
  },
  {
    id: "machine-learning-engineer",
    name: "Machine Learning Engineer",
    family: "Data",
    summary: "Productionizes machine learning systems — data pipelines, training, deployment and monitoring.",
    responsibilities: [
      "Build training and inference pipelines",
      "Deploy and monitor models in production",
      "Optimize model latency, cost and quality",
      "Collaborate with data scientists and platform teams",
    ],
    minExperienceYears: 2,
    education: ["B.Tech/B.E.", "M.Tech", "M.Sc. Computer Science"],
    certifications: ["Google Professional Machine Learning Engineer", "AWS Certified Machine Learning"],
    required: [
      r("Python", 5), r("Machine Learning", 5), r("Deep Learning", 5), r("TensorFlow", 4), r("PyTorch", 4),
      r("Scikit-learn", 4), r("MLOps", 4), r("Docker", 4), r("SQL", 4), r("NumPy", 4),
    ],
    preferred: [
      r("AWS", 4), r("Kubernetes", 3), r("MLflow-like tracking", 1), r("Big Data", 3),
      r("System Design", 3), r("CI/CD", 3), r("LLM", 3), r("Feature Engineering", 3),
    ],
    defaultDescription:
      "Hiring a Machine Learning Engineer skilled in Python, machine learning and deep learning, TensorFlow/PyTorch, model deployment (MLOps), Docker and cloud platforms. Experience with distributed data processing is preferred.",
  },
  {
    id: "ai-engineer",
    name: "AI Engineer",
    family: "Data",
    summary: "Builds AI-powered products using modern deep learning, LLM and classical ML techniques.",
    responsibilities: [
      "Prototype and ship AI features",
      "Fine-tune and evaluate foundation models",
      "Build retrieval and evaluation pipelines",
      "Own model quality, safety and cost",
    ],
    minExperienceYears: 2,
    education: ["B.Tech/B.E.", "M.Tech", "M.Sc. Computer Science"],
    certifications: ["DeepLearning.AI TensorFlow Developer", "Google Professional ML Engineer"],
    required: [
      r("Python", 5), r("Artificial Intelligence", 5), r("Machine Learning", 5), r("Deep Learning", 5),
      r("NLP", 5), r("PyTorch", 4), r("LLM", 4), r("TensorFlow", 3), r("Docker", 3),
    ],
    preferred: [
      r("Computer Vision", 3), r("MLOps", 4), r("AWS", 3), r("Vector databases", 1),
      r("System Design", 3), r("Statistics", 3), r("FastAPI", 3),
    ],
    defaultDescription:
      "Looking for an AI Engineer with Python, deep learning, NLP and LLM experience (PyTorch/TensorFlow). You should be able to take a model from prototype to production, including evaluation and monitoring. MLOps and cloud experience preferred.",
  },
  {
    id: "devops-engineer",
    name: "DevOps Engineer",
    family: "Infrastructure",
    summary: "Automates build, release and infrastructure so teams ship reliably and quickly.",
    responsibilities: [
      "Build and maintain CI/CD pipelines",
      "Manage infrastructure as code",
      "Operate containers and Kubernetes clusters",
      "Set up observability, alerting and incident response",
    ],
    minExperienceYears: 2,
    education: ["B.Tech/B.E.", "B.Sc. Computer Science", "B.Sc. IT"],
    certifications: ["AWS Certified DevOps Engineer", "Certified Kubernetes Administrator (CKA)"],
    required: [
      r("Linux", 5), r("Docker", 5), r("Kubernetes", 5), r("CI/CD", 5), r("Git", 4),
      r("Bash", 4), r("AWS", 5), r("Terraform", 4), r("Python", 3),
    ],
    preferred: [
      r("Azure", 3), r("Google Cloud", 3), r("Ansible", 3), r("Jenkins", 3), r("Prometheus", 4),
      r("Nginx", 3), r("Computer Networks", 3), r("System Design", 3),
    ],
    defaultDescription:
      "We are hiring a DevOps Engineer with Linux administration, Docker, Kubernetes, CI/CD (GitHub Actions/Jenkins), infrastructure as code with Terraform and AWS experience. Monitoring with Prometheus/Grafana is preferred.",
  },
  {
    id: "cloud-engineer",
    name: "Cloud Engineer",
    family: "Infrastructure",
    summary: "Designs and operates secure, scalable, cost-efficient cloud infrastructure.",
    responsibilities: [
      "Provision and manage cloud infrastructure",
      "Implement networking, IAM and security controls",
      "Automate deployments with IaC",
      "Optimize reliability, performance and cost",
    ],
    minExperienceYears: 2,
    education: ["B.Tech/B.E.", "B.Sc. Computer Science", "B.Sc. IT"],
    certifications: ["AWS Certified Solutions Architect", "Microsoft Certified: Azure Administrator"],
    required: [
      r("AWS", 5), r("Linux", 4), r("Docker", 4), r("Terraform", 4), r("Computer Networks", 4),
      r("Python", 3), r("Cloud Fundamentals", 5), r("CI/CD", 3),
    ],
    preferred: [
      r("Azure", 4), r("Google Cloud", 4), r("Kubernetes", 4), r("Serverless", 3),
      r("Web Security", 3), r("Bash", 3), r("Prometheus", 3),
    ],
    defaultDescription:
      "Hiring a Cloud Engineer with hands-on AWS experience, Linux, Docker, Terraform, networking and security fundamentals. Knowledge of Azure/GCP, Kubernetes and serverless architecture is preferred.",
  },
  {
    id: "android-developer",
    name: "Android Developer",
    family: "Mobile",
    summary: "Ships native Android apps with clean architecture, smooth UI and offline-friendly data layers.",
    responsibilities: [
      "Build features with Kotlin and Jetpack Compose",
      "Consume REST APIs and persist data locally",
      "Optimize app performance and battery usage",
      "Publish and monitor releases on the Play Store",
    ],
    minExperienceYears: 1,
    education: ["B.Tech/B.E.", "B.Sc. Computer Science"],
    certifications: ["Google Associate Android Developer"],
    required: [
      r("Kotlin", 5), r("Android", 5), r("Java", 3), r("REST API", 4), r("Git", 4),
      r("SQLite", 3), r("Object Oriented Programming", 4), r("UI Design", 3),
    ],
    preferred: [
      r("Jetpack Compose", 4), r("Firebase", 3), r("Unit Testing", 3), r("Coroutines", 1),
      r("Material Design", 1), r("CI/CD", 2), r("Room database", 1),
    ],
    defaultDescription:
      "Looking for an Android Developer with Kotlin, Android SDK, Jetpack Compose, REST API integration, local storage and Git. Familiarity with Firebase and automated testing is preferred.",
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    family: "Software Engineering",
    summary: "Generalist engineer who designs, builds and maintains software systems across the stack.",
    responsibilities: [
      "Design and implement features across services",
      "Write tests and participate in code reviews",
      "Debug production issues",
      "Contribute to design and architecture discussions",
    ],
    minExperienceYears: 1,
    education: ["B.Tech/B.E.", "B.Sc. Computer Science", "MCA"],
    certifications: ["AWS Certified Developer", "Oracle Certified Professional: Java SE"],
    required: [
      r("Java", 4), r("Python", 4), r("Data Structures", 5), r("Object Oriented Programming", 5),
      r("SQL", 4), r("Git", 4), r("REST API", 4), r("JavaScript", 3), r("DBMS", 4),
    ],
    preferred: [
      r("System Design", 4), r("Docker", 3), r("AWS", 3), r("Unit Testing", 4), r("CI/CD", 3),
      r("Computer Networks", 3), r("Operating Systems", 3), r("Microservices", 3),
    ],
    defaultDescription:
      "We are hiring a Software Engineer with strong programming fundamentals (Java/Python), data structures and algorithms, object oriented design, DBMS, SQL and version control. Exposure to system design, cloud and CI/CD is preferred.",
  },
  {
    id: "ui-ux-designer",
    name: "UI/UX Designer",
    family: "Design",
    summary: "Designs intuitive, accessible product experiences backed by research and iteration.",
    responsibilities: [
      "Run user research and usability testing",
      "Create wireframes, prototypes and high-fidelity UI",
      "Maintain a design system",
      "Partner with engineers through implementation",
    ],
    minExperienceYears: 1,
    education: ["B.Des", "B.Tech/B.E. + design portfolio", "Any degree with strong portfolio"],
    certifications: ["Google UX Design Professional Certificate", "NN/g UX Certification"],
    required: [
      r("Figma", 5), r("UI Design", 5), r("UX Research", 5), r("Wireframing", 5),
      r("Design Systems", 4), r("Accessibility", 4), r("Prototyping", 1),
    ],
    preferred: [
      r("Adobe XD", 2), r("Photoshop", 2), r("Illustrator", 2), r("HTML", 2), r("CSS", 2),
      r("React", 2), r("Documentation", 3), r("A/B Testing", 3),
    ],
    defaultDescription:
      "Hiring a UI/UX Designer with strong Figma skills, user research, wireframing, prototyping, design systems and accessibility knowledge. Basic HTML/CSS understanding and experience working with engineers is preferred.",
  },
];

export const JOB_ROLE_BY_ID = new Map(JOB_ROLES.map((role) => [role.id, role]));
export const JOB_ROLE_BY_NAME = new Map(JOB_ROLES.map((role) => [role.name.toLowerCase(), role]));

export function findRole(roleIdOrName?: string | null): JobRole | undefined {
  if (!roleIdOrName) return undefined;
  const key = roleIdOrName.trim().toLowerCase();
  return JOB_ROLE_BY_ID.get(key) ?? JOB_ROLE_BY_NAME.get(key);
}

/** Resolve skills of a role that are also present in the skill taxonomy. */
export function roleSkillsInTaxonomy(role: JobRole) {
  return [...role.required, ...role.preferred];
}
