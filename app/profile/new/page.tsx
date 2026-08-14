"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/StateMessage";
import { SEED_LOCATIONS } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { type SkillListItem, type Developer } from "@/lib/types";
import { setActiveDeveloperId } from "@/lib/useActiveDeveloper";

export default function NewProfilePage() {
  const router = useRouter();

  const [skills, setSkills] = useState<SkillListItem[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [preferredLocation, setPreferredLocation] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSkillsLoading(true);
      setSkillsError(null);
      try {
        const res = await fetch("/api/skills");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "We couldn't load skills. Please try again.");
        if (!cancelled) setSkills(data.skills ?? []);
      } catch (err) {
        if (!cancelled) {
          setSkillsError(err instanceof Error ? err.message : "We couldn't load skills. Please try again.");
        }
      } finally {
        if (!cancelled) setSkillsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSkill(skillName: string) {
    setSelectedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const years = Number(experienceYears);

    if (!trimmedName) {
      setFormError("Please enter your name.");
      return;
    }
    if (experienceYears === "" || !Number.isFinite(years) || years < 0) {
      setFormError("Please enter a valid, non-negative number of years of experience.");
      return;
    }
    if (selectedSkills.length === 0) {
      setFormError("Please select at least one skill.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          experienceYears: years,
          skillNames: selectedSkills,
          preferredLocationCity: preferredLocation || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data?.error ?? "We couldn't create your profile. Please try again.");
        return;
      }

      const developer: Developer = data.developer;
      setActiveDeveloperId(developer.id);
      router.push("/");
    } catch {
      setFormError("We couldn't create your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">Create Your Profile</h1>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself so we can match you with the right jobs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Details</CardTitle>
          <CardDescription>All fields except location are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="experience" className="text-sm font-medium">
                Years of Experience
              </label>
              <Input
                id="experience"
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 3"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className="text-sm font-medium">
                Preferred Location <span className="text-muted-foreground">(optional)</span>
              </label>
              <select
                id="location"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              >
                <option value="">No preference</option>
                {SEED_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.city}>
                    {loc.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Skills</p>

              {skillsError && <ErrorState title="We couldn't load skills." description={skillsError} />}

              {skillsLoading && (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-16 rounded-full" />
                  ))}
                </div>
              )}

              {!skillsLoading && !skillsError && skills.length === 0 && (
                <EmptyState title="No skills available." />
              )}

              {!skillsLoading && !skillsError && skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const selected = selectedSkills.includes(skill.name);
                    return (
                      <Badge
                        key={skill.id}
                        variant={selected ? "default" : "outline"}
                        render={
                          <button
                            type="button"
                            onClick={() => toggleSkill(skill.name)}
                            className={cn("cursor-pointer", selected && "ring-2 ring-primary/30")}
                          />
                        }
                      >
                        {skill.name}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {selectedSkills.length > 0 && (
                <p className="pt-1 text-xs text-muted-foreground">
                  {selectedSkills.length} skill{selectedSkills.length === 1 ? "" : "s"} selected
                </p>
              )}
            </div>

            {formError && <ErrorState title="Couldn't submit your profile." description={formError} />}

            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Creating..." : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
