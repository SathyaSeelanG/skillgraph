// Query: Multi-hop traversal — Developer -> Skill -> Job -> Company (3 hops).
// Params: { developerId: string }
MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)<-[:POSTS]-(c:Company)
RETURN
  d.name AS developerName,
  j.id AS jobId,
  j.title AS jobTitle,
  c.name AS companyName,
  collect(DISTINCT s.name) AS matchingSkills
ORDER BY size(matchingSkills) DESC;

// Query: Subgraph around a single job for the Graph Explorer (job -> skills, company, location).
// Params: { jobId: string }
MATCH (j:Job {id: $jobId})
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
OPTIONAL MATCH (c:Company)-[:POSTS]->(j)
OPTIONAL MATCH (j)-[:LOCATED_IN]->(l:Location)
RETURN j, collect(DISTINCT s) AS skills, c, l;

// Query: Subgraph around a single developer for the Graph Explorer
// (developer -> skills -> jobs -> companies, plus preferred location).
// Params: { developerId: string, limit: number }
MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(s:Skill)
OPTIONAL MATCH (s)<-[:REQUIRES]-(j:Job)<-[:POSTS]-(c:Company)
OPTIONAL MATCH (d)-[:PREFERS]->(l:Location)
RETURN d, collect(DISTINCT s) AS skills, collect(DISTINCT j)[0..$limit] AS jobs, collect(DISTINCT c)[0..$limit] AS companies, l;
