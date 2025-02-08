import "./globals.css"
import { Bangers } from "next/font/google"
import type React from "react" // Import React

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bangers",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={bangers.variable}>
      <body>{children}</body>
    </html>
  )
}

