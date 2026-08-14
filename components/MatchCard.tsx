import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MatchScore } from "@/components/MatchScore";
import { MatchBreakdownTooltip } from "@/components/MatchBreakdown";

export function MatchCard({
  jobId,
  title,
  company,
  matchingSkills,
  requiredSkills,
  matchingSkillNames,
  requiredSkillNames,
  matchScore,
}: {
  jobId: string;
  title: string;
  company: string;
  matchingSkills: number;
  requiredSkills: number;
  matchingSkillNames?: string[];
  requiredSkillNames?: string[];
  matchScore: number;
}) {
  return (
    <Link href={`/jobs/${jobId}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{company}</CardDescription>
            </div>
            {requiredSkillNames ? (
              <MatchBreakdownTooltip
                matchScore={matchScore}
                requiredSkills={requiredSkillNames}
                developerSkills={matchingSkillNames ?? []}
              >
                <MatchScore score={matchScore} size="sm" />
              </MatchBreakdownTooltip>
            ) : (
              <MatchScore score={matchScore} size="sm" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {matchingSkills} of {requiredSkills} required skills matched
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
