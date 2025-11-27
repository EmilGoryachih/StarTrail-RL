import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'StarTrail AI - Intelligent POI Search & Recommendations',
  description: 'AI-powered semantic search and personalized recommendations for points of interest. Discover perfect places based on your preferences.',
  keywords: ['POI', 'travel', 'recommendations', 'AI', 'semantic search', 'tourism', 'places'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
