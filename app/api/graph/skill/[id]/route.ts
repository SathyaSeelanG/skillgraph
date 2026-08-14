import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

type GraphNode = { id: string; label: string; type: "Skill" | "Job" | "Company" | "Developer" };
type GraphEdge = { source: string; target: string; type: string };

const NODE_LIMIT = 40;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const skillRows = await runQuery<{ id: string; name: string }>(
      "MATCH (s:Skill {id: $id}) RETURN s.id AS id, s.name AS name",
      { id }
    );

    if (skillRows.length === 0) {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }

    const rows = await runQuery<{
      jobId: string | null;
      jobTitle: string | null;
      companyId: string | null;
      companyName: string | null;
      developerId: string | null;
      developerName: string | null;
    }>(
      `
      MATCH (s:Skill {id: $id})
      OPTIONAL MATCH (s)<-[:REQUIRES]-(j:Job)<-[:POSTS]-(c:Company)
      OPTIONAL MATCH (s)<-[:HAS_SKILL]-(d:Developer)
      RETURN j.id AS jobId, j.title AS jobTitle,
             c.id AS companyId, c.name AS companyName,
             d.id AS developerId, d.name AS developerName
      LIMIT $limit
      `,
      { id, limit: NODE_LIMIT }
    );

    const skill = skillRows[0];
    const nodeMap = new Map<string, GraphNode>();
    const edgeSet = new Set<string>();
    const edges: GraphEdge[] = [];

    nodeMap.set(skill.id, { id: skill.id, label: skill.name, type: "Skill" });

    const addEdge = (source: string, target: string, type: string) => {
      const key = `${source}->${target}:${type}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      edges.push({ source, target, type });
    };

    for (const row of rows) {
      if (row.jobId) {
        nodeMap.set(row.jobId, { id: row.jobId, label: row.jobTitle!, type: "Job" });
        addEdge(row.jobId, skill.id, "REQUIRES");

        if (row.companyId) {
          nodeMap.set(row.companyId, { id: row.companyId, label: row.companyName!, type: "Company" });
          addEdge(row.companyId, row.jobId, "POSTS");
        }
      }

      if (row.developerId) {
        nodeMap.set(row.developerId, { id: row.developerId, label: row.developerName!, type: "Developer" });
        addEdge(row.developerId, skill.id, "HAS_SKILL");
      }
    }

    return NextResponse.json({ nodes: Array.from(nodeMap.values()), edges });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load the graph. Please try again." },
      { status: 500 }
    );
  }
}
