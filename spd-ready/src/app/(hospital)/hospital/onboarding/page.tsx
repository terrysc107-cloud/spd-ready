import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/dal/auth'
import { getHospitalProfile } from '@/lib/dal/hospital'
import { upsertHospitalProfileAction } from '@/actions/hospital'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export default async function HospitalOnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const existing = await getHospitalProfile()
  const d = existing ?? null

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Site Profile</CardTitle>
          <CardDescription>
            Tell us about your facility so we can match you with the right candidates.
          </CardDescription>
        </CardHeader>
        <form action={upsertHospitalProfileAction}>
          <CardContent className="space-y-6">

            {/* Organization */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Organization</h3>
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization Name</Label>
                <Input id="organization_name" name="organization_name" defaultValue={d?.organization_name ?? ''} placeholder="e.g. Regional Health System" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site_name">Site / Campus Name</Label>
                <Input id="site_name" name="site_name" defaultValue={d?.site_name ?? ''} placeholder="e.g. Downtown Medical Center" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={d?.city ?? ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <select id="state" name="state" defaultValue={d?.state ?? ''} className={selectClass} required>
                    <option value="">Select state</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Department</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facility_type">Facility Type</Label>
                  <select id="facility_type" name="facility_type" defaultValue={d?.facility_type ?? 'acute_care'} className={selectClass}>
                    <option value="acute_care">Acute Care / Hospital</option>
                    <option value="ambulatory">Ambulatory / Outpatient</option>
                    <option value="long_term">Long-Term Care</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept_size">Department Size</Label>
                  <select id="dept_size" name="dept_size" defaultValue={d?.dept_size ?? 'medium'} className={selectClass}>
                    <option value="small">Small (1–5 staff)</option>
                    <option value="medium">Medium (6–15 staff)</option>
                    <option value="large">Large (16+ staff)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case_volume">Case Volume</Label>
                  <select id="case_volume" name="case_volume" defaultValue={d?.case_volume ?? 'medium'} className={selectClass}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complexity_level">Instrument Complexity</Label>
                  <select id="complexity_level" name="complexity_level" defaultValue={d?.complexity_level ?? 'moderate'} className={selectClass}>
                    <option value="basic">Basic</option>
                    <option value="moderate">Moderate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Teaching */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Teaching Capacity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teaching_capacity">Teaching Capacity</Label>
                  <select id="teaching_capacity" name="teaching_capacity" defaultValue={d?.teaching_capacity ?? 'moderate'} className={selectClass}>
                    <option value="limited">Limited</option>
                    <option value="moderate">Moderate</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preceptor_strength">Preceptor Strength</Label>
                  <select id="preceptor_strength" name="preceptor_strength" defaultValue={d?.preceptor_strength ?? 'moderate'} className={selectClass}>
                    <option value="limited">Limited</option>
                    <option value="moderate">Moderate</option>
                    <option value="strong">Strong</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="extern_slots">Externship Slots Available</Label>
                <Input id="extern_slots" name="extern_slots" type="number" min={1} max={20} defaultValue={d?.extern_slots ?? 2} />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="scheduling_preferences">Scheduling Preferences</Label>
              <Input id="scheduling_preferences" name="scheduling_preferences" defaultValue={d?.scheduling_preferences ?? ''} placeholder="e.g. Prefer Monday–Friday days" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                name="notes"
                defaultValue={d?.notes ?? ''}
                placeholder="Anything else candidates should know..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>

          <div className="px-6 pb-6">
            <Button type="submit" className="w-full">
              {existing?.profile_complete ? 'Update Profile' : 'Complete Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
