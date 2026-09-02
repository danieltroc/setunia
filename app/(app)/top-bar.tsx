import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopBar({
  displayName,
  avatarUrl,
}: {
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const initial = (displayName ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          Setunia
        </Link>
        <Link href="/profile">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? ""} />
            <AvatarFallback className="bg-muted text-sm">{initial}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
