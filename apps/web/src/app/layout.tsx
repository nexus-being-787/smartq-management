import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SmartQ — Hospital Queue Management',
  description: 'Intelligent queue management for modern hospitals',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
