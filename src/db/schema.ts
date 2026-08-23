import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** users — lightweight profile (no passwords; demo/local analytics only). */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

/** skills — normalized skill taxonomy mirrored to the DB for reporting. */
export const skills = pgTable(
  "skills",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    demand: integer("demand").default(3).notNull(),
    hours: integer("hours").default(25).notNull(),
  },
  (table) => [uniqueIndex("skills_name_unique").on(table.name)],
);

/** analyses — one row per resume analysis run. */
export const analyses = pgTable(
  "analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    candidateName: text("candidate_name"),
    candidateEmail: text("candidate_email"),
    targetRoleId: text("target_role_id"),
    targetRoleName: text("target_role_name"),
    matchScore: integer("match_score").notNull(),
    projectedScore: integer("projected_score").notNull().default(0),
    resumeChars: integer("resume_chars").notNull().default(0),
    skillsFound: integer("skills_found").notNull().default(0),
    missingCount: integer("missing_count").notNull().default(0),
    source: text("source").notNull().default("upload"), // upload | paste | demo
    jdProvided: boolean("jd_provided").notNull().default(false),
    mlPrediction: text("ml_prediction"),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("analyses_created_idx").on(table.createdAt)],
);

/** analysis_skills — per-skill outcome of an analysis. */
export const analysisSkills = pgTable(
  "analysis_skills",
  {
    id: serial("id").primaryKey(),
    analysisId: uuid("analysis_id")
      .notNull()
      .references(() => analyses.id, { onDelete: "cascade" }),
    skillId: integer("skill_id").references(() => skills.id, { onDelete: "set null" }),
    skillName: text("skill_name").notNull(),
    category: text("category").notNull().default("Concepts"),
    status: text("status").notNull(), // matched | partial | missing
    priority: text("priority").notNull().default("LOW"), // HIGH | MEDIUM | LOW
    type: text("type").notNull().default("required"), // required | preferred
    importance: integer("importance").notNull().default(3),
  },
  (table) => [index("analysis_skills_analysis_idx").on(table.analysisId)],
);

/** ml_models — persisted trained artifacts (the TS equivalent of joblib files). */
export const mlModels = pgTable(
  "ml_models",
  {
    id: serial("id").primaryKey(),
    version: text("version").notNull(),
    algorithm: text("algorithm").notNull(),
    active: boolean("active").notNull().default(true),
    metrics: jsonb("metrics").notNull(),
    artifact: jsonb("artifact").notNull(),
    trainedAt: timestamp("trained_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("ml_models_version_unique").on(table.version)],
);

/** skill_progress — optional tracking: learning / practicing / completed. */
export const skillProgress = pgTable(
  "skill_progress",
  {
    id: serial("id").primaryKey(),
    analysisId: uuid("analysis_id").references(() => analyses.id, { onDelete: "cascade" }),
    skillName: text("skill_name").notNull(),
    status: text("status").notNull().default("learning"), // learning | practicing | completed
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("skill_progress_analysis_idx").on(table.analysisId)],
);

export type AnalysisRow = typeof analyses.$inferSelect;
export type SkillRow = typeof skills.$inferSelect;
export type AnalysisSkillRow = typeof analysisSkills.$inferSelect;
