import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillBridge — Fair Prices for Every Country',
  description: 'Buy and sell skills at PPP-adjusted prices. Fair for everyone, everywhere.',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SkillBridge' },
  openGraph: {
    title: 'SkillBridge',
    description: 'Global skills marketplace with fair PPP pricing',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
