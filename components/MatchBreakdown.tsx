import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function computeMatchBreakdown(requiredSkills: string[], developerSkills: string[]) {
  const developerSkillSet = new Set(developerSkills);
  const matchingSkills = requiredSkills.filter((s) => developerSkillSet.has(s));
  const missingSkills = requiredSkills.filter((s) => !developerSkillSet.has(s));
  return { matchingSkills, missingSkills };
}

export function MatchBreakdownTooltip({
  matchScore,
  requiredSkills,
  developerSkills,
  children,
}: {
  matchScore: number;
  requiredSkills: string[];
  developerSkills: string[];
  children: React.ReactNode;
}) {
  const { matchingSkills, missingSkills } = computeMatchBreakdown(requiredSkills, developerSkills);

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{children}</TooltipTrigger>
      <TooltipContent className="block max-w-[260px] space-y-1.5 text-left">
        <p className="font-semibold text-background">
          {matchScore}% match &mdash; {matchingSkills.length} of {requiredSkills.length} skills
        </p>
        {matchingSkills.length > 0 && (
          <p>
            <span className="text-emerald-400">Have: </span>
            <span className="text-background/90">{matchingSkills.join(", ")}</span>
          </p>
        )}
        {missingSkills.length > 0 && (
          <p>
            <span className="text-rose-400">Missing: </span>
            <span className="text-background/90">{missingSkills.join(", ")}</span>
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
