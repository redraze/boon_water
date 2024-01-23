import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Session from './Session'

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
          <Session>
            {children}
          </Session>
        </body>
    </html>
  );
};
