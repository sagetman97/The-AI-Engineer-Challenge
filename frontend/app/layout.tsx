import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Orbitron } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Retro Neon App',
  description: 'A retro-styled todo list and chatbot application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${orbitron.className} bg-dark text-neon-blue min-h-screen`}>
        <nav className="fixed top-0 left-0 right-0 bg-dark border-b-2 border-neon-pink shadow-neon z-50">
          <div className="container mx-auto px-4 py-4 flex justify-center gap-4">
            <a href="/todos" className="neon-button">Todo List</a>
            <a href="/chat" className="neon-button">Chat Bot</a>
          </div>
        </nav>
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  )
} 