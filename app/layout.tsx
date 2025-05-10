import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SessionProvider } from 'next-auth/react'
import Providers from '@/app/Providers'

export const metadata: Metadata = {
  title: 'Contact Management System',
  description: 'Enhanced contact management and relationship tracking system',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
} 