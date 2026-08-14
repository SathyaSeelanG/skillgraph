import { config } from "dotenv";
config({ path: ".env.local" });

import neo4j from "neo4j-driver";
import {
  skills,
  locations,
  companies,
  jobTitles,
  jobSkillProfiles,
  employmentTypes,
  developerSeeds,
} from "./seed-data";

const uri = process.env.COGNODB_URI!;
const username = process.env.COGNODB_USERNAME!;
const password = process.env.COGNODB_PASSWORD!;

if (!uri || !username || !password) {
  console.error("Missing CognoDB credentials in .env.local");
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

// Deterministic pseudo-random generator so re-runs are stable.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const pickMany = <T,>(arr: T[], n: number) => {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
};

type SeedJob = {
  id: string;
  title: string;
  description: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  employmentType: string;
  source: string;
  sourceUrl: string | null;
  companyId: string;
  locationId: string;
  requiredSkills: string[];
};

function buildJobs(count: number): SeedJob[] {
  const jobs: SeedJob[] = [];
  for (let i = 0; i < count; i++) {
    const title = jobTitles[i % jobTitles.length];
    const profile = jobSkillProfiles[title];
    const requiredSkills = pickMany(profile, Math.min(profile.length, 3 + Math.floor(rand() * 2)));
    const company = pick(companies);
    const location = pick(locations);
    const expMin = Math.floor(rand() * 3);
    const expMax = expMin + 1 + Math.floor(rand() * 3);
    const salaryMin = 6 + Math.floor(rand() * 10);
    const salaryMax = salaryMin + 2 + Math.floor(rand() * 8);

    jobs.push({
      id: `j${i + 1}`,
      title,
      description: `We are looking for a ${title} to join ${company.name}. You'll work on real-world products using ${requiredSkills.join(", ")}.`,
      experienceMin: expMin,
      experienceMax: expMax,
      salaryMin,
      salaryMax,
      employmentType: pick(employmentTypes),
      source: "seed",
      sourceUrl: null,
      companyId: company.id,
      locationId: location.id,
      requiredSkills,
    });
  }
  return jobs;
}

const jobs = buildJobs(50);

async function run() {
  const session = driver.session();
  try {
    console.log("Clearing existing graph data...");
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("Creating constraints...");
    const constraints = [
      "CREATE CONSTRAINT IF NOT EXISTS FOR (d:Developer) REQUIRE d.id IS UNIQUE",
      "CREATE CONSTRAINT IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
      "CREATE CONSTRAINT IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE",
      "CREATE CONSTRAINT IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE",
      "CREATE CONSTRAINT IF NOT EXISTS FOR (l:Location) REQUIRE l.id IS UNIQUE",
    ];
    for (const c of constraints) {
      try {
        await session.run(c);
      } catch {
        // CognoDB may not support IF NOT EXISTS on constraints; ignore if already present or unsupported.
      }
    }

    console.log(`Seeding ${skills.length} skills...`);
    for (const s of skills) {
      await session.run(
        "CREATE (s:Skill {id: $id, name: $name, category: $category})",
        s
      );
    }

    console.log(`Seeding ${locations.length} locations...`);
    for (const l of locations) {
      await session.run(
        "CREATE (l:Location {id: $id, city: $city, state: $state, country: $country})",
        l
      );
    }

    console.log(`Seeding ${companies.length} companies...`);
    for (const c of companies) {
      await session.run(
        "CREATE (c:Company {id: $id, name: $name, industry: $industry, website: $website})",
        c
      );
    }

    console.log(`Seeding ${jobs.length} jobs...`);
    for (const j of jobs) {
      await session.run(
        `
        CREATE (j:Job {
          id: $id,
          title: $title,
          description: $description,
          experienceMin: $experienceMin,
          experienceMax: $experienceMax,
          salaryMin: $salaryMin,
          salaryMax: $salaryMax,
          employmentType: $employmentType,
          source: $source,
          sourceUrl: $sourceUrl
        })
        WITH j
        MATCH (c:Company {id: $companyId})
        MATCH (l:Location {id: $locationId})
        CREATE (c)-[:POSTS]->(j)
        CREATE (j)-[:LOCATED_IN]->(l)
        `,
        j
      );

      for (const skillName of j.requiredSkills) {
        const skill = skills.find((s) => s.name === skillName)!;
        await session.run(
          `
          MATCH (j:Job {id: $jobId})
          MATCH (s:Skill {id: $skillId})
          CREATE (j)-[:REQUIRES]->(s)
          `,
          { jobId: j.id, skillId: skill.id }
        );
      }
    }

    console.log(`Seeding ${developerSeeds.length} developers...`);
    for (const d of developerSeeds) {
      await session.run(
        "CREATE (d:Developer {id: $id, name: $name, experienceYears: $experienceYears})",
        { id: d.id, name: d.name, experienceYears: d.experienceYears }
      );

      for (const skillName of d.skills) {
        const skill = skills.find((s) => s.name === skillName)!;
        await session.run(
          `
          MATCH (d:Developer {id: $devId})
          MATCH (s:Skill {id: $skillId})
          CREATE (d)-[:HAS_SKILL]->(s)
          `,
          { devId: d.id, skillId: skill.id }
        );
      }

      const location = locations.find((l) => l.city === d.preferredLocation)!;
      await session.run(
        `
        MATCH (d:Developer {id: $devId})
        MATCH (l:Location {id: $locId})
        CREATE (d)-[:PREFERS]->(l)
        `,
        { devId: d.id, locId: location.id }
      );
    }

    console.log("Seed complete.");
  } finally {
    await session.close();
    await driver.close();
  }
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
