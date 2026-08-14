import { cn } from "@/lib/utils";

export function MatchScore({
  score,
  size = "default",
}: {
  score: number;
  size?: "default" | "sm";
}) {
  const tone =
    score >= 75
      ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
      : score >= 40
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "bg-rose-600/10 text-rose-700 dark:text-rose-400";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-semibold whitespace-nowrap",
        tone,
        size === "sm" ? "text-xs" : "text-sm"
      )}
    >
      {score}% Match
    </span>
  );
}
