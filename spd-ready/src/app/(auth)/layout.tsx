import { Logo } from '@/components/brand/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 brand-gradient flex-col justify-between p-10">
        <Logo size="md" variant="light" href="/" />
        <div>
          <blockquote className="text-white/80 text-sm leading-relaxed italic">
            &ldquo;SPD Ready gives us confident placement decisions — we can see exactly where each student stands before day one.&rdquo;
          </blockquote>
          <p className="text-white/50 text-xs mt-3">— SPD Program Coordinator</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '30', label: 'Clinical questions' },
            { value: '6', label: 'Scored categories' },
            { value: '3', label: 'Readiness tiers' },
            { value: '24h', label: 'Retake cooldown' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 rounded-lg p-3 text-center">
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-white/50 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form area */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 py-12">
        <div className="lg:hidden mb-8">
          <Logo size="md" href="/" />
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
