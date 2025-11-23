import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../app/contexts/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MultiDB Academy',
    template: '%s | MultiDB Academy'
  },
  description: 'Plataforma avanzada de gestión de bases de datos académicas',
  keywords: ['database', 'education', 'academy', 'multidb', 'learning'],
  authors: [{ name: 'MultiDB Team' }],
  creator: 'MultiDB Academy',
  publisher: 'MultiDB Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#000000' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://multidb-academy.com',
    siteName: 'MultiDB Academy',
    title: 'MultiDB Academy - Gestión de Bases de Datos',
    description: 'Plataforma educativa para el aprendizaje y gestión de bases de datos',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MultiDB Academy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MultiDB Academy',
    description: 'Plataforma educativa para el aprendizaje y gestión de bases de datos',
    images: ['/twitter-image.png'],
    creator: '@multidbacademy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-black text-white min-h-screen`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {/* Background Effect Global */}
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-black"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            </div>
          </div>

          {/* Grid Pattern Overlay */}
          <div className="fixed inset-0 z-0 opacity-[0.02]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Gradient Orbs */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float animation-delay-4000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float animation-delay-2000"></div>
          </div>

          {/* Main Content */}
          <main className="relative z-10">
            <div className="page-transition">
              {children}
            </div>
          </main>

          {/* Loading Indicator */}
          <div id="global-loading" className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none">
            <div className="loading-bar"></div>
          </div>

          {/* Cursor Trail Effect */}
          <div className="cursor-trail"></div>
        </AuthProvider>

        {/* NoScript Fallback */}
        <noscript>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold mb-4">JavaScript Requerido</h1>
              <p className="text-gray-400">
                Por favor habilita JavaScript para usar MultiDB Academy.
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}