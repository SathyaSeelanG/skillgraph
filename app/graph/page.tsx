"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { GraphView, LEGEND_ITEMS, NODE_COLORS } from "@/components/GraphView";
import { EmptyState, ErrorState } from "@/components/StateMessage";
import {
  type Developer,
  type JobListItem,
  type SkillListItem,
  type GraphData,
  type GraphNode,
  type GraphNodeType,
} from "@/lib/types";
import { useActiveDeveloperId } from "@/lib/useActiveDeveloper";

function NodeTypeBadge({ type }: { type: GraphNodeType }) {
  const colors = NODE_COLORS[type];
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
    >
      {type}
    </span>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<GraphPageSkeleton />}>
      <GraphPageContent />
    </Suspense>
  );
}

function GraphPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-[560px] w-full" />
    </div>
  );
}

type SourceMode = "developer" | "job" | "skill";

function GraphPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeDeveloperId] = useActiveDeveloperId();

  const initialJobId = searchParams.get("jobId");
  const initialSkillId = searchParams.get("skillId");
  const initialDeveloperId = searchParams.get("developerId");

  const [mode, setMode] = useState<SourceMode>(
    initialJobId ? "job" : initialSkillId ? "skill" : "developer"
  );
  const [entityId, setEntityId] = useState(
    initialJobId ?? initialSkillId ?? initialDeveloperId ?? activeDeveloperId
  );

  // If the developer subgraph is showing with no explicit ?developerId and the user
  // switches their active profile via the Navbar selector, follow it.
  useEffect(() => {
    if (mode === "developer" && !initialDeveloperId) {
      setEntityId(activeDeveloperId);
    }
  }, [activeDeveloperId, mode, initialDeveloperId]);

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [skills, setSkills] = useState<SkillListItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/developers");
        const data = await res.json();
        if (res.ok) setDevelopers(data.developers ?? []);
      } catch {
        // entity lists are a nice-to-have for the selector dropdowns; ignore failures silently
      }
    })();
    (async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (res.ok) setJobs(data.jobs ?? []);
      } catch {
        // ignore
      }
    })();
    (async () => {
      try {
        const res = await fetch("/api/skills");
        const data = await res.json();
        if (res.ok) setSkills(data.skills ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const developerItems = useMemo(
    () => Object.fromEntries(developers.map((d) => [d.id, d.name])),
    [developers]
  );
  const jobItems = useMemo(
    () => Object.fromEntries(jobs.map((j) => [j.id, j.title])),
    [jobs]
  );
  const skillItems = useMemo(
    () => Object.fromEntries(skills.map((s) => [s.id, s.name])),
    [skills]
  );

  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setSelectedNode(null);
      try {
        const path =
          mode === "developer"
            ? `/api/graph/developer/${entityId}`
            : mode === "job"
              ? `/api/graph/job/${entityId}`
              : `/api/graph/skill/${entityId}`;
        const res = await fetch(path);
        const json = await res.json();
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(json?.error ?? "We couldn't load the graph. Please try again.");
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "We couldn't load the graph. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, entityId]);

  function updateQueryParam(nextMode: SourceMode, nextEntity: string) {
    const key = nextMode === "developer" ? "developerId" : nextMode === "job" ? "jobId" : "skillId";
    router.replace(`/graph?${key}=${nextEntity}`);
  }

  function handleModeChange(next: string | null) {
    if (!next) return;
    const nextMode = next as SourceMode;
    setMode(nextMode);
    const nextEntity =
      nextMode === "developer"
        ? activeDeveloperId
        : nextMode === "job"
          ? jobs[0]?.id ?? entityId
          : skills[0]?.id ?? entityId;
    setEntityId(nextEntity);
    updateQueryParam(nextMode, nextEntity);
  }

  function handleEntityChange(next: string | null) {
    if (!next) return;
    setEntityId(next);
    updateQueryParam(mode, next);
  }

  function handleNodeClick(nodeId: string) {
    const node = data?.nodes.find((n) => n.id === nodeId) ?? null;
    setSelectedNode(node);
  }

  const entitySelectItems = mode === "developer" ? developerItems : mode === "job" ? jobItems : skillItems;
  const entitySelectOptions =
    mode === "developer"
      ? developers.map((d) => ({ id: d.id, label: d.name }))
      : mode === "job"
        ? jobs.map((j) => ({ id: j.id, label: j.title }))
        : skills.map((s) => ({ id: s.id, label: s.name }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Graph Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Visualize how developers, skills, jobs, companies, and locations connect.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Explore from" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="developer">Developer subgraph</SelectItem>
            <SelectItem value="job">Job subgraph</SelectItem>
            <SelectItem value="skill">Skill subgraph</SelectItem>
          </SelectContent>
        </Select>

        <Select items={entitySelectItems} value={entityId} onValueChange={handleEntityChange}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder={`Select a ${mode}`} />
          </SelectTrigger>
          <SelectContent>
            {entitySelectOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-muted/30 px-4 py-3">
        {LEGEND_ITEMS.map((item) => (
          <span key={item.type} className="flex items-center gap-1.5 text-xs">
            <NodeTypeBadge type={item.type} />
          </span>
        ))}
      </div>

      {error && <ErrorState title="We couldn't load the graph." description={error} />}

      {notFound && (
        <ErrorState
          title="Not found."
          description={`No ${mode} exists with id "${entityId}".`}
        />
      )}

      {loading && !error && !notFound && <Skeleton className="h-[560px] w-full" />}

      {!loading && !error && !notFound && data && data.nodes.length === 0 && (
        <EmptyState title="No graph data found." description="Try a different developer, job, or skill." />
      )}

      {!loading && !error && !notFound && data && data.nodes.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <GraphView data={data} onNodeClick={handleNodeClick} />
          <Card className="h-fit lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-sm">Node Details</CardTitle>
              <CardDescription>Click a node to inspect it.</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-3">
                  <NodeTypeBadge type={selectedNode.type} />
                  <p className="text-sm font-medium">{selectedNode.label}</p>
                  <p className="font-mono text-xs break-all text-muted-foreground">
                    {selectedNode.id}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No node selected.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
