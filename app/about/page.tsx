import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">About SkillGraph</h1>
        <p className="text-sm text-muted-foreground">
          What this app does, why it exists, and how it&apos;s built.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>The Assignment</CardTitle>
          <CardDescription>Wexa AI CognoDB take-home</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            SkillGraph was built for Wexa AI&apos;s CognoDB take-home assignment: build a small,
            complete application backed by a graph database, using{" "}
            <strong className="font-medium text-foreground">CognoDB</strong> (a managed graph
            database speaking openCypher over the Bolt protocol) as the data layer.
          </p>
          <p>
            The brief left the use case entirely open, with the evaluation focused on data
            modeling judgment, engineering architecture, and UI/UX polish rather than any specific
            feature list.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What SkillGraph Does</CardTitle>
          <CardDescription>Developer skill and job matching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Developers typically have several skills, and jobs typically require several skills —
            the relationship between the two is naturally many-to-many, and it doesn&apos;t stop
            there: jobs belong to companies, companies post many jobs, and jobs and developers
            both relate to locations.
          </p>
          <p>SkillGraph represents all of that as a graph and lets a developer:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>See which jobs best match their current skills, and by how much.</li>
            <li>Understand exactly why a job matches — which required skills they have, and which they&apos;re missing.</li>
            <li>Explore similar jobs based on shared required skills.</li>
            <li>Browse skills to see which jobs and companies need them, and which skills tend to co-occur.</li>
            <li>Visually explore the underlying graph of developers, skills, jobs, companies, and locations.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why a Graph Database?</CardTitle>
          <CardDescription>Every core feature here is a traversal, not a lookup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The primary matching query walks a 3-hop pattern:{" "}
            <span className="font-mono text-xs">
              Developer -[HAS_SKILL]-&gt; Skill &lt;-[REQUIRES]- Job &lt;-[POSTS]- Company
            </span>
            . In Cypher that&apos;s one pattern match. In SQL it&apos;s four tables, three join
            conditions, and a GROUP BY to get the matching-skill count back out.
          </p>
          <p>
            The skill explorer&apos;s co-occurrence query (which other skills tend to appear
            alongside a given skill) is a self-join of a junction table against itself in SQL —
            in Cypher it&apos;s the same one-line pattern, and each additional hop is just one more
            relationship segment.
          </p>
          <p>
            &quot;Similar jobs&quot; (jobs sharing required skills) is the same story: a
            job-to-job similarity signal that only exists because two jobs point at the same skill
            nodes. The graph makes that connection a first-class thing you can pattern-match on.
          </p>
          <p>
            In short: the relationships are the product here, not incidental foreign keys. The
            UI&apos;s &quot;why does this job match&quot; explanation, the graph explorer, and the
            skill explorer are all direct renderings of graph traversals — there&apos;s no
            translation layer between how the data is stored and how the feature is explained.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Model</CardTitle>
          <CardDescription>5 node types, 5 relationship types</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            <Badge>Developer</Badge>
            <Badge variant="secondary">Skill</Badge>
            <Badge variant="secondary">Job</Badge>
            <Badge variant="outline">Company</Badge>
            <Badge variant="outline">Location</Badge>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted/40 p-3 font-mono text-xs">
{`(:Developer)-[:HAS_SKILL]->(:Skill)
(:Job)-[:REQUIRES]->(:Skill)
(:Company)-[:POSTS]->(:Job)
(:Job)-[:LOCATED_IN]->(:Location)
(:Developer)-[:PREFERS]->(:Location)`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tech Stack &amp; Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="font-medium text-foreground">Frontend</strong> — Next.js 16
              (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Flow for the Graph
              Explorer.
            </li>
            <li>
              <strong className="font-medium text-foreground">API layer</strong> — Next.js Route
              Handlers under <span className="font-mono text-xs">app/api/</span>, running
              entirely server-side, with input validation and generic error messages (no raw
              driver errors ever reach the client).
            </li>
            <li>
              <strong className="font-medium text-foreground">Database layer</strong> — a
              singleton <span className="font-mono text-xs">neo4j-driver</span> instance in{" "}
              <span className="font-mono text-xs">lib/cognodb.ts</span>, with parameterized
              queries throughout (no string-concatenated Cypher) and automatic unwrapping of
              Neo4j&apos;s 64-bit integer types.
            </li>
            <li>
              <strong className="font-medium text-foreground">Database</strong> — CognoDB, a
              hosted graph database speaking openCypher over Bolt, accessed with the official
              JavaScript Neo4j driver.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
