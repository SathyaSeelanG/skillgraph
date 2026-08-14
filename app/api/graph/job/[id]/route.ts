import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

type GraphNode = { id: string; label: string; type: "Job" | "Skill" | "Company" | "Location" };
type GraphEdge = { source: string; target: string; type: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rows = await runQuery<{
      jobId: string;
      jobTitle: string;
      skills: { id: string; name: string }[];
      companyId: string | null;
      companyName: string | null;
      locationId: string | null;
      locationCity: string | null;
    }>(
      `
      MATCH (j:Job {id: $id})
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
      OPTIONAL MATCH (c:Company)-[:POSTS]->(j)
      OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
      RETURN j.id AS jobId, j.title AS jobTitle,
             collect(DISTINCT {id: s.id, name: s.name}) AS skills,
             c.id AS companyId, c.name AS companyName,
             l.id AS locationId, l.city AS locationCity
      `,
      { id }
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const row = rows[0];
    const nodes: GraphNode[] = [{ id: row.jobId, label: row.jobTitle, type: "Job" }];
    const edges: GraphEdge[] = [];

    for (const skill of row.skills) {
      if (!skill?.id) continue;
      nodes.push({ id: skill.id, label: skill.name, type: "Skill" });
      edges.push({ source: row.jobId, target: skill.id, type: "REQUIRES" });
    }

    if (row.companyId) {
      nodes.push({ id: row.companyId, label: row.companyName!, type: "Company" });
      edges.push({ source: row.companyId, target: row.jobId, type: "POSTS" });
    }

    if (row.locationId) {
      nodes.push({ id: row.locationId, label: row.locationCity!, type: "Location" });
      edges.push({ source: row.jobId, target: row.locationId, type: "LOCATED_IN" });
    }

    return NextResponse.json({ nodes, edges });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load the graph. Please try again." },
      { status: 500 }
    );
  }
}
