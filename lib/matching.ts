export function calculateMatchScore(matchingSkills: number, requiredSkills: number): number {
  if (requiredSkills === 0) return 0;
  return Math.round((matchingSkills / requiredSkills) * 100);
}
