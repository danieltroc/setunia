export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Setunia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your lifts. Remember your best.
        </p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
