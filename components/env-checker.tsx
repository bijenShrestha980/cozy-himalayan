"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EnvironmentChecker() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Only run on the client side
    if (typeof window === "undefined") return

    const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const missing = requiredVars.filter((varName) => !process.env[varName])

    setMissingVars(missing)
    setChecked(true)
  }, [])

  // Only show the alert if we've checked and found missing variables
  if (!checked || missingVars.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Missing Environment Variables</AlertTitle>
      <AlertDescription>
        The following environment variables are missing: {missingVars.join(", ")}. Some features may not work correctly.
      </AlertDescription>
    </Alert>
  )
}

