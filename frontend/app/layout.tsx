import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Orbitron } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'Retro Neon Todo App',
  description: 'A todo app with retro neon aesthetics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${orbitron.className} bg-dark min-h-screen text-white animated-bg`}>
        {children}
      </body>
    </html>
  )
} 