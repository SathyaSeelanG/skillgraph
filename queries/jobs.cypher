// Query: List jobs with company, location and required skill count (with optional filters).
// Params: { search: string|null, locationId: string|null, minExperience: number|null }
MATCH (c:Company)-[:POSTS]->(j:Job)-[:LOCATED_IN]->(l:Location)
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
WHERE ($search IS NULL OR toLower(j.title) CONTAINS toLower($search))
  AND ($locationId IS NULL OR l.id = $locationId)
  AND ($minExperience IS NULL OR j.experienceMin >= $minExperience)
WITH j, c, l, collect(DISTINCT s.name) AS requiredSkills
RETURN
  j.id AS id,
  j.title AS title,
  j.experienceMin AS experienceMin,
  j.experienceMax AS experienceMax,
  j.salaryMin AS salaryMin,
  j.salaryMax AS salaryMax,
  j.employmentType AS employmentType,
  c.name AS companyName,
  l.city AS city,
  requiredSkills
ORDER BY title;

// Query: Single job detail with company, location, and required skills.
// Params: { jobId: string }
MATCH (c:Company)-[:POSTS]->(j:Job {id: $jobId})-[:LOCATED_IN]->(l:Location)
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
RETURN j, c, l, collect(DISTINCT s) AS requiredSkills;

// Query: Related jobs through shared skills (2-hop, relational-awkward aggregation).
// Params: { jobId: string }
MATCH (j1:Job {id: $jobId})-[:REQUIRES]->(s:Skill)<-[:REQUIRES]-(j2:Job)
WHERE j1.id <> j2.id
WITH j2, count(DISTINCT s) AS sharedSkills
MATCH (c:Company)-[:POSTS]->(j2)
RETURN j2.id AS jobId, j2.title AS title, c.name AS companyName, sharedSkills
ORDER BY sharedSkills DESC
LIMIT 5;
