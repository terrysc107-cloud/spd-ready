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
            Request a demo
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
            The competency & survey-readiness layer for sterile processing
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            One standard for<br />
            <span className="text-[oklch(0.75_0.18_190)]">SPD competency.</span>
          </h1>
          <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            Every department trains differently and documents it inconsistently — until survey day.
            SPD Ready standardizes how your staff learn each process, proves they&apos;re competent,
            and keeps a verifiable education record that&apos;s ready the moment a surveyor asks.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-lg bg-white text-primary px-8 py-3.5 text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
            >
              Request a demo
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-white/10 border border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto">
            {[
              { value: '8', label: 'Training domains' },
              { value: '1', label: 'Verifiable record' },
              { value: '4', label: 'Steps to sign-off' },
              { value: '100%', label: 'Survey-ready' },
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
            <h2 className="text-3xl font-bold">SPD training has no standard</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border-2 border-destructive/20 bg-destructive/5 p-6">
              <h3 className="font-bold text-base mb-2">Every department does it differently</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                One tech learns sterilizer controls by shadowing, another from a binder, a third never
                formally at all. Competency is assumed, not measured — and it varies wildly from one
                hospital, shift, and preceptor to the next. The industry has no shared baseline.
              </p>
            </div>
            <div className="rounded-xl border-2 border-[oklch(0.85_0.12_80)] bg-[oklch(0.98_0.03_80)] p-6">
              <h3 className="font-bold text-base mb-2">The record falls apart at survey time</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When a surveyor asks for proof that staff are competent on a process, managers scramble
                through paper checklists, signatures, and inboxes. Education is out of date, observations
                are missing, and a strong department looks unprepared on the day it matters most.
              </p>
            </div>
          </div>
          <div className="mt-8 rounded-xl border-2 border-[oklch(0.75_0.12_150)] bg-[oklch(0.96_0.04_150)] p-6 text-center">
            <p className="font-bold text-[oklch(0.35_0.15_150)]">
              SPD Ready makes training consistent and competency verifiable — one standard process, one record, survey-ready every day.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">The Loop</p>
            <h2 className="text-3xl font-bold">Assign. Train. Validate. Prove.</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              A single standardized loop that turns everyday training into a defensible competency record.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Manager assigns',
                body: 'Assign a competency — sterilizer controls, PPE placement, reading a count sheet, decontam workflow — to a tech or a whole department from a standardized template library.',
                color: 'border-primary/30 bg-primary/5',
              },
              {
                step: '02',
                title: 'Tech trains',
                body: 'Staff work through the process using the readiness-score model. As they learn, the app shows how confident and competent they are and retrains the gaps until it sticks.',
                color: 'border-[oklch(0.62_0.18_200)]/30 bg-[oklch(0.62_0.18_200)]/5',
              },
              {
                step: '03',
                title: 'Record auto-updates',
                body: 'Mastery feeds the competency record automatically. Staff education stays current without anyone re-keying a checklist — the evidence builds itself as people learn.',
                color: 'border-[oklch(0.64_0.18_150)]/30 bg-[oklch(0.64_0.18_150)]/5',
              },
              {
                step: '04',
                title: 'Manager validates',
                body: 'Pre-filled from the training data, the manager confirms or observes against an audit and signs off. The result is a verifiable, dated competency record — survey-ready.',
                color: 'border-[oklch(0.55_0.18_150)]/30 bg-[oklch(0.55_0.18_150)]/5',
              },
            ].map(({ step, title, body, color }) => (
              <div key={step} className={`rounded-xl border-2 p-6 ${color} relative`}>
                <span className="absolute top-4 right-4 text-xs font-bold text-muted-foreground/40">{step}</span>
                <h3 className="font-bold text-base mb-2 pr-6">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Readiness Score engine ────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">The Engine</p>
            <h2 className="text-3xl font-bold">Competency you can measure, not assume</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              Behind every competency is the SPD Ready readiness-score model — the same defensible framework,
              applied to your staff and your processes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Readiness Score */}
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
              <div>
                <p className="font-bold">Readiness Score</p>
                <p className="text-xs text-muted-foreground">6 weighted competency dimensions</p>
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
                A transparent, weighted formula built around real SPD outcomes — so &quot;competent&quot; means the same thing on every shift.
              </p>
            </div>

            {/* What it produces */}
            <div className="rounded-xl border-2 border-[oklch(0.62_0.18_200)]/30 bg-[oklch(0.62_0.18_200)]/5 p-6 space-y-4">
              <div>
                <p className="font-bold">What the manager gets</p>
                <p className="text-xs text-muted-foreground">From the same loop, automatically</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Confidence + mastery', desc: 'See exactly where each tech is competent and where they need retraining' },
                  { label: 'Auto-updated education', desc: 'Staff records stay current as people train — no manual re-entry' },
                  { label: 'Assign or verify', desc: 'Push a competency to a person or department, or sign off against an audit' },
                  { label: 'Survey-ready evidence', desc: 'A dated, exportable record of who is competent on what, and when' },
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
                Consistent training in, a defensible record out. That standard is what the industry is missing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── For Managers ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">For Managers &amp; Directors</p>
            <h2 className="text-3xl font-bold">Walk into survey day already prepared</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              Oversee competency across your whole department from one screen — who&apos;s validated, who&apos;s in training, and what needs your sign-off.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                {
                  title: 'Department readiness at a glance',
                  body: 'A single overview shows how much of your staff is validated, in training, or overdue — with the items waiting on your sign-off surfaced first.',
                },
                {
                  title: 'Assign to a person or the whole team',
                  body: 'Push a standardized competency template to one tech or your entire department in seconds. Training stays consistent no matter who the preceptor is.',
                },
                {
                  title: 'Validate, pre-filled from training',
                  body: 'Sign-offs come pre-populated from the tech’s training data, so you confirm or observe against an audit instead of starting from a blank checklist.',
                },
                {
                  title: 'Survey-ready evidence on demand',
                  body: 'Export a dated competency packet — who is competent on what, validated by whom, by what method — the moment a surveyor asks. No scramble.',
                },
              ].map(({ title, body }) => (
                <div key={title} className="flex gap-4">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="font-bold text-sm mb-1">{title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mock readiness card */}
            <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm space-y-5 self-start">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Department Readiness</p>
                  <p className="font-bold text-lg mt-1">Sterile Processing · Day Shift</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[oklch(0.45_0.18_150)]">86%</p>
                  <span className="inline-block text-xs font-bold text-[oklch(0.45_0.18_150)] bg-[oklch(0.96_0.04_150)] px-2 py-0.5 rounded-full">Validated</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Sterilizer Controls', score: 92 },
                  { label: 'Decontam Workflow', score: 88 },
                  { label: 'PPE Placement', score: 78 },
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
                  <p className="text-xs text-muted-foreground">Needs your sign-off</p>
                  <p className="font-bold text-[oklch(0.55_0.18_80)]">3 ready to validate</p>
                </div>
                <div className="flex gap-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">12 staff</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/register"
              className="inline-block rounded-lg bg-primary text-primary-foreground px-8 py-3.5 text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              See the manager dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* ── For Techs ────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">For Technicians</p>
            <h2 className="text-3xl font-bold">Learn the process. Prove you know it.</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              The same externship-style learning model, now built into your day-to-day — so every competency you earn is recorded and counts.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '🎯',
                title: 'Real process training',
                body: 'Review sterilizer controls, read count sheets, learn proper PPE placement, and work the decontam-to-assembly flow — the actual processes you run every shift.',
              },
              {
                icon: '⚡',
                title: 'Confidence you can see',
                body: 'As you train, the app shows how confident and competent you are on each process and retrains the spots that aren’t solid yet.',
              },
              {
                icon: '🔥',
                title: 'Consistent & verifiable',
                body: 'Everyone learns the same standard the same way — so your competency means the same thing whether you’re new or a 10-year tech.',
              },
              {
                icon: '📈',
                title: 'Mastery feeds your record',
                body: 'Every domain you master flows straight into your competency record. No re-taking the same checklist — your training is the evidence.',
              },
              {
                icon: '🏅',
                title: 'Education stays current',
                body: 'Your staff education updates automatically as you train, so you’re never the one missing a sign-off when survey day comes.',
              },
              {
                icon: '✅',
                title: 'Manager validation',
                body: 'When you’re ready, your manager validates against an audit and signs off — a dated, verifiable record that follows your career.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-xl border-2 border-border bg-card p-5 space-y-2">
                <p className="text-2xl">{icon}</p>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competency status explainer ──────────────────────────── */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Competency Status</p>
            <h2 className="text-3xl font-bold">Clear status. No guesswork.</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              Every competency has one unambiguous state — so managers know what to act on and techs know what to work toward.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                tier: 'Validated',
                label: 'Signed off & survey-ready',
                desc: 'The manager has confirmed competency against the standard. A dated, verifiable record is on file and counts toward department readiness.',
                cls: 'tier-1-bg',
                dot: 'bg-[oklch(0.55_0.18_150)]',
                textCls: 'tier-1',
              },
              {
                tier: 'In Training',
                label: 'Building competency',
                desc: 'The tech is actively working through the process. Mastery and confidence are climbing and feeding the record — not yet ready for sign-off.',
                cls: 'tier-2-bg',
                dot: 'bg-[oklch(0.65_0.18_80)]',
                textCls: 'tier-2',
              },
              {
                tier: 'Needs Attention',
                label: 'Assigned or overdue',
                desc: 'Assigned but not yet started, or past its due date. Surfaces at the top of the manager overview so nothing slips before survey day.',
                cls: 'tier-3-bg',
                dot: 'bg-[oklch(0.577_0.245_27.325)]',
                textCls: 'tier-3',
              },
            ].map(({ tier, label, desc, cls, dot, textCls }) => (
              <div key={tier} className={`rounded-xl border-2 px-6 py-5 ${cls} flex gap-5 items-start`}>
                <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm ${textCls}`}>{tier}</p>
                      <span className="text-xs text-muted-foreground font-medium">— {label}</span>
                    </div>
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
            Give your department<br />one competency standard.
          </h2>
          <p className="text-white/70 mt-4 text-base max-w-lg mx-auto leading-relaxed">
            Standardized training, measurable competency, and a verifiable record that&apos;s ready every day —
            not just survey day. SPD Ready is the readiness layer your department has been missing.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-lg bg-white text-primary px-8 py-3.5 text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
            >
              Request a demo
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-8 text-xs text-white/40">
            Part of the SPD Ready suite — competency, training, and survey readiness for sterile processing.
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
