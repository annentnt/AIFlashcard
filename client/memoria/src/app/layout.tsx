import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../context/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Memoria - Smart Flashcards",
  description: "Learn efficiently with Memoria flashcards",
}

export default function RootLayout({ 
  children,
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
