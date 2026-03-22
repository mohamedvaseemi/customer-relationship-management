import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/Toast";

export const metadata = {
  title: {
    default: "ModernCRM | Sales Intelligence Simplified",
    template: "%s | ModernCRM"
  },
  description: "High-performance sales intelligence platform for modern teams. Track leads, close deals, and automate workflows with AI-powered insights.",
  keywords: ["CRM", "Sales Intelligence", "Lead Management", "Pipeline Tracking", "Sales Automation"],
  authors: [{ name: "ModernCRM Team" }],
  viewport: "width=device-width, initial-scale=1",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
