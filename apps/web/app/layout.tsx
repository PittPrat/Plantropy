import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthButton } from '@/components/auth/AuthButton' // Import AuthButton
import Link from 'next/link' // Import Link for the logo/title

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plantropy',
  description: 'Plan your next adventure with Plantropy!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              {/* You can add an SVG logo here if you have one */}
              <span className="font-bold sm:inline-block">Plantropy</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
              {/* Future navigation links can go here */}
            </nav>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <AuthButton />
            </div>
          </div>
        </header>
        <main className="flex-1 container py-8">{children}</main>
        <footer className="py-6 md:px-8 md:py-0 border-t border-border/40">
          <div className="container flex flex-col items-center justify-center gap-4 h-24 md:flex-row md:justify-between">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with ❤️ by the Plantropy Team.
            </p>
            {/* Add other footer links if needed */}
          </div>
        </footer>
      </body>
    </html>
  )
}
