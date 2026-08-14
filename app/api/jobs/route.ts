import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const locationId = searchParams.get("locationId");
  const minExperienceParam = searchParams.get("minExperience");
  const minExperience = minExperienceParam ? Number(minExperienceParam) : null;

  if (minExperienceParam && Number.isNaN(minExperience)) {
    return NextResponse.json({ error: "Invalid minExperience." }, { status: 400 });
  }

  try {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (search) {
      conditions.push("toLower(j.title) CONTAINS toLower($search)");
      params.search = search;
    }
    if (locationId) {
      conditions.push("l.id = $locationId");
      params.locationId = locationId;
    }
    if (minExperience !== null) {
      conditions.push("j.experienceMin >= $minExperience");
      params.minExperience = minExperience;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const jobs = await runQuery(
      `
      MATCH (c:Company)-[:POSTS]->(j:Job)-[:LOCATED_IN]->(l:Location)
      ${whereClause}
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
      WITH j, c, l, collect(DISTINCT s.name) AS requiredSkills
      RETURN
        j.id AS id,
        j.title AS title,
        j.experienceMin AS experienceMin,
        j.experienceMax AS experienceMax,
        j.salaryMin AS salaryMin,
        j.salaryMax AS salaryMax,
        j.employmentType AS employmentType,
        c.name AS companyName,
        l.city AS city,
        requiredSkills
      ORDER BY title
      `,
      params
    );

    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load jobs. Please try again." },
      { status: 500 }
    );
  }
}
