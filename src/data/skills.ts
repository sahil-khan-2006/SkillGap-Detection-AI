/**
 * SkillGap AI — Configurable Skill Knowledge Base
 * ------------------------------------------------
 * This file is the single source of truth for the skill taxonomy used by the
 * NLP skill extractor. Adding a new skill never requires touching engine code:
 * just append an entry to RAW below (or load `data/skills.json` at runtime).
 *
 * Fields: [canonicalName, category, aliases (comma separated), demand, hours]
 *   demand = market demand weight (1..5) used for priority ranking
 *   hours  = estimated focused learning hours to reach employable level
 */

export type SkillCategory =
  | "Programming Languages"
  | "Frameworks"
  | "Databases"
  | "Tools"
  | "Cloud"
  | "Data & ML"
  | "Concepts"
  | "Mobile"
  | "Design"
  | "Practices";

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Programming Languages",
  "Frameworks",
  "Databases",
  "Tools",
  "Cloud",
  "Data & ML",
  "Concepts",
  "Mobile",
  "Design",
  "Practices",
];

type RawSkill = [string, SkillCategory, string, number, number];

const RAW: RawSkill[] = [
  // ---------------------------------------------------------------- languages
  ["Java", "Programming Languages", "core java,java se,java8,java 8,java 11,java 17,j2ee", 5, 90],
  ["Python", "Programming Languages", "python3,py", 5, 70],
  ["C", "Programming Languages", "c programming,c language,ansi c", 4, 60],
  ["C++", "Programming Languages", "cpp,c plus plus,cplusplus", 4, 90],
  ["C#", "Programming Languages", "c sharp,csharp,.net core,dotnet", 4, 80],
  ["JavaScript", "Programming Languages", "js,ecmascript,es6,vanilla js,java script", 5, 70],
  ["TypeScript", "Programming Languages", "ts,typescript 5", 4, 40],
  ["Kotlin", "Programming Languages", "kotlin dsl", 4, 50],
  ["Swift", "Programming Languages", "swiftui,swift 5", 3, 60],
  ["Go", "Programming Languages", "golang", 4, 55],
  ["Rust", "Programming Languages", "rust lang,rustlang", 3, 90],
  ["PHP", "Programming Languages", "php8,php 7", 3, 50],
  ["Ruby", "Programming Languages", "ruby on rails language", 2, 50],
  ["Scala", "Programming Languages", "", 3, 70],
  ["R", "Programming Languages", "r language,r studio", 3, 55],
  ["SQL", "Programming Languages", "sql queries,plsql,pl/sql,t-sql,tsql", 5, 40],
  ["Bash", "Programming Languages", "shell scripting,shell script,bash scripting,sh", 3, 25],
  ["Dart", "Programming Languages", "flutter dart", 2, 40],

  // --------------------------------------------------------------- frameworks
  ["Spring Boot", "Frameworks", "spring,springboot,spring mvc,spring framework,spring security", 5, 60],
  ["Hibernate", "Frameworks", "jpa,spring data jpa,java persistence api", 4, 35],
  ["React", "Frameworks", "reactjs,react.js,react js,react hooks,react native", 5, 55],
  ["Angular", "Frameworks", "angularjs,angular 2+,angular cli", 4, 60],
  ["Vue", "Frameworks", "vuejs,vue.js,vue 3,nuxt", 3, 45],
  ["Next.js", "Frameworks", "nextjs,next js", 4, 35],
  ["Node.js", "Frameworks", "node,nodejs,node js", 5, 50],
  ["Express", "Frameworks", "expressjs,express.js,express framework", 4, 25],
  ["NestJS", "Frameworks", "nest js,nestjs", 3, 40],
  ["Django", "Frameworks", "django rest framework,drf", 4, 55],
  ["Flask", "Frameworks", "flask api", 3, 25],
  ["FastAPI", "Frameworks", "fast api", 4, 25],
  ["TensorFlow", "Frameworks", "tensorflow2,tf,keras", 4, 80],
  ["PyTorch", "Frameworks", "torch,pytorch lightning", 4, 80],
  ["Tailwind CSS", "Frameworks", "tailwind,tailwindcss", 3, 15],
  ["Bootstrap", "Frameworks", "bootstrap 5,bootstrap5", 2, 12],
  ["HTML", "Frameworks", "html5", 4, 20],
  ["CSS", "Frameworks", "css3,sass,scss,less", 4, 25],
  ["jQuery", "Frameworks", "j query", 1, 12],
  ["Redux", "Frameworks", "redux toolkit,rtk", 3, 20],
  ["GraphQL", "Frameworks", "graph ql,apollo", 3, 30],

  // ---------------------------------------------------------------- databases
  ["MySQL", "Databases", "my sql,mysql8", 5, 30],
  ["PostgreSQL", "Databases", "postgres,psql,postgre", 4, 30],
  ["MongoDB", "Databases", "mongo,mongoose", 4, 30],
  ["Redis", "Databases", "redis cache", 3, 18],
  ["Oracle", "Databases", "oracle db,oracle sql,oracle 19c", 3, 40],
  ["SQL Server", "Databases", "mssql,microsoft sql server", 2, 35],
  ["SQLite", "Databases", "sqlite3", 2, 12],
  ["Cassandra", "Databases", "apache cassandra", 2, 40],
  ["Elasticsearch", "Databases", "elastic search,opensearch", 3, 40],
  ["Firebase", "Databases", "firestore,cloud firestore", 3, 25],
  ["DynamoDB", "Databases", "dynamo db", 2, 20],

  // -------------------------------------------------------------------- tools
  ["Git", "Tools", "version control,git scm,git version control", 5, 15],
  ["GitHub", "Tools", "git hub,github actions,gh", 4, 15],
  ["GitLab", "Tools", "git lab,gitlab ci", 2, 15],
  ["Docker", "Tools", "dockerfile,docker compose,containerization,containers", 5, 35],
  ["Kubernetes", "Tools", "k8s,kubectl,eks,gke,aks", 4, 70],
  ["Jenkins", "Tools", "jenkinsfile,jenkins ci", 3, 30],
  ["Postman", "Tools", "postman api", 2, 10],
  ["Linux", "Tools", "ubuntu,unix,centos,debian,shell linux", 4, 40],
  ["VS Code", "Tools", "visual studio code,vscode", 2, 8],
  ["IntelliJ", "Tools", "intellij idea,eclipse,sts", 2, 10],
  ["Jira", "Tools", "confluence", 2, 10],
  ["Terraform", "Tools", "terraform iac", 3, 45],
  ["Ansible", "Tools", "ansible playbook", 2, 30],
  ["Maven", "Tools", "apache maven,mvn", 3, 15],
  ["Gradle", "Tools", "gradle build", 2, 15],
  ["Swagger", "Tools", "openapi,swagger ui", 3, 12],
  ["Kafka", "Tools", "apache kafka,kafka streams", 3, 50],
  ["RabbitMQ", "Tools", "rabbit mq,amqp", 2, 25],
  ["Prometheus", "Tools", "grafana", 3, 25],
  ["Nginx", "Tools", "apache http server", 2, 20],

  // -------------------------------------------------------------------- cloud
  ["AWS", "Cloud", "amazon web services,aws ec2,ec2,s3,lambda aws", 5, 70],
  ["Azure", "Cloud", "microsoft azure,azure devops", 4, 65],
  ["Google Cloud", "Cloud", "gcp,google cloud platform", 4, 65],
  ["Cloud Fundamentals", "Cloud", "cloud computing,cloud native", 3, 30],
  ["Serverless", "Cloud", "aws lambda,lambda functions,faas", 3, 35],

  // ----------------------------------------------------------------- data / ml
  ["NumPy", "Data & ML", "numpy arrays", 4, 20],
  ["Pandas", "Data & ML", "pandas dataframe", 5, 25],
  ["Scikit-learn", "Data & ML", "sklearn,scikit learn,sci-kit learn", 4, 35],
  ["Matplotlib", "Data & ML", "matplotlib pyplot", 3, 15],
  ["Seaborn", "Data & ML", "seaborn plots", 2, 12],
  ["NLP", "Data & ML", "natural language processing,natural language understanding,nltk,spacy", 4, 70],
  ["Deep Learning", "Data & ML", "neural networks,cnn,rnn,transformers,ann", 5, 110],
  ["Computer Vision", "Data & ML", "opencv,image processing,object detection", 4, 90],
  ["Machine Learning", "Data & ML", "ml,supervised learning,unsupervised learning,regression,classification,clustering", 5, 100],
  ["Artificial Intelligence", "Data & ML", "ai,artificial intelligence", 4, 90],
  ["Data Analysis", "Data & ML", "data analytics,exploratory data analysis,eda", 5, 40],
  ["Data Visualization", "Data & ML", "data viz,power bi,tableau,looker", 4, 30],
  ["Statistics", "Data & ML", "statistical analysis,probability,hypothesis testing", 4, 50],
  ["Feature Engineering", "Data & ML", "feature selection,feature extraction", 3, 30],
  ["MLOps", "Data & ML", "ml ops,model deployment,mlflow", 3, 60],
  ["Big Data", "Data & ML", "hadoop,spark,pyspark,hive", 3, 70],
  ["LLM", "Data & ML", "large language models,generative ai,genai,langchain", 4, 60],
  ["Excel", "Data & ML", "microsoft excel,advanced excel,vlookup", 3, 20],
  ["ETL", "Data & ML", "data pipelines,airflow,data engineering", 3, 50],
  ["Data Warehousing", "Data & ML", "snowflake,redshift,bigquery", 3, 45],

  // ----------------------------------------------------------------- concepts
  ["REST API", "Concepts", "restful api,rest apis,restful web services,rest services,web api,api development", 5, 35],
  ["Microservices", "Concepts", "micro services,microservice architecture", 4, 70],
  ["Data Structures", "Concepts", "dsa,data structures and algorithms,algorithms", 5, 80],
  ["System Design", "Concepts", "hld,low level design,lld,scalable architecture", 4, 80],
  ["Object Oriented Programming", "Concepts", "oop,object oriented,object-oriented programming", 4, 30],
  ["Operating Systems", "Concepts", "os concepts,process scheduling,memory management", 3, 40],
  ["Computer Networks", "Concepts", "networking,tcp/ip,http protocols,computer networking", 3, 35],
  ["DBMS", "Concepts", "database management systems,database design,normalization", 4, 35],
  ["Software Development Life Cycle", "Concepts", "sdlc,software development lifecycle,agile methodology,scrum", 3, 25],
  ["Authentication & Authorization", "Concepts", "jwt,oauth2,oauth,sso,spring security auth", 4, 30],
  ["Message Queues", "Concepts", "message queue,event driven architecture,pub sub", 3, 35],
  ["Web Security", "Concepts", "cybersecurity basics,owasp,application security", 3, 45],
  ["Caching", "Concepts", "cache,cdn,memcached", 3, 25],
  ["Design Patterns", "Concepts", "solid principles,gof patterns,mvc", 3, 40],
  ["Business Intelligence", "Concepts", "bi tools,reporting dashboards", 3, 35],
  ["A/B Testing", "Concepts", "experimentation,ab testing", 2, 25],

  // ------------------------------------------------------------------- mobile
  ["Android", "Mobile", "android development,android studio,android sdk", 4, 65],
  ["iOS", "Mobile", "ios development,xcode", 3, 65],
  ["Flutter", "Mobile", "flutter sdk,dart flutter", 3, 50],
  ["React Native", "Mobile", "react-native,reactnative", 3, 45],
  ["Jetpack Compose", "Mobile", "compose ui", 2, 30],

  // ------------------------------------------------------------------- design
  ["Figma", "Design", "figma design", 4, 20],
  ["Adobe XD", "Design", "adobe experience design", 2, 18],
  ["Photoshop", "Design", "adobe photoshop,ps", 2, 25],
  ["Illustrator", "Design", "adobe illustrator,ai design tool", 2, 25],
  ["UI Design", "Design", "user interface design,visual design", 4, 45],
  ["UX Research", "Design", "user experience research,usability testing,user research", 4, 50],
  ["Wireframing", "Design", "wireframes,prototyping,mockups", 4, 25],
  ["Design Systems", "Design", "component library,design tokens,storybook", 3, 40],
  ["Accessibility", "Design", "a11y,wcag,accessible design", 3, 25],

  // ---------------------------------------------------------------- practices
  ["Unit Testing", "Practices", "junit,test driven development,tdt,pytest,jest,mocha,unit tests", 4, 30],
  ["CI/CD", "Practices", "continuous integration,continuous deployment,cicd,github actions pipeline", 4, 45],
  ["Code Review", "Practices", "peer review,pull requests", 3, 15],
  ["Agile", "Practices", "scrum master,sprint planning,kanban", 3, 20],
  ["Debugging", "Practices", "troubleshooting,root cause analysis", 3, 20],
  ["Documentation", "Practices", "technical writing,api documentation", 3, 15],
  ["Mentoring", "Practices", "mentorship,team leadership", 2, 20],
];

