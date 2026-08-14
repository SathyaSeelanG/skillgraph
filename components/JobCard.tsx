import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MatchScore } from "@/components/MatchScore";
import { SkillBadgeList } from "@/components/SkillBadge";
import { MatchBreakdownTooltip } from "@/components/MatchBreakdown";
import { Briefcase, MapPin } from "lucide-react";

export function JobCard({
  id,
  title,
  companyName,
  city,
  experienceMin,
  experienceMax,
  employmentType,
  requiredSkills,
  matchScore,
  developerSkills,
}: {
  id: string;
  title: string;
  companyName: string;
  city: string;
  experienceMin: number;
  experienceMax: number;
  employmentType: string;
  requiredSkills: string[];
  matchScore?: number;
  developerSkills?: string[];
}) {
  return (
    <Link href={`/jobs/${id}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{companyName}</CardDescription>
            </div>
            {typeof matchScore === "number" &&
              (developerSkills ? (
                <MatchBreakdownTooltip
                  matchScore={matchScore}
                  requiredSkills={requiredSkills}
                  developerSkills={developerSkills}
                >
                  <MatchScore score={matchScore} size="sm" />
                </MatchBreakdownTooltip>
              ) : (
                <MatchScore score={matchScore} size="sm" />
              ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {city}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="size-3.5" />
              {experienceMin}-{experienceMax} yrs &middot; {employmentType}
            </span>
          </div>
          <SkillBadgeList skills={requiredSkills.slice(0, 6)} />
        </CardContent>
      </Card>
    </Link>
  );
}
