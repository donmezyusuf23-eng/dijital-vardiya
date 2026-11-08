import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yetki Tabanlı Dijital Vardiya Yönetim Sistemi',
  description: 'İşletmeler için yetki tabanlı vardiya planlama, denetim izi ve çalışan yönetim sistemi'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">{children}</body>
    </html>
  );
}