/** Extra curated learning material for the roadmap generator. */
export const SKILL_TOPICS: Record<string, string[]> = {
  Java: ["Collections & Generics", "Multithreading & Concurrency", "Streams & Lambdas", "Exception handling", "JVM internals"],
  "Spring Boot": ["Auto-configuration & starters", "Dependency injection", "Spring Data JPA", "Validation & exception handling", "Actuator & profiles"],
  "REST API": ["HTTP methods & status codes", "Request/response modelling", "Versioning", "Pagination & filtering", "Error contracts"],
  Python: ["Data types & comprehensions", "OOP in Python", "Virtual environments & packaging", "Iterators & generators", "Async basics"],
  "Machine Learning": ["Supervised vs unsupervised", "Train/validation/test split", "Overfitting & regularization", "Cross-validation", "Model evaluation metrics"],
  "Deep Learning": ["Perceptrons & activation functions", "Backpropagation", "CNNs", "RNNs/LSTMs", "Transformers"],
  SQL: ["Joins & subqueries", "Aggregations & GROUP BY", "Window functions", "Indexing", "Query optimization"],
  Docker: ["Images & layers", "Dockerfile best practices", "Volumes & networks", "Docker Compose", "Multi-stage builds"],
  AWS: ["IAM & security", "EC2 & VPC", "S3 storage classes", "RDS", "Lambda & API Gateway"],
  React: ["Components & props", "State & effects", "Hooks", "Context & routing", "Performance optimization"],
  "Data Analysis": ["Data cleaning", "Exploratory data analysis", "Statistical summaries", "Cohort & funnel analysis", "Insight storytelling"],
  "Data Structures": ["Arrays & strings", "Linked lists & stacks", "Trees & graphs", "Hashmaps", "Dynamic programming"],
  Kubernetes: ["Pods & deployments", "Services & ingress", "ConfigMaps & secrets", "Scaling & probes", "Helm basics"],
  "System Design": ["Load balancing", "Caching layers", "Database sharding", "Message queues", "CAP theorem"],
  NLP: ["Tokenization & stemming", "Bag of words & TF-IDF", "Word embeddings", "Text classification", "Evaluation"],
  "UI Design": ["Layout & grids", "Typography & hierarchy", "Color theory", "Component states", "Responsive design"],
  "UX Research": ["User interviews", "Personas & journey maps", "Usability testing", "Information architecture", "Analytics-driven iteration"],
};

