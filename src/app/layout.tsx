import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Last One Standing — Calculus Challenge',
  description: 'Real-time multiplayer calculus elimination game for the classroom',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#13131a', color: '#fff', border: '1px solid #1e1e2e' },
          }}
        />
      </body>
    </html>
  )
}
