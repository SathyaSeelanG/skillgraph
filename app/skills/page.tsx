"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmptyState, ErrorState } from "@/components/StateMessage";
import { cn } from "@/lib/utils";
import type { SkillListItem, SkillDetail, RelatedSkill } from "@/lib/types";
import { Search, Building2, MapPin } from "lucide-react";

export default function SkillsPage() {
  return (
    <Suspense fallback={<SkillsPageSkeleton />}>
      <SkillsPageContent />
    </Suspense>
  );
}

function SkillsPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function SkillsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSkillId = searchParams.get("skillId");

  const [skills, setSkills] = useState<SkillListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/skills");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "We couldn't load skills. Please try again.");
        if (!cancelled) setSkills(data.skills ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "We couldn't load skills. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Skill Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Browse skills and see which jobs, companies, and locations rely on them.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {error && <ErrorState title="We couldn't load skills." description={error} />}

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          )}

          {!loading && !error && filteredSkills.length === 0 && (
            <EmptyState title="No skills found." />
          )}

          {!loading && !error && filteredSkills.length > 0 && (
            <ul className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
              {filteredSkills.map((skill) => (
                <li key={skill.id}>
                  <button
                    onClick={() => router.push(`/skills?skillId=${skill.id}`)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      selectedSkillId === skill.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <span className="truncate">{skill.name}</span>
                    <Badge
                      variant={selectedSkillId === skill.id ? "secondary" : "outline"}
                      className="shrink-0"
                    >
                      {skill.jobCount}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {selectedSkillId ? (
            <SkillDetailView skillId={selectedSkillId} />
          ) : (
            <EmptyState
              title="Select a skill"
              description="Choose a skill from the list to see its details."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SkillDetailView({ skillId }: { skillId: string }) {
  const [detail, setDetail] = useState<SkillDetail | null>(null);
  const [relatedSkills, setRelatedSkills] = useState<RelatedSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const res = await fetch(`/api/skills/${skillId}`);
        const data = await res.json();
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(data?.error ?? "We couldn't load this skill. Please try again.");
        if (!cancelled) {
          setDetail(data.skill);
          setRelatedSkills(data.relatedSkills ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "We couldn't load this skill. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [skillId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (notFound) {
    return <ErrorState title="Skill not found." description="This skill may have been removed." />;
  }

  if (error || !detail) {
    return <ErrorState title="We couldn't load this skill." description={error ?? undefined} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{detail.skillName}</CardTitle>
        <CardDescription>Required by {detail.jobCount} job{detail.jobCount === 1 ? "" : "s"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Building2 className="size-4" />
            Companies
          </p>
          {detail.companies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {detail.companies.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No companies found.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <MapPin className="size-4" />
            Locations
          </p>
          {detail.locations.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {detail.locations.map((l) => (
                <Badge key={l} variant="outline">
                  {l}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No locations found.</p>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Related Skills</p>
          {relatedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {relatedSkills.map((rel) => (
                <Badge key={rel.relatedSkill} variant="secondary">
                  {rel.relatedSkill}
                  <span className="text-muted-foreground/70">&middot; {rel.sharedJobs}</span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No related skills found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
