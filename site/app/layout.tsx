import "./globals.css"
import { Bangers } from "next/font/google"
import type React from "react"
import { siteConfig } from "./config"

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bangers",
})

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
}

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

