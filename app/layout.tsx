import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { DebugProvider } from "@/components/debug-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lovy-tech | Smart Glasses OS",
  description: "Advanced e-OS system for smart glasses with real-time performance tracking",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      // Simplify the redirect URLs to avoid conflicts
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "rgba(255, 255, 255, 0.1)",
          colorInputBackground: "rgba(255, 255, 255, 0.1)",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-blue-500 hover:bg-blue-600 text-white",
          card: "bg-white/10 backdrop-blur-lg border border-white/20",
          headerTitle: "text-white",
          headerSubtitle: "text-white/70",
          socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
          formFieldLabel: "text-white",
          formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-white/50",
          footerActionLink: "text-blue-300 hover:text-blue-200",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <DebugProvider>{children}</DebugProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
