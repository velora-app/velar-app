import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Velora - Database Management Tool',
  description: 'A modern database management tool',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
