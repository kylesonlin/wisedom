import type { Metadata } from 'next'
import './globals.css'
import './test.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'RelationshipOS App',
  description: 'RelationshipOS App',
  openGraph: {
    title: 'RelationshipOS App',
    description: 'RelationshipOS App',
    url: 'https://app.wisedom.ai',
    siteName: 'RelationshipOS App',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'RelationshipOS App',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RelationshipOS App',
    description: 'RelationshipOS App',
    images: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 