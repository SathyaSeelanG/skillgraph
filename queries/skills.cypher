// Query: Skill explorer — jobs requiring a skill, companies and locations involved,
// plus related skills (skills co-required with this one across jobs). This is the
// "relational-database-would-find-awkward" query: computing co-occurring skills across
// an arbitrary number of shared jobs requires a variable number of self-joins in SQL,
// whereas here it's one traversal.
// Params: { skillId: string }
MATCH (s:Skill {id: $skillId})<-[:REQUIRES]-(j:Job)<-[:POSTS]-(c:Company)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
RETURN
  s.name AS skillName,
  count(DISTINCT j) AS jobCount,
  collect(DISTINCT c.name) AS companies,
  collect(DISTINCT l.city) AS locations;

// Query: Related skills — skills frequently required alongside this skill.
// Params: { skillId: string }
MATCH (s:Skill {id: $skillId})<-[:REQUIRES]-(j:Job)-[:REQUIRES]->(related:Skill)
WHERE related.id <> s.id
RETURN related.name AS relatedSkill, count(DISTINCT j) AS sharedJobs
ORDER BY sharedJobs DESC
LIMIT 10;

// Query: List all skills with the number of jobs requiring them.
MATCH (s:Skill)
OPTIONAL MATCH (s)<-[:REQUIRES]-(j:Job)
RETURN s.id AS id, s.name AS name, s.category AS category, count(j) AS jobCount
ORDER BY name;
