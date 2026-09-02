import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "./nav";

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
      <Nav
        displayName={profile?.display_name ?? user.email ?? null}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
