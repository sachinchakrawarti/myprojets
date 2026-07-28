import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Shraddhu AI - Your J.A.R.V.I.S. Assistant',
  description: 'Personal AI assistant inspired by Shraddha Kapoor - Talk to me like J.A.R.V.I.S.!',
  keywords: 'AI, assistant, JARVIS, Shraddha Kapoor, voice assistant, chatbot',
  authors: [{ name: 'Shraddhu AI' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0a0a1a',
  openGraph: {
    title: 'Shraddhu AI - Your J.A.R.V.I.S. Assistant',
    description: 'Personal AI assistant inspired by Shraddha Kapoor',
    type: 'website',
    url: 'https://shraddhu-ai.com',
    siteName: 'Shraddhu AI',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#e0e0e0',
                border: '1px solid #e94560',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#e94560',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}