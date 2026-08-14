// Query: Find jobs matching a developer's skills, ranked by match count.
// Params: { developerId: string }
MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)
WITH j, count(DISTINCT s) AS matchingSkills
MATCH (j)-[:REQUIRES]->(allSkills:Skill)
WITH j, matchingSkills, count(DISTINCT allSkills) AS requiredSkills
RETURN
  j.id AS jobId,
  j.title AS title,
  matchingSkills,
  requiredSkills,
  round(100.0 * matchingSkills / requiredSkills) AS matchScore
ORDER BY matchScore DESC, matchingSkills DESC;

// Query: Matching + missing skills for one developer/job pair.
// Params: { developerId: string, jobId: string }
MATCH (j:Job {id: $jobId})-[:REQUIRES]->(required:Skill)
OPTIONAL MATCH (d:Developer {id: $developerId})-[:HAS_SKILL]->(required)
RETURN
  required.name AS skillName,
  d IS NOT NULL AS matched;
