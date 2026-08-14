import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

type GraphNode = { id: string; label: string; type: "Developer" | "Skill" | "Job" | "Company" };
type GraphEdge = { source: string; target: string; type: string };

const NODE_LIMIT = 40;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const devRows = await runQuery<{ id: string; name: string }>(
      "MATCH (d:Developer {id: $id}) RETURN d.id AS id, d.name AS name",
      { id }
    );

    if (devRows.length === 0) {
      return NextResponse.json({ error: "Developer not found." }, { status: 404 });
    }

    const rows = await runQuery<{
      skillId: string;
      skillName: string;
      jobId: string | null;
      jobTitle: string | null;
      companyId: string | null;
      companyName: string | null;
    }>(
      `
      MATCH (d:Developer {id: $id})-[:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (s)<-[:REQUIRES]-(j:Job)<-[:POSTS]-(c:Company)
      RETURN s.id AS skillId, s.name AS skillName,
             j.id AS jobId, j.title AS jobTitle,
             c.id AS companyId, c.name AS companyName
      LIMIT $limit
      `,
      { id, limit: NODE_LIMIT }
    );

    const dev = devRows[0];
    const nodeMap = new Map<string, GraphNode>();
    const edgeSet = new Set<string>();
    const edges: GraphEdge[] = [];

    nodeMap.set(dev.id, { id: dev.id, label: dev.name, type: "Developer" });

    const addEdge = (source: string, target: string, type: string) => {
      const key = `${source}->${target}:${type}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);
      edges.push({ source, target, type });
    };

    for (const row of rows) {
      nodeMap.set(row.skillId, { id: row.skillId, label: row.skillName, type: "Skill" });
      addEdge(dev.id, row.skillId, "HAS_SKILL");

      if (row.jobId) {
        nodeMap.set(row.jobId, { id: row.jobId, label: row.jobTitle!, type: "Job" });
        addEdge(row.jobId, row.skillId, "REQUIRES");
      }

      if (row.companyId) {
        nodeMap.set(row.companyId, { id: row.companyId, label: row.companyName!, type: "Company" });
        addEdge(row.companyId, row.jobId!, "POSTS");
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
