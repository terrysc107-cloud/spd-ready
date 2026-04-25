import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="brand-gradient text-white py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-medium text-white/80 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.62_0.18_200)] animate-pulse" />
            Built for sterile processing students and the hospitals that hire them
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            The placement gap<br />
            <span className="text-[oklch(0.75_0.18_190)]">ends here.</span>
          </h1>
          <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            SPD Ready verifies student readiness before they walk into a department.
            Students earn a scored credential through real study. Hospitals see a ranked,
            trusted candidate pipeline — not just a resume.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=student"
              className="rounded-lg bg-white text-primary px-8 py-3.5 text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
            >
              I&apos;m a Student
            </Link>
            <Link
              href="/register?role=hospital"
              className="rounded-lg bg-white/10 border border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              I&apos;m a Hospital Coordinator
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto">
            {[
              { value: '8', label: 'Study domains' },
              { value: '2', label: 'Verified scores' },
              { value: '3', label: 'Readiness tiers' },
              { value: '6', label: 'Scored dimensions' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/60 mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">The Problem</p>
            <h2 className="text-3xl font-bold">A broken pipeline on both sides</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-6">
              <p className="text-2xl mb-3">🏥</p>
              <h3 className="font-bold text-base mb-2">Hospitals are hesitant</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Departments are short-staffed and can&apos;t afford to babysit unprepared externs.
                There&apos;s no standard way to know if a student is actually ready — so many sites
                stop taking interns altogether. The pipeline dries up.
              </p>
            </div>
            <div className="rounded-xl border-2 border-[oklch(0.85_0.12_80)] bg-[oklch(0.98_0.03_80)] p-6">
              <p className="text-2xl mb-3">🎓</p>
              <h3 className="font-bold text-base mb-2">Students can&apos;t get placed</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Students finish programs with knowledge but no verified credential a hospital
                trusts. They can&apos;t prove readiness. Coordinators can&apos;t take the risk.
                Good students fall through the cracks.
              </p>
            </div>
          </div>
          <div className="mt-8 rounded-xl border-2 border-[oklch(0.75_0.12_150)] bg-[oklch(0.96_0.04_150)] p-6 text-center">
            <p className="font-bold text-[oklch(0.35_0.15_150)]">
              SPD Ready fixes both sides at once — verified readiness profiles for students, a trusted candidate pipeline for hospitals.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">The Platform</p>
            <h2 className="text-3xl font-bold">Study. Score. Get placed.</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              Three steps — for the student and the hospital on the other side.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '📚',
                title: 'Study across 8 domains',
                body: 'Students work through technical domains — decontamination, sterilization, instrument ID, sterility assurance, and more — plus a dedicated Judgment & Professional Standards track. Instant feedback after every answer. XP, streaks, and mastery badges keep them engaged.',
                color: 'border-[oklch(0.62_0.18_200)]/30 bg-[oklch(0.62_0.18_200)]/5',
              },
              {
                step: '02',
                icon: '📊',
                title: 'Earn two verified scores',
                body: 'The readiness assessment scores students across six weighted dimensions and issues an overall readiness score. The Judgment track adds a separate Judgment Readiness Score — measuring how students think under pressure, not just what they know.',
                color: 'border-primary/30 bg-primary/5',
              },
              {
                step: '03',
                icon: '🏥',
                title: 'Connect with hospitals',
                body: 'Tier 1 students surface automatically in the coordinator\'s candidate pipeline, ranked by score with full readiness breakdowns. Coordinators see both scores side by side — technical readiness and professional judgment — before making any placement decision.',
                color: 'border-[oklch(0.64_0.18_150)]/30 bg-[oklch(0.64_0.18_150)]/5',
              },
            ].map(({ step, icon, title, body, color }) => (
              <div key={step} className={`rounded-xl border-2 p-6 ${color} relative`}>
                <span className="absolute top-4 right-4 text-xs font-bold text-muted-foreground/40">{step}</span>
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dual Score System ─────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Scoring</p>
            <h2 className="text-3xl font-bold">Two scores. A complete picture.</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              Technical knowledge is table stakes. Professional judgment is what separates a safe
              technician from a liability. SPD Ready measures both.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Readiness Score */}
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-bold">Readiness Score</p>
                  <p className="text-xs text-muted-foreground">6 weighted dimensions</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Technical Knowledge', weight: '30%' },
                  { label: 'Situational Judgment', weight: '25%' },
                  { label: 'Process Discipline', weight: '15%' },
                  { label: 'Behavioral Fit', weight: '15%' },
                  { label: 'Instrument Familiarity', weight: '10%' },
                  { label: 'Reliability', weight: '5%' },
                ].map(({ label, weight }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-bold text-primary">{weight}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground border-t pt-3">
                Weighted formula built around SPD extern placement outcomes. Defensible, transparent, and specific to this field.
              </p>
            </div>

            {/* Judgment Score */}
            <div className="rounded-xl border-2 border-[oklch(0.62_0.18_200)]/30 bg-[oklch(0.62_0.18_200)]/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="font-bold">Judgment Readiness Score</p>
                  <p className="text-xs text-muted-foreground">8 professional judgment categories</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Moral Standard', desc: 'Does the right thing under pressure' },
                  { label: 'Safety Ownership', desc: 'Corrects risks without being told' },
                  { label: 'Escalation', desc: 'Knows when and how to speak up' },
                  { label: 'Accountability', desc: 'Owns mistakes and communicates early' },
                  { label: 'Critical Thinking', desc: 'Connects patterns to root cause' },
                  { label: 'Professionalism', desc: 'Stays composed and communicates well' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-2 text-sm">
                    <span className="text-[oklch(0.42_0.15_200)] font-bold shrink-0">·</span>
                    <div>
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground"> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground border-t pt-3">
                A student can score 90% technical and 50% judgment. That signal only exists here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── For Students ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">For Students</p>
            <h2 className="text-3xl font-bold">Study smarter. Get placed faster.</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              Your readiness profile is your credential. The more you study, the stronger it gets — and hospitals can see every bit of it.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '🎯',
                title: '8 study domains',
                body: '7 technical domains covering every core SPD function, plus a Judgment & Professional Standards track with advanced scenario questions.',
              },
              {
                icon: '⚡',
                title: 'Instant feedback',
                body: 'Every answer shows why it\'s right or wrong with a real-world explanation. You learn the standard, not just the answer.',
              },
              {
                icon: '🔥',
                title: 'Streaks & XP',
                body: 'Daily study streaks, experience points, and domain mastery badges keep you sharp and motivated — because getting placed requires being genuinely ready.',
              },
              {
                icon: '📈',
                title: 'Track your progress',
                body: 'See your best score per domain, your readiness tier, and exactly how many points stand between you and Tier 1.',
              },
              {
                icon: '🧠',
                title: 'Judgment track',
                body: 'Scenario-based questions test how you respond under pressure — missed instruments, supervisor pressure, falsified records. The situations that reveal character.',
              },
              {
                icon: '🏥',
                title: 'Visible to coordinators',
                body: 'Once you hit Tier 1, your scored profile surfaces automatically in the hospital candidate pipeline. Your work does the talking.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-xl border-2 border-border bg-card p-5 space-y-2">
                <p className="text-2xl">{icon}</p>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/register?role=student"
              className="inline-block rounded-lg bg-primary text-primary-foreground px-8 py-3.5 text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Start building your readiness profile →
            </Link>
          </div>
        </div>
      </section>

      {/* ── For Hospitals ────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">For Hospital Coordinators</p>
            <h2 className="text-3xl font-bold">Stop guessing. Start placing.</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              Every candidate in your pipeline has been scored, ranked, and verified. No cold resumes. No surprises on day one.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                {
                  icon: '📊',
                  title: 'Ranked candidate pipeline',
                  body: 'Tier 1 students surface automatically, sorted by readiness score. See technical knowledge and judgment readiness side by side before you commit to a placement.',
                },
                {
                  icon: '🧠',
                  title: 'Judgment score as a signal',
                  body: 'A student who scores 90% technical and 55% judgment tells you something a resume never could. You see the full picture — who knows the work, and who can be trusted to act safely when no one is watching.',
                },
                {
                  icon: '📋',
                  title: 'Full readiness breakdown',
                  body: 'Every candidate profile shows all six scored dimensions, strengths, growth areas, shift availability, location, transportation, and environment preference. One screen. Every decision input.',
                },
                {
                  icon: '🔄',
                  title: 'A consistent pipeline',
                  body: 'Students are always studying, always improving. When one cohort gets placed, the next is already building their scores. The pipeline never runs dry.',
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p className="font-bold text-sm mb-1">{title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mock candidate card */}
            <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm space-y-5 self-start">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sample Candidate</p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">Jordan M.</p>
                  <p className="text-sm text-muted-foreground">Chicago, IL · SPD Certification Program</p>
                  <span className="inline-block mt-2 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Cert in progress</span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[oklch(0.45_0.18_150)]">84%</p>
                  <span className="inline-block text-xs font-bold text-[oklch(0.45_0.18_150)] bg-[oklch(0.96_0.04_150)] px-2 py-0.5 rounded-full">Tier 1 — Ready</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Technical Knowledge', score: 88 },
                  { label: 'Situational Judgment', score: 85 },
                  { label: 'Process Discipline', score: 80 },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-[oklch(0.55_0.18_150)]" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">🧠 Judgment Score</p>
                  <p className="font-bold text-[oklch(0.45_0.18_150)]">79%</p>
                </div>
                <div className="flex gap-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Days</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Evenings</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/register?role=hospital"
              className="inline-block rounded-lg bg-primary text-primary-foreground px-8 py-3.5 text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Access the candidate pipeline →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tier Explainer ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Placement Tiers</p>
            <h2 className="text-3xl font-bold">Three tiers. Clear decisions.</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              Every student gets a tier. Coordinators know exactly who to call. Students know exactly what to work toward.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                tier: 'Tier 1',
                label: 'Placement Ready',
                score: '75%+',
                desc: 'Immediately visible in the hospital candidate pipeline. Eligible to apply to all open externship positions. The goal every student is working toward.',
                cls: 'tier-1-bg',
                dot: 'bg-[oklch(0.55_0.18_150)]',
                textCls: 'tier-1',
              },
              {
                tier: 'Tier 2',
                label: 'Ready with Support',
                score: '55–74%',
                desc: 'Strong foundational knowledge with targeted growth areas. Eligible for mentorship placements. Improvement tracks unlock automatically to close the gap to Tier 1.',
                cls: 'tier-2-bg',
                dot: 'bg-[oklch(0.65_0.18_80)]',
                textCls: 'tier-2',
              },
              {
                tier: 'Tier 3',
                label: 'Developing Readiness',
                score: 'Below 55%',
                desc: 'Not yet eligible for placement. Receives a focused study plan across weak domains. Study tracks, streaks, and judgment scenarios build the foundation back up.',
                cls: 'tier-3-bg',
                dot: 'bg-[oklch(0.577_0.245_27.325)]',
                textCls: 'tier-3',
              },
            ].map(({ tier, label, score, desc, cls, dot, textCls }) => (
              <div key={tier} className={`rounded-xl border-2 px-6 py-5 ${cls} flex gap-5 items-start`}>
                <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm ${textCls}`}>{tier}</p>
                      <span className="text-xs text-muted-foreground font-medium">— {label}</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground bg-white/60 px-2 py-0.5 rounded-full">{score}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OhioHealth-validated framework (D-42) ─────────────────── */}
      <section id="ohiohealth-validated" className="px-6 py-20 bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-3">
            <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              OhioHealth-validated framework
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">Built on the only published SPD training methodology with measured ROI</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our 6+1 domain framework, Likert self-assessment design, and mastery scoring are derived from the
              OhioHealth/SpecialtyCare 2024-2025 case study — the same playbook hospitals use to close their
              readiness gap.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <OHStat headline="+41 pp" subtitle="Knowledge gain" detail="Average T0 → T1 increase across the trained cohort" />
            <OHStat headline="+29 pp" subtitle="Confidence gain" detail="Self-rated confidence in domain-specific judgment" />
            <OHStat headline="40%" subtitle="Error reduction" detail="Drop in tracked SPD error events at fully-trained sites" />
            <OHStat headline="$500k" subtitle="Saved per SPD / year" detail="Projected operating savings for a single department" />
          </div>

          <p className="text-xs text-muted-foreground italic text-center max-w-3xl mx-auto">
            Source: OhioHealth/SpecialtyCare SPD training case study (2024-2025). Numbers cited reflect the published
            cohort outcomes; SPD Ready uses the same framework, scoring, and measurement design.
          </p>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────── */}
      <section className="brand-gradient py-24 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold leading-tight">
            The SPD workforce<br />deserves a better pipeline.
          </h2>
          <p className="text-white/70 mt-4 text-base max-w-lg mx-auto leading-relaxed">
            Students who are ready deserve to be placed. Hospitals that need staff deserve candidates
            they can trust. SPD Ready connects both — with verified scores, not just good intentions.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=student"
              className="rounded-lg bg-white text-primary px-8 py-3.5 text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
            >
              Start as a Student
            </Link>
            <Link
              href="/register?role=hospital"
              className="rounded-lg border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Hospital / Site Access
            </Link>
          </div>
          <p className="mt-8 text-xs text-white/40">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-white/70">Sign in</Link>
          </p>
        </div>
      </section>

    </main>
  )
}

function OHStat({ headline, subtitle, detail }: { headline: string; subtitle: string; detail: string }) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-5 text-center">
      <p className="text-3xl font-bold tabular-nums text-primary">{headline}</p>
      <p className="text-sm font-semibold mt-1">{subtitle}</p>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{detail}</p>
    </div>
  )
}
