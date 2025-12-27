import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyDietitian Panel',
  description: 'Clinic-oriented SaaS panel for dietitians',
}

import { Providers } from '@/components/Providers'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-clinic text-gray-900 ${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
