import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'
import './globals.css'

export const metadata: Metadata = {
  title: 'パワハラ撲滅',
  description: 'ハラスメント記録・証拠化・相談資料作成支援アプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja" className="h-full">
        <body className="min-h-full flex flex-col bg-[#f5f4ff]">{children}</body>
      </html>
    </ClerkProvider>
  )
}
