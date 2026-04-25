import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile } from '@/lib/dal/hospital'
import { createOpeningAction } from '@/actions/hospital'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export default async function NewOpeningPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const profile = await getHospitalProfile()
  if (!profile?.profile_complete) redirect('/hospital/onboarding')

  // Default dates
  const today = new Date()
  const startDefault = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const endDefault = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="py-8 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New Externship Opening</CardTitle>
          <CardDescription>Post a new externship position for {profile.site_name}</CardDescription>
        </CardHeader>
        <form action={createOpeningAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Position Title</Label>
              <Input id="title" name="title" placeholder="e.g. Morning SPD Extern" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" defaultValue={startDefault} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" defaultValue={endDefault} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <select id="shift" name="shift" className={selectClass} defaultValue="days">
                  <option value="days">Days</option>
                  <option value="evenings">Evenings</option>
                  <option value="nights">Nights</option>
                  <option value="weekends">Weekends</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slots">Slots Available</Label>
                <Input id="slots" name="slots" type="number" min={1} max={10} defaultValue={1} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (one per line)</Label>
              <textarea
                id="requirements"
                name="requirements"
                placeholder={'e.g. Must be enrolled in an accredited SPD program\nCRCST in progress preferred'}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>

          <div className="px-6 pb-6 flex gap-3">
            <Button type="submit" className="flex-1">Post Opening</Button>
            <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
