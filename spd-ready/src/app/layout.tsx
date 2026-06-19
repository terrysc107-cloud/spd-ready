import type { Metadata } from 'next'
import { Sora, Inter, Geist_Mono } from 'next/font/google'
import './globals.css'

// Type system: Sora = display/headings (sleek geometric, confident), Inter =
// body (highly legible). Monday violet/pastel system stays; this gives it a
// modern, distinctive voice with a bold varied scale.
const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SPD Ready — Staff Competency & Survey Readiness',
  description:
    'Standardized SPD staff training, competency validation, and survey-ready evidence for sterile processing departments.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
