// Query: Location-aware job exploration — jobs located in a developer's preferred location.
// Params: { developerId: string }
MATCH (d:Developer {id: $developerId})-[:PREFERS]->(l:Location)<-[:LOCATED_IN]-(j:Job)
MATCH (c:Company)-[:POSTS]->(j)
RETURN d.name AS developerName, l.city AS city, j.id AS jobId, j.title AS jobTitle, c.name AS companyName;
