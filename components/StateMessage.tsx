import { cn } from "@/lib/utils";
import { AlertTriangle, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function StateMessage({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center",
        className
      )}
    >
      <Icon className="size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export function EmptyState({ title, description, className }: { title: string; description?: string; className?: string }) {
  return <StateMessage icon={Inbox} title={title} description={description} className={className} />;
}

export function ErrorState({ title = "Something went wrong.", description = "Please try again.", className }: { title?: string; description?: string; className?: string }) {
  return <StateMessage icon={AlertTriangle} title={title} description={description} className={className} />;
}
