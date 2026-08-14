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
      name: string;
      experienceYears: number;
      skills: string[];
      preferredLocation: string | null;
    }>(
      `
      MATCH (d:Developer {id: $id})
      OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (d)-[:PREFERS]->(l:Location)
      RETURN d.id AS id, d.name AS name, d.experienceYears AS experienceYears,
             collect(DISTINCT s.name) AS skills, l.city AS preferredLocation
      `,
      { id }
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Developer not found." }, { status: 404 });
    }

    return NextResponse.json({ developer: rows[0] });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load this developer. Please try again." },
      { status: 500 }
    );
  }
}
