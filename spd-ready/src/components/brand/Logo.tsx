import Link from 'next/link'

type LogoProps = {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light'
}

export function Logo({ href = '/', size = 'md', variant = 'dark' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-base' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-3xl' },
  }
  const { icon, text } = sizes[size]
  const textColor = variant === 'light' ? 'text-white' : 'text-[oklch(0.22_0.07_225)]'
  const subColor = variant === 'light' ? 'text-white/70' : 'text-[oklch(0.52_0.16_205)]'

  const inner = (
    <div className="flex items-center gap-2.5">
      {/* Shield icon */}
      <svg width={icon} height={icon} viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 2L37 8.5V21C37 30.5 20 42 20 42C20 42 3 30.5 3 21V8.5L20 2Z"
          fill="oklch(0.32 0.09 222)"
        />
        <path
          d="M20 2L37 8.5V21C37 30.5 20 42 20 42C20 42 3 30.5 3 21V8.5L20 2Z"
          fill="url(#shieldGrad)"
          opacity="0.6"
        />
        <polyline
          points="12,22 17.5,28.5 28.5,15"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <defs>
          <linearGradient id="shieldGrad" x1="3" y1="2" x2="37" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="oklch(0.62 0.18 200)" />
            <stop offset="100%" stopColor="oklch(0.32 0.09 222)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-tight ${text} ${textColor}`}>
          SPD<span className={subColor}> Ready</span>
        </span>
        {size !== 'sm' && (
          <span className={`text-[10px] tracking-widest uppercase mt-0.5 ${variant === 'light' ? 'text-white/50' : 'text-[oklch(0.55_0.08_220)]'}`}>
            Readiness Platform
          </span>
        )}
      </div>
    </div>
  )

  if (href) return <Link href={href}>{inner}</Link>
  return inner
}
