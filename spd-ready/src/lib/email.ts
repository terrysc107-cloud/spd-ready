import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = 'SPD Ready <noreply@spdready.com>'

type PlacementStatus = 'accepted' | 'waitlisted' | 'rejected'

const SUBJECT: Record<PlacementStatus, string> = {
  accepted: 'Congratulations - You have been accepted!',
  waitlisted: 'Application update: you have been waitlisted',
  rejected: 'Application update: not selected this time',
}

const BODY: Record<PlacementStatus, (studentName: string, openingTitle: string, siteName: string) => string> = {
  accepted: (name, title, site) =>
    `Hi ${name},\n\nGreat news - you have been accepted for the "${title}" externship at ${site}.\n\nThe site coordinator will be in touch with next steps. Log in to SPD Ready to view your application status.\n\nCongratulations!\nThe SPD Ready Team`,
  waitlisted: (name, title, site) =>
    `Hi ${name},\n\nYour application for "${title}" at ${site} has been placed on the waitlist. You may still be offered a spot if one becomes available.\n\nKeep applying to other openings - your readiness profile is visible to all participating sites.\n\nThe SPD Ready Team`,
  rejected: (name, title, site) =>
    `Hi ${name},\n\nThank you for applying to "${title}" at ${site}. Unfortunately your application was not selected for this round.\n\nDo not be discouraged - continue building your readiness score and apply to other openings. Your profile is always improving.\n\nThe SPD Ready Team`,
}

export async function sendPlacementEmail({
  to,
  studentName,
  status,
  openingTitle,
  siteName,
}: {
  to: string
  studentName: string
  status: PlacementStatus
  openingTitle: string
  siteName: string
}): Promise<void> {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set - would have sent "${SUBJECT[status]}" to ${to}`)
    return
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: SUBJECT[status],
    text: BODY[status](studentName, openingTitle, siteName),
  })
}
