import { JOB_ROLES } from "@/data/jobRoles";
import { matchSkills } from "@/engine/matcher";

export const dynamic = "force-dynamic";

/** GET /api/job-roles — list supported target roles (optionally scored for ?skills=java,sql) */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const skillsParam = url.searchParams.get("skills");
  const skillNames = skillsParam ? skillsParam.split(",").map((s) => s.trim()).filter(Boolean) : null;

  const roles = JOB_ROLES.map((role) => {
    const groups = skillNames ? matchSkills(skillNames, role.required, role.preferred) : null;
    const coverage = groups
      ? groups.requiredMatched.length
        ? groups.requiredMatched.filter((i) => i.status === "matched").length / groups.requiredMatched.length
        : 0
      : null;
    return {
      id: role.id,
      name: role.name,
      family: role.family,
      summary: role.summary,
      responsibilities: role.responsibilities,
      minExperienceYears: role.minExperienceYears,
      education: role.education,
      certifications: role.certifications,
      requiredSkills: role.required,
      preferredSkills: role.preferred,
      defaultDescription: role.defaultDescription,
      coverage: coverage === null ? null : Number((coverage * 100).toFixed(1)),
    };
  });

  return Response.json({ count: roles.length, roles });
}
