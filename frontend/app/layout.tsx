import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arenas - Sistema de Gestão',
  description: 'Sistema de gestão para arenas de esportes de areia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}



