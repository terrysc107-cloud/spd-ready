import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getApplicationForCandidate, getFeedbackForApplication } from '@/lib/dal/hospital'
import { submitFeedbackAction } from '@/actions/hospital'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

const RATING_DIMENSIONS = [
  { name: 'attendance_score', label: 'Attendance & Punctuality' },
  { name: 'coachability_score', label: 'Coachability' },
  { name: 'professionalism_score', label: 'Professionalism' },
  { name: 'communication_score', label: 'Communication' },
  { name: 'quality_score', label: 'Attention to Detail / Quality' },
]

function RatingRow({ name, label }: { name: string; label: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex gap-3 items-center">
        {[1, 2, 3, 4, 5].map(v => (
          <label key={v} className="flex flex-col items-center gap-1 cursor-pointer">
            <input type="radio" name={name} value={String(v)} defaultChecked={v === 3} className="accent-primary" />
            <span className="text-xs text-muted-foreground">{v}</span>
          </label>
        ))}
        <span className="text-xs text-muted-foreground ml-2">(1 = poor, 5 = excellent)</span>
      </div>
    </div>
  )
}

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string; appId: string }>
}) {
  const { id: openingId, appId } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const data = await getApplicationForCandidate(appId)
  if (!data) notFound()

  const { application, opening, student } = data
  if (!student || !opening || opening.hospital_user_id !== user.id) notFound()

  if (application.status !== 'accepted') {
    redirect(`/hospital/openings/${openingId}/candidates/${appId}`)
  }

  const existing = await getFeedbackForApplication(appId)
  const backHref = `/hospital/openings/${openingId}/candidates/${appId}`

  return (
    <div className="py-8 max-w-xl mx-auto space-y-6">
      <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to {student.first_name} {student.last_name}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Post-Placement Feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {student.first_name} {student.last_name} · {opening.title}
        </p>
      </div>

      {existing ? (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Already Submitted</CardTitle>
            <CardDescription>You submitted feedback for this placement on {new Date(existing.created_at).toLocaleDateString()}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {RATING_DIMENSIONS.map(d => (
              <div key={d.name} className="flex justify-between">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium">{existing[d.name as keyof typeof existing]} / 5</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Would recommend</span>
              <span className="font-medium">{existing.recommended ? 'Yes' : 'No'}</span>
            </div>
            {existing.notes && (
              <div className="rounded-md bg-muted/50 px-3 py-2 text-muted-foreground">{existing.notes}</div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Rate This Extern</CardTitle>
            <CardDescription>All ratings are 1–5. This feedback is stored privately and used to improve placement quality.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitFeedbackAction} className="space-y-6">
              <input type="hidden" name="app_id" value={appId} />
              <input type="hidden" name="opening_id" value={openingId} />

              {RATING_DIMENSIONS.map(d => (
                <RatingRow key={d.name} name={d.name} label={d.label} />
              ))}

              <div className="space-y-1.5">
                <Label>Overall recommendation</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="recommended" value="true" defaultChecked className="accent-primary" />
                    Yes — would take this student again
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="recommended" value="false" className="accent-primary" />
                    No
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Additional notes (optional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Anything else the program coordinator should know..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <Button type="submit" className="w-full">Submit Feedback</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
