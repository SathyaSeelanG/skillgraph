"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkillList } from "@/components/SkillList";
import { MatchCard } from "@/components/MatchCard";
import { EmptyState, ErrorState } from "@/components/StateMessage";
import { PRIMARY_DEVELOPER_ID, type Developer, type JobMatch } from "@/lib/types";
import { useActiveDeveloperId, clearActiveDeveloperId } from "@/lib/useActiveDeveloper";
import { Network, MapPin, Briefcase, UserPlus } from "lucide-react";

export function DashboardContent() {
  const [activeId] = useActiveDeveloperId();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);

      let id = activeId;

      try {
        let developerRes = await fetch(`/api/developers/${id}`);
        if (developerRes.status === 404 && id !== PRIMARY_DEVELOPER_ID) {
          // Stale localStorage id (e.g. dev data reseeded) — fall back to the seeded default.
          clearActiveDeveloperId();
          id = PRIMARY_DEVELOPER_ID;
          developerRes = await fetch(`/api/developers/${id}`);
        }

        const developerData = await developerRes.json();
        if (!developerRes.ok) {
          throw new Error(developerData?.error ?? "We couldn't load your dashboard. Please try again.");
        }

        const matchesRes = await fetch(`/api/developers/${id}/matches`);
        const matchesData = await matchesRes.json();
        if (!matchesRes.ok) {
          throw new Error(matchesData?.error ?? "We couldn't load your dashboard. Please try again.");
        }

        if (!cancelled) {
          setDeveloper(developerData.developer);
          setMatches(matchesData.jobs ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "We couldn't load your dashboard. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">SkillGraph</h1>
          <p className="text-sm text-muted-foreground">
            Graph-powered job matching, built from your developer profile.
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/profile/new" />}>
          <UserPlus className="size-4" />
          Create your profile
        </Button>
      </div>

      {loading && (
        <div className="space-y-8">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      )}

      {!loading && error && <ErrorState title="We couldn't load your dashboard." description={error} />}

      {!loading && !error && developer && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{developer.name}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-3.5" />
                    {developer.experienceYears} yrs experience
                  </span>
                  {developer.preferredLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      Prefers {developer.preferredLocation}
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/graph?developerId=${developer.id}`} />}
              >
                <Network className="size-4" />
                Explore Graph
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SkillList title="Skills" skills={developer.skills} />
          </CardContent>
        </Card>
      )}

      {!loading && !error && developer && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Top Job Matches</h2>
            <Button variant="ghost" size="sm" render={<Link href="/jobs" />}>
              View all jobs
            </Button>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              title="No matching jobs found."
              description="Try adding more skills to your profile."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.slice(0, 6).map((match) => (
                <MatchCard
                  key={match.jobId}
                  jobId={match.jobId}
                  title={match.title}
                  company={match.company}
                  matchingSkills={match.matchingSkills}
                  requiredSkills={match.requiredSkills}
                  matchingSkillNames={match.matchingSkillNames}
                  requiredSkillNames={match.requiredSkillNames}
                  matchScore={match.matchScore}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
