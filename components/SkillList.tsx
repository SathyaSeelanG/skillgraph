import { SkillBadgeList } from "@/components/SkillBadge";

export function SkillList({ title, skills }: { title?: string; skills: string[] }) {
  if (skills.length === 0) {
    return <p className="text-sm text-muted-foreground">No skills listed.</p>;
  }

  return (
    <div className="space-y-2">
      {title && <p className="text-sm font-medium text-muted-foreground">{title}</p>}
      <SkillBadgeList skills={skills} />
    </div>
  );
}
