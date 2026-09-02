import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "./top-bar";
import { TabBar } from "./tab-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <TopBar
        displayName={profile?.display_name ?? user.email ?? null}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pt-6 pb-28">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
