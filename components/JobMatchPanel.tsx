"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkillBadgeList } from "@/components/SkillBadge";
import { MatchScore } from "@/components/MatchScore";
import { useActiveDeveloperId } from "@/lib/useActiveDeveloper";
import type { Developer } from "@/lib/types";
import { Network } from "lucide-react";

interface JobMatchPanelProps {
  jobId: string;
  jobTitle: string;
  requiredSkills: string[];
}

export function JobMatchPanel({ jobId, jobTitle, requiredSkills }: JobMatchPanelProps) {
  const [activeId] = useActiveDeveloperId();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/developers/${activeId}`);
        if (!res.ok) {
          if (!cancelled) setDeveloper(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setDeveloper(data.developer ?? null);
      } catch {
        if (!cancelled) setDeveloper(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!developer) return null;

  const developerSkills = new Set(developer.skills);
  const matchingSkills = requiredSkills.filter((s) => developerSkills.has(s));
  const missingSkills = requiredSkills.filter((s) => !developerSkills.has(s));
  const matchScore =
    requiredSkills.length > 0 ? Math.round((matchingSkills.length / requiredSkills.length) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Match Explanation for {developer.name}</CardTitle>
            <CardDescription>
              {matchingSkills.length} of {requiredSkills.length} required skills matched &mdash;{" "}
              {matchScore}% match
            </CardDescription>
          </div>
          <MatchScore score={matchScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Matching</p>
          {matchingSkills.length > 0 ? (
            <SkillBadgeList skills={matchingSkills} state="match" />
          ) : (
            <p className="text-sm text-muted-foreground">No matching skills.</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Missing</p>
          {missingSkills.length > 0 ? (
            <SkillBadgeList skills={missingSkills} state="missing" />
          ) : (
            <p className="text-sm text-muted-foreground">None &mdash; every required skill is covered.</p>
          )}
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="font-mono">
            {developer.name} &rarr; HAS_SKILL &rarr; Skill &larr; REQUIRES &larr; {jobTitle}
          </p>
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <Button variant="outline" size="sm" render={<Link href={`/graph?jobId=${jobId}`} />}>
          <Network className="size-4" />
          Explore Graph
        </Button>
      </CardContent>
    </Card>
  );
}
