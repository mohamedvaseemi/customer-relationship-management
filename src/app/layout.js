import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/Toast";
import { LoadingProvider } from "@/context/LoadingContext";

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL('https://moderncrm.com'),
  title: {
    default: "ModernCRM | Sales Intelligence Simplified",
    template: "%s | ModernCRM"
  },
  description: "High-performance sales intelligence platform for modern teams. Track leads, close deals, and automate workflows with AI-powered insights.",
  keywords: ["CRM", "Sales Intelligence", "Lead Management", "Pipeline Tracking", "Sales Automation"],
  authors: [{ name: "ModernCRM Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moderncrm.com",
    siteName: "ModernCRM",
    title: "ModernCRM | Sales Intelligence Simplified",
    description: "The definitive platform for high-performance sales teams.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ModernCRM Dashboard" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "ModernCRM | Sales Intelligence Simplified",
    description: "The definitive platform for high-performance sales teams.",
    images: ["/og-image.png"]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LoadingProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
