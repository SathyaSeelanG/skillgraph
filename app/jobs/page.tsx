"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { EmptyState, ErrorState } from "@/components/StateMessage";
import { SEED_LOCATIONS } from "@/lib/locations";
import { type Developer, type JobListItem, type JobMatch } from "@/lib/types";
import { useActiveDeveloperId } from "@/lib/useActiveDeveloper";
import { Search, X } from "lucide-react";

const EXPERIENCE_OPTIONS = [
  { value: "any", label: "Any experience" },
  { value: "0", label: "0+ years" },
  { value: "1", label: "1+ years" },
  { value: "2", label: "2+ years" },
  { value: "3", label: "3+ years" },
  { value: "5", label: "5+ years" },
];

export default function JobsPage() {
  const [activeId] = useActiveDeveloperId();
  const [search, setSearch] = useState("");
  const [locationId, setLocationId] = useState<string>("any");
  const [minExperience, setMinExperience] = useState<string>("any");

  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});
  const [developerSkills, setDeveloperSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (locationId !== "any") params.set("locationId", locationId);
        if (minExperience !== "any") params.set("minExperience", minExperience);

        const res = await fetch(`/api/jobs?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "We couldn't load jobs. Please try again.");
        if (!cancelled) setJobs(data.jobs ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "We couldn't load jobs. Please try again.");
          setJobs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, locationId, minExperience]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/developers/${activeId}/matches`);
        if (!res.ok) return;
        const data: { jobs: JobMatch[] } = await res.json();
        if (cancelled) return;
        const scores: Record<string, number> = {};
        for (const m of data.jobs) scores[m.jobId] = m.matchScore;
        setMatchScores(scores);
      } catch {
        // match scores are a nice-to-have overlay; ignore failures silently
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/developers/${activeId}`);
        if (!res.ok) return;
        const data: { developer: Developer } = await res.json();
        if (!cancelled) setDeveloperSkills(data.developer?.skills ?? []);
      } catch {
        // developer skills are only used for the match-breakdown tooltip; ignore failures silently
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const skeletons = useMemo(() => Array.from({ length: 6 }), []);

  const activeFilterCount =
    (search.trim() ? 1 : 0) + (locationId !== "any" ? 1 : 0) + (minExperience !== "any" ? 1 : 0);

  function clearFilters() {
    setSearch("");
    setLocationId("any");
    setMinExperience("any");
  }

  const locationItems = useMemo(
    () => ({
      any: "Any location",
      ...Object.fromEntries(SEED_LOCATIONS.map((loc) => [loc.id, loc.city])),
    }),
    []
  );
  const experienceItems = useMemo(
    () => Object.fromEntries(EXPERIENCE_OPTIONS.map((opt) => [opt.value, opt.label])),
    []
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Jobs</h1>
        <p className="text-sm text-muted-foreground">
          Search open roles and see how well they match your profile.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {activeFilterCount} active
              </span>
            )}
          </p>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-3.5" />
              Clear all
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="job-search" className="text-xs font-medium text-muted-foreground">
              Job title
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="job-search"
                placeholder="e.g. React Developer"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="job-location" className="text-xs font-medium text-muted-foreground">
              Location
            </label>
            <Select
              items={locationItems}
              value={locationId}
              onValueChange={(v) => setLocationId(v ?? "any")}
            >
              <SelectTrigger id="job-location" className="w-full">
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any location</SelectItem>
                {SEED_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="job-experience" className="text-xs font-medium text-muted-foreground">
              Minimum experience
            </label>
            <Select
              items={experienceItems}
              value={minExperience}
              onValueChange={(v) => setMinExperience(v ?? "any")}
            >
              <SelectTrigger id="job-experience" className="w-full">
                <SelectValue placeholder="Any experience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && <ErrorState title="We couldn't load jobs." description={error} />}

      {!error && loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletons.map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {!error && !loading && jobs.length === 0 && (
        <EmptyState
          title="No matching jobs found."
          description="Try adjusting your search or filters."
        />
      )}

      {!error && !loading && jobs.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {jobs.length} job{jobs.length === 1 ? "" : "s"} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                companyName={job.companyName}
                city={job.city}
                experienceMin={job.experienceMin}
                experienceMax={job.experienceMax}
                employmentType={job.employmentType}
                requiredSkills={job.requiredSkills}
                matchScore={matchScores[job.id]}
                developerSkills={developerSkills}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
