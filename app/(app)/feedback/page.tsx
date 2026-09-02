import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MAILTO =
  "mailto:hej@nuuvie.com?subject=" +
  encodeURIComponent("Setunia Feedback") +
  "&body=" +
  encodeURIComponent("Hi Nuuvie team,\n\n");

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Got a suggestion or found a bug?</CardTitle>
          <CardDescription>
            We&apos;d love to hear from you — this opens your email app addressed to
            hej@nuuvie.com.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<a href={MAILTO} />}>Send feedback</Button>
        </CardContent>
      </Card>
    </div>
  );
}
