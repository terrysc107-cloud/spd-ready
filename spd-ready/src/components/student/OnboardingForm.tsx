'use client'

import { useActionState, useState } from 'react'
import { upsertStudentProfileAction } from '@/actions/student'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const TOTAL_STEPS = 3
const SHIFT_OPTIONS = ['days', 'evenings', 'nights', 'weekends', 'flexible']
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

type Props = {
  initialData?: {
    first_name?: string
    last_name?: string
    city?: string
    state?: string
    travel_radius?: number
    cert_status?: string
    program_name?: string
    expected_completion_date?: string
    shift_availability?: string[]
    transportation_reliable?: boolean
    preferred_environment?: string
  } | null
}

export function OnboardingForm({ initialData }: Props) {
  const [step, setStep] = useState(1)
  const [selectedShifts, setSelectedShifts] = useState<string[]>(
    initialData?.shift_availability ?? []
  )
  const [state, formAction, pending] = useActionState(upsertStudentProfileAction, null)

  const toggleShift = (shift: string) => {
    setSelectedShifts(prev =>
      prev.includes(shift) ? prev.filter(s => s !== shift) : [...prev, shift]
    )
  }

  const STEP_LABELS = ['Personal Info', 'Location & Travel', 'Availability & Preferences']

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Student Profile</CardTitle>
        <CardDescription>
          Step {step} of {TOTAL_STEPS}: {STEP_LABELS[step - 1]}
        </CardDescription>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
      </CardHeader>

      <form action={formAction}>
        {/* Always-present hidden field for shift accumulation */}
        <input type="hidden" name="shift_availability" value={selectedShifts.join(',')} />

        <CardContent className="space-y-4">
          {state?.error && (
            <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          {/* ── Step 1: Personal Info — always in DOM, hidden when not active ── */}
          <div className={step === 1 ? 'space-y-4' : 'hidden'}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" defaultValue={initialData?.first_name ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" defaultValue={initialData?.last_name ?? ''} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert_status">Certification Status</Label>
              <select
                id="cert_status"
                name="cert_status"
                defaultValue={initialData?.cert_status ?? 'none'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="none">No certification</option>
                <option value="in_progress">In Progress (studying)</option>
                <option value="crcst">CRCST Certified</option>
                <option value="cis">CIS Certified</option>
                <option value="other">Other certification</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program_name">Training Program Name</Label>
              <Input
                id="program_name"
                name="program_name"
                placeholder="e.g. City College SPD Program"
                defaultValue={initialData?.program_name ?? ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_completion_date">Expected Completion Date</Label>
              <Input
                id="expected_completion_date"
                name="expected_completion_date"
                type="date"
                defaultValue={initialData?.expected_completion_date ?? ''}
              />
            </div>
          </div>

          {/* ── Step 2: Location & Travel — always in DOM, hidden when not active ── */}
          <div className={step === 2 ? 'space-y-4' : 'hidden'}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={initialData?.city ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  name="state"
                  defaultValue={initialData?.state ?? ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select state</option>
                  {US_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="travel_radius">Travel Radius (miles)</Label>
              <Input
                id="travel_radius"
                name="travel_radius"
                type="number"
                min={0}
                max={500}
                defaultValue={initialData?.travel_radius ?? 25}
              />
              <p className="text-xs text-muted-foreground">How far are you willing to commute?</p>
            </div>

            <div className="space-y-2">
              <Label>Reliable Transportation</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="transportation_reliable"
                    value="true"
                    defaultChecked={initialData?.transportation_reliable !== false}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="transportation_reliable"
                    value="false"
                    defaultChecked={initialData?.transportation_reliable === false}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          {/* ── Step 3: Availability & Preferences — always in DOM, hidden when not active ── */}
          <div className={step === 3 ? 'space-y-4' : 'hidden'}>
            <div className="space-y-2">
              <Label>Shift Availability (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {SHIFT_OPTIONS.map(shift => (
                  <button
                    key={shift}
                    type="button"
                    onClick={() => toggleShift(shift)}
                    className={`rounded-full border px-3 py-1 text-sm capitalize transition-colors ${
                      selectedShifts.includes(shift)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {shift}
                  </button>
                ))}
              </div>
              {selectedShifts.length === 0 && (
                <p className="text-xs text-destructive">Select at least one shift</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_environment">Preferred Environment</Label>
              <select
                id="preferred_environment"
                name="preferred_environment"
                defaultValue={initialData?.preferred_environment ?? 'either'}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="acute_care">Acute Care / Hospital</option>
                <option value="ambulatory">Ambulatory / Outpatient</option>
                <option value="either">Either / No Preference</option>
              </select>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button type="button" className="ml-auto" onClick={() => setStep(s => s + 1)}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="ml-auto"
              disabled={pending || selectedShifts.length === 0}
            >
              {pending ? 'Saving...' : 'Complete Profile'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