export const SKILL_PRACTICE: Record<string, string> = {
  Java: "Solve 30 DSA problems in Java and refactor one project using streams + OOP design.",
  "Spring Boot": "Build a REST service with layered architecture, validation and global exception handling.",
  "REST API": "Design and document a CRUD API with OpenAPI/Swagger and test every endpoint in Postman.",
  Python: "Write a CLI tool that processes a CSV file and produces a report using OOP design.",
  "Machine Learning": "Train, tune and evaluate a classifier on a public dataset; report precision/recall/F1.",
  "Deep Learning": "Train a CNN image classifier and track experiments with a validation curve.",
  SQL: "Write 25 queries on a sample database including joins, window functions and aggregations.",
  Docker: "Containerize an existing app and run it together with its database via Docker Compose.",
  AWS: "Deploy a containerized app to the cloud with a managed database and object storage.",
  React: "Build a multi-page dashboard consuming a public API with routing and state management.",
  "Data Analysis": "Analyze a 10k-row dataset end-to-end and publish a 1-page insight summary.",
  "Data Structures": "Complete a 6-week DSA problem set covering arrays, trees, graphs and DP.",
  Kubernetes: "Deploy an app with a Deployment, Service, Ingress and horizontal autoscaling.",
  "System Design": "Design a URL shortener and a rate limiter; write trade-offs for each component.",
  NLP: "Build a TF-IDF text classifier and compare it against a simple embedding baseline.",
  "UI Design": "Redesign one screen in Figma with light/dark variants and a component library.",
  "UX Research": "Run 5 usability tests on an existing product and synthesize findings into fixes.",
};

