export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-16">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div className="relative mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Setunia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track your lifts. Remember your best.
        </p>
      </div>
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
