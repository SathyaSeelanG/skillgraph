import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await runQuery<{
      id: string;
      title: string;
      description: string;
      experienceMin: number;
      experienceMax: number;
      salaryMin: number;
      salaryMax: number;
      employmentType: string;
      companyName: string;
      city: string;
      requiredSkills: string[];
    }>(
      `
      MATCH (c:Company)-[:POSTS]->(j:Job {id: $id})-[:LOCATED_IN]->(l:Location)
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
      RETURN
        j.id AS id, j.title AS title, j.description AS description,
        j.experienceMin AS experienceMin, j.experienceMax AS experienceMax,
        j.salaryMin AS salaryMin, j.salaryMax AS salaryMax,
        j.employmentType AS employmentType,
        c.name AS companyName, l.city AS city,
        collect(DISTINCT s.name) AS requiredSkills
      `,
      { id }
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const relatedJobs = await runQuery<{
      jobId: string;
      title: string;
      companyName: string;
      sharedSkills: number;
    }>(
      `
      MATCH (j1:Job {id: $id})-[:REQUIRES]->(s:Skill)<-[:REQUIRES]-(j2:Job)
      WHERE j1.id <> j2.id
      WITH j2, count(DISTINCT s) AS sharedSkills
      MATCH (c:Company)-[:POSTS]->(j2)
      RETURN j2.id AS jobId, j2.title AS title, c.name AS companyName, sharedSkills
      ORDER BY sharedSkills DESC
      LIMIT 5
      `,
      { id }
    );

    return NextResponse.json({ job: rows[0], relatedJobs });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load this job. Please try again." },
      { status: 500 }
    );
  }
}
