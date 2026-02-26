import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Task Manager - Docker Demo',
  description: 'Aplicación de tareas dockerizada profesionalmente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
