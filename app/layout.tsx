import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'SkillBridge — Global Skills at Local Prices',
  description: 'Hire world-class talent at prices that make sense for your country. Powered by Purchasing Power Parity.',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: { capable: true, title: 'SkillBridge', statusBarStyle: 'default' },
  openGraph: {
    title: 'SkillBridge',
    description: 'Global skills marketplace with PPP pricing',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
