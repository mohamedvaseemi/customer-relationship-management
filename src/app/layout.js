import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Inter } from 'next/font/google';
import CookieConsent from '@/components/CookieConsent';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Kibon - Modern Sales Pipeline Management',
  description: 'Manage your sales pipeline, deals, activities, and team workflows with precision. The all-in-one CRM platform for modern sales teams.',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.gif',
  },
  openGraph: {
    title: 'Kibon - Modern Sales Pipeline Management',
    description: 'Manage your sales pipeline, deals, activities, and team workflows with precision.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6d28d9',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your_google_client_id.apps.googleusercontent.com'}>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <CookieConsent />
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
