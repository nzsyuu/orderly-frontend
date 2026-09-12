export function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-5">
      {children}
    </div>
  );
}
