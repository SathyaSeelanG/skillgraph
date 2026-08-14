"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveDeveloperId } from "@/lib/useActiveDeveloper";
import { PRIMARY_DEVELOPER_ID } from "@/lib/types";
import { UserPlus } from "lucide-react";

interface DeveloperOption {
  id: string;
  name: string;
}

export function ProfileSelector() {
  const [activeId, setActiveId] = useActiveDeveloperId();
  const [developers, setDevelopers] = useState<DeveloperOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/developers");
        const data = await res.json();
        if (!cancelled && res.ok) {
          setDevelopers(data.developers ?? []);
        }
      } catch {
        // profile selector is a convenience overlay; ignore failures silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  if (loading) return null;

  const activeExists = developers.some((d) => d.id === activeId);
  const value = activeExists ? activeId : PRIMARY_DEVELOPER_ID;

  if (developers.length === 0) {
    return (
      <Link
        href="/profile/new"
        className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:px-2.5"
      >
        <UserPlus className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">New Profile</span>
      </Link>
    );
  }

  const items = Object.fromEntries(developers.map((d) => [d.id, d.name]));

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Select items={items} value={value} onValueChange={(v) => v && setActiveId(v)}>
        <SelectTrigger className="h-8 w-28 shrink-0 text-xs sm:w-40 sm:text-sm" aria-label="Active profile">
          <SelectValue placeholder="Profile" />
        </SelectTrigger>
        <SelectContent>
          {developers.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link
        href="/profile/new"
        aria-label="Create new profile"
        className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <UserPlus className="size-3.5 shrink-0" />
      </Link>
    </div>
  );
}
