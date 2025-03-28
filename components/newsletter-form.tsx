"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, you would send this to your API
      // We're not using Supabase directly here to avoid initialization errors
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Subscribed!",
        description: "You've been successfully subscribed to our newsletter.",
      })

      setEmail("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-w-[200px]"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Subscribe to our newsletter for exclusive offers and updates.</p>
    </form>
  )
}

