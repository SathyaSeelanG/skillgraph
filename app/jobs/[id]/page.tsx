import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkillBadgeList } from "@/components/SkillBadge";
import { ErrorState } from "@/components/StateMessage";
import { JobMatchPanel } from "@/components/JobMatchPanel";
import { apiFetch, ApiError } from "@/lib/api";
import { type JobDetail, type RelatedJob } from "@/lib/types";
import { Briefcase, MapPin, Wallet, ArrowLeft } from "lucide-react";

export default async function JobDetailPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;

  let job: JobDetail | null = null;
  let relatedJobs: RelatedJob[] = [];
  let error: string | null = null;
  let notFound = false;

  try {
    const jobRes = await apiFetch<{ job: JobDetail; relatedJobs: RelatedJob[] }>(`/api/jobs/${id}`);
    job = jobRes.job;
    relatedJobs = jobRes.relatedJobs;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound = true;
    } else {
      error = err instanceof ApiError ? err.message : "We couldn't load this job. Please try again.";
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorState title="Job not found." description="This job may have been removed." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorState title="We couldn't load this job." description={error ?? undefined} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to jobs
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <CardDescription>{job.companyName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-4" />
              {job.city}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="size-4" />
              {job.experienceMin}-{job.experienceMax} yrs &middot; {job.employmentType}
            </span>
            {(job.salaryMin > 0 || job.salaryMax > 0) && (
              <span className="flex items-center gap-1">
                <Wallet className="size-4" />
                &#8377;{job.salaryMin.toLocaleString()} - &#8377;{job.salaryMax.toLocaleString()}
              </span>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground">{job.description}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Required Skills</p>
            <SkillBadgeList skills={job.requiredSkills} />
          </div>
        </CardContent>
      </Card>

      <JobMatchPanel jobId={job.id} jobTitle={job.title} requiredSkills={job.requiredSkills} />

      {relatedJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Similar Jobs</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedJobs.map((rel) => (
              <Link key={rel.jobId} href={`/jobs/${rel.jobId}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-sm">{rel.title}</CardTitle>
                    <CardDescription>{rel.companyName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {rel.sharedSkills} shared skill{rel.sharedSkills === 1 ? "" : "s"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
