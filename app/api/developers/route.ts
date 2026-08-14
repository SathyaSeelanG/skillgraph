import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { runQuery } from "@/lib/cognodb";

export async function GET() {
  try {
    const rows = await runQuery<{
      id: string;
      name: string;
      experienceYears: number;
      skills: string[];
    }>(
      `
      MATCH (d:Developer)
      OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
      RETURN d.id AS id, d.name AS name, d.experienceYears AS experienceYears, collect(s.name) AS skills
      ORDER BY name
      `
    );
    return NextResponse.json({ developers: rows });
  } catch {
    return NextResponse.json(
      { error: "We couldn't load developers. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, experienceYears, skillNames, preferredLocationCity } = body as Record<
    string,
    unknown
  >;

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Please enter a name." }, { status: 400 });
  }

  if (typeof experienceYears !== "number" || !Number.isFinite(experienceYears) || experienceYears < 0) {
    return NextResponse.json(
      { error: "Please enter a valid, non-negative number of years of experience." },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(skillNames) ||
    skillNames.length === 0 ||
    !skillNames.every((s) => typeof s === "string" && s.trim().length > 0)
  ) {
    return NextResponse.json(
      { error: "Please select at least one skill." },
      { status: 400 }
    );
  }

  if (preferredLocationCity !== undefined && typeof preferredLocationCity !== "string") {
    return NextResponse.json({ error: "Invalid preferred location." }, { status: 400 });
  }

  try {
    const matchedSkills = await runQuery<{ name: string }>(
      `MATCH (s:Skill) WHERE s.name IN $skillNames RETURN s.name AS name`,
      { skillNames }
    );

    if (matchedSkills.length !== new Set(skillNames).size) {
      return NextResponse.json(
        { error: "One or more selected skills are not recognized." },
        { status: 400 }
      );
    }

    if (preferredLocationCity) {
      const matchedLocations = await runQuery<{ city: string }>(
        `MATCH (l:Location {city: $city}) RETURN l.city AS city`,
        { city: preferredLocationCity }
      );
      if (matchedLocations.length === 0) {
        return NextResponse.json(
          { error: "The selected location is not recognized." },
          { status: 400 }
        );
      }
    }

    const id = `d-${randomUUID()}`;

    const rows = await runQuery<{
      id: string;
      name: string;
      experienceYears: number;
      skills: string[];
      preferredLocation: string | null;
    }>(
      `
      CREATE (d:Developer {id: $id, name: $name, experienceYears: $experienceYears})
      WITH d
      UNWIND $skillNames AS skillName
      MATCH (s:Skill {name: skillName})
      CREATE (d)-[:HAS_SKILL]->(s)
      WITH d, collect(s.name) AS skills
      OPTIONAL MATCH (l:Location {city: $preferredLocationCity})
      FOREACH (loc IN CASE WHEN l IS NULL THEN [] ELSE [l] END |
        CREATE (d)-[:PREFERS]->(loc)
      )
      RETURN d.id AS id, d.name AS name, d.experienceYears AS experienceYears,
             skills, CASE WHEN l IS NULL THEN null ELSE l.city END AS preferredLocation
      `,
      {
        id,
        name: name.trim(),
        experienceYears,
        skillNames,
        preferredLocationCity: preferredLocationCity ?? null,
      }
    );

    return NextResponse.json({ developer: rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "We couldn't create your profile. Please try again." },
      { status: 500 }
    );
  }
}
