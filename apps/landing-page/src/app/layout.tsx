import type React from "react"
import type { Metadata } from "next"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "Quick.bot - AI-Powered Chatbot Builder | Create Conversational Flows",
  description:
    "Build intelligent chatbot conversations with our intuitive visual flow builder. Design, deploy, and optimize AI-powered chatbots in minutes. No coding required.",
  generator: "v0.app",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
