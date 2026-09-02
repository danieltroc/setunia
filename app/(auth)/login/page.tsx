import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold tracking-tight">Log in</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back. Log in with your email to keep tracking your lifts.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
