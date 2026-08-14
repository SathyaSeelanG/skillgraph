import { NextResponse } from "next/server";
import { runQuery } from "@/lib/cognodb";

export async function GET() {
  try {
    const skills = await runQuery<{
      id: string;
      name: string;
      category: string;
      jobCount: number;
    }>(
      `
      MATCH (s:Skill)
      OPTIONAL MATCH (s)<-[:REQUIRES]-(j:Job)
      RETURN s.id AS id, s.name AS name, s.category AS category, count(j) AS jobCount
      ORDER BY name
      `
    );
    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load skills. Please try again." },
      { status: 500 }
    );
  }
}
