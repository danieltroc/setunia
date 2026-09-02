import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "./logout-button";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/exercises", label: "Exercises" },
  { href: "/profile", label: "Profile" },
  { href: "/feedback", label: "Feedback" },
];

export function Nav({
  displayName,
  avatarUrl,
}: {
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const initial = (displayName ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight">
            Setunia
          </Link>
          <nav className="hidden gap-4 text-sm text-muted-foreground sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? ""} />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </Link>
          <LogoutButton />
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t px-4 py-2 text-sm text-muted-foreground sm:hidden">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
