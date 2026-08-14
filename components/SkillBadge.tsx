import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

type SkillBadgeState = "neutral" | "match" | "missing";

export function SkillBadge({
  skill,
  state = "neutral",
}: {
  skill: string;
  state?: SkillBadgeState;
}) {
  if (state === "match") {
    return (
      <Badge className="gap-1 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
        <Check className="size-3" />
        {skill}
      </Badge>
    );
  }

  if (state === "missing") {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <X className="size-3" />
        {skill}
      </Badge>
    );
  }

  return <Badge variant="secondary">{skill}</Badge>;
}

export function SkillBadgeList({
  skills,
  state = "neutral",
  className,
}: {
  skills: string[];
  state?: SkillBadgeState;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {skills.map((skill) => (
        <SkillBadge key={skill} skill={skill} state={state} />
      ))}
    </div>
  );
}
