import { Button } from "@/components/ui/button";

const MAILTO =
  "mailto:hej@nuuvie.com?subject=" +
  encodeURIComponent("Setunia Feedback") +
  "&body=" +
  encodeURIComponent("Hi Nuuvie team,\n\n");

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
      <div className="rounded-3xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Got a suggestion or found a bug? We&apos;d love to hear from you — this
          opens your email app addressed to hej@nuuvie.com.
        </p>
        <Button
          render={<a href={MAILTO} />}
          className="mt-5 h-11 w-full rounded-2xl text-base"
        >
          Send feedback
        </Button>
      </div>
    </div>
  );
}
