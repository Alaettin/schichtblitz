"use client"

import { Zap } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {process.env.NODE_ENV === "development" && (
        <div className="bg-amber-500 px-4 py-1 text-center text-xs font-medium text-white">
          Dev-Modus — Angemeldet als Dev Admin
        </div>
      )}
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">SchichtBlitz</span>
        </div>
      </div>
    </header>
  )
}
