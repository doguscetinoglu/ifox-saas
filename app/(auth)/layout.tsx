export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-primary">iFox</span>
          <span className="text-2xl font-semibold text-muted-foreground"> Social</span>
        </div>
        {children}
      </div>
    </div>
  )
}
