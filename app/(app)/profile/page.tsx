import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { ProfileForm } from "./profile-form";
import { LogoutButton } from "../logout-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()) as { data: Profile | null };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      <div className="rounded-3xl border border-border bg-card p-5">
        <ProfileForm
          profile={
            profile ?? {
              id: user!.id,
              display_name: null,
              avatar_url: null,
              created_at: new Date().toISOString(),
            }
          }
          email={user!.email ?? ""}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/feedback"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors active:bg-secondary"
        >
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Send feedback</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
