import { Logo } from '@/components/brand/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 brand-gradient flex-col justify-between p-10">
        <Logo size="md" variant="light" href="/" />
        <div>
          <blockquote className="text-white/80 text-sm leading-relaxed italic">
            &ldquo;SPD Ready gives us one standard for competency — we walk into survey day already knowing every tech is validated.&rdquo;
          </blockquote>
          <p className="text-white/50 text-xs mt-3">— SPD Manager</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '8', label: 'Training domains' },
            { value: '1', label: 'Verifiable record' },
            { value: '4', label: 'Steps to sign-off' },
            { value: '100%', label: 'Survey-ready' },
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
