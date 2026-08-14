"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProfileSelector } from "@/components/ProfileSelector";
import { Network, Info } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/skills", label: "Skills" },
  { href: "/graph", label: "Graph" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 font-heading text-sm font-semibold sm:gap-2 sm:text-base"
        >
          <Network className="size-5 shrink-0 text-primary" />
          <span className="whitespace-nowrap">SkillGraph</span>
        </Link>
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto pr-2 sm:pr-3">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-lg px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-2.5",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 border-l pl-2 sm:pl-3">
          <Link
            href="/about"
            aria-label="About SkillGraph"
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
              pathname.startsWith("/about")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Info className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">About</span>
          </Link>
          <ProfileSelector />
        </div>
      </nav>
    </header>
  );
}