export interface SkillDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  aliases: string[];
  /** market demand weight 1..5 */
  demand: number;
  /** estimated focused learning hours */
  hours: number;
  topics: string[];
  practice: string;
}

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const defaultTopics = (name: string, category: SkillCategory) => {
  const base: Record<string, string[]> = {
    "Programming Languages": ["Syntax & core constructs", "Standard library", "Idiomatic patterns", "Debugging", "Mini project"],
    Frameworks: ["Core concepts", "Project scaffolding", "State/data flow", "Integration patterns", "Build a feature end-to-end"],
    Databases: ["Modelling", "Querying", "Indexing & performance", "Backups & migrations", "Real dataset practice"],
    Tools: ["Installation & setup", "Everyday workflow", "Automation", "Troubleshooting", "Integrate into a project"],
    Cloud: ["Core services", "Networking & IAM", "Deployment", "Monitoring", "Cost & security basics"],
    "Data & ML": ["Foundations", "Hands-on notebooks", "Evaluation", "Production concerns", "Portfolio project"],
    Concepts: ["Fundamentals", "Key patterns", "Design trade-offs", "Case studies", "Interview questions"],
    Mobile: ["SDK basics", "UI building", "State & navigation", "Device APIs", "Publish a demo app"],
    Design: ["Principles", "Tooling", "Component thinking", "Critique & iteration", "Portfolio case study"],
    Practices: ["Why it matters", "Team workflow", "Automation", "Metrics", "Apply on a real task"],
  };
  return base[category].map((topic) => `${name}: ${topic}`);
};

