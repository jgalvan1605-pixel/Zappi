import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zappi - Marketing Conversacional para WhatsApp Business',
  description: 'Automatiza campañas, carritos y ventas por WhatsApp sin tocar una sola línea de código.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-zappi-surface text-zappi-midnight min-h-screen">
        {children}
      </body>
    </html>
  );
}