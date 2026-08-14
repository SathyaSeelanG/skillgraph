import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const summaryRows = await runQuery<{
      skillName: string;
      jobCount: number;
      companies: string[];
      locations: string[];
    }>(
      `
      MATCH (s:Skill {id: $id})<-[:REQUIRES]-(j:Job)<-[:POSTS]-(c:Company)
      OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
      RETURN s.name AS skillName, count(DISTINCT j) AS jobCount,
             collect(DISTINCT c.name) AS companies, collect(DISTINCT l.city) AS locations
      `,
      { id }
    );

    if (summaryRows.length === 0) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    const relatedSkills = await runQuery<{ relatedSkill: string; sharedJobs: number }>(
      `
      MATCH (s:Skill {id: $id})<-[:REQUIRES]-(j:Job)-[:REQUIRES]->(related:Skill)
      WHERE related.id <> s.id
      RETURN related.name AS relatedSkill, count(DISTINCT j) AS sharedJobs
      ORDER BY sharedJobs DESC
      LIMIT 10
      `,
      { id }
    );

    return NextResponse.json({ skill: summaryRows[0], relatedSkills });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load this skill. Please try again." },
      { status: 500 }
    );
  }
}
