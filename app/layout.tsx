import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Session from './Session'
import { Suspense } from 'react'
import Spinner from './components/spinner/Spinner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Boon Water',
  description: 'Boon water users management portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
        <body className={inter.className}>
          <Suspense fallback={ <Spinner /> }>
            <Session>
              {children}
            </Session>
          </Suspense>
        </body>
    </html>
  );
};