export const SKILLS: SkillDefinition[] = RAW.map(([name, category, aliasCsv, demand, hours]) => ({
  id: slug(name),
  name,
  category,
  aliases: aliasCsv
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean),
  demand,
  hours,
  topics: SKILL_TOPICS[name] ?? defaultTopics(name, category),
  practice: SKILL_PRACTICE[name] ?? `Build one small hands-on exercise using ${name} and document what you learned.`,
}));

export const SKILL_BY_NAME = new Map(SKILLS.map((s) => [s.name.toLowerCase(), s]));
export const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));

/**
 * Build the canonical alias -> canonical-name dictionary used by the
 * normalizer. The longest alias always wins so that "spring boot" is not
 * swallowed by the "spring" alias of another entry and "js" does not shadow
 * "javascript".
 */
export function buildAliasMap(): Array<{ alias: string; canonical: string }> {
  const map = new Map<string, string>();
  for (const skill of SKILLS) {
    const names = [skill.name, ...skill.aliases];
    for (const raw of names) {
      const alias = raw.trim().toLowerCase();
      if (!alias) continue;
      const existing = map.get(alias);
      // canonical names are authoritative; otherwise first writer wins
      if (!existing || alias === skill.name.toLowerCase()) map.set(alias, skill.name);
    }
  }
  return [...map.entries()]
    .map(([alias, canonical]) => ({ alias, canonical }))
    .sort((a, b) => b.alias.length - a.alias.length);
}

export const ALIAS_MAP = buildAliasMap();

/** Normalize any surface form of a skill to its canonical name. */
export function normalizeSkillName(raw: string): string | null {
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  const direct = ALIAS_MAP.find((a) => a.alias === key);
  return direct ? direct.canonical : null;
}
