import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";
import { calculateMatchScore } from "@/lib/matching";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await runQuery<{
      jobId: string;
      title: string;
      companyName: string;
      matchingSkillNames: string[];
      requiredSkillNames: string[];
    }>(
      `
      MATCH (d:Developer {id: $id})
      MATCH (c:Company)-[:POSTS]->(j:Job)-[:REQUIRES]->(allSkills:Skill)
      OPTIONAL MATCH (d)-[:HAS_SKILL]->(matched:Skill)<-[:REQUIRES]-(j)
      WITH j, c, collect(DISTINCT allSkills.name) AS requiredSkillNames, collect(DISTINCT matched.name) AS matchingSkillNames
      WHERE size(matchingSkillNames) > 0
      RETURN j.id AS jobId, j.title AS title, c.name AS companyName, matchingSkillNames, requiredSkillNames
      ORDER BY size(matchingSkillNames) DESC
      `,
      { id }
    );

    const jobs = rows.map((r) => ({
      jobId: r.jobId,
      title: r.title,
      company: r.companyName,
      matchingSkills: r.matchingSkillNames.length,
      requiredSkills: r.requiredSkillNames.length,
      matchingSkillNames: r.matchingSkillNames,
      requiredSkillNames: r.requiredSkillNames,
      matchScore: calculateMatchScore(r.matchingSkillNames.length, r.requiredSkillNames.length),
    }));

    jobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ developerId: id, jobs });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load job recommendations. Please try again." },
      { status: 500 }
    );
  }
}
