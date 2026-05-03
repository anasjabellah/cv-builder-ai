import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CV Builder AI — Turn your old CV into a stunning one',
  description:
    'AI-powered CV builder. Upload your old CV, edit the form, and let AI generate a beautiful, professional CV.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <main className="min-h-screen bg-[#0A0A0A] text-white">
          {children}
        </main>
      </body>
    </html>
  );
}
