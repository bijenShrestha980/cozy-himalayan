"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CartCounter() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn("Supabase environment variables are not available. Cart counter will be disabled.")
          setLoading(false)
          return
        }

        // Dynamically import supabase
        const { supabase } = await import("@/lib/supabase")

        // Mark as initialized
        setInitialized(true)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setLoading(false)
          return
        }

        const userId = session.user.id

        // Check if user exists in users table
        const { data: userExists, error: userCheckError } = await supabase
          .from("users")
          .select("id")
          .eq("id", userId)
          .single()

        if (userCheckError || !userExists) {
          setLoading(false)
          return
        }

        const { data, error, count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact" })
          .eq("user_id", userId)

        if (error) throw error

        setCount(count || 0)
      } catch (error) {
        console.error("Error fetching cart count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCartCount()

    // Set up a subscription to cart changes
    const setupSubscription = async () => {
      try {
        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          return null
        }

        const { supabase } = await import("@/lib/supabase")

        const channel = supabase
          .channel("cart_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "cart_items",
            },
            () => {
              fetchCartCount()
            },
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.error("Error setting up subscription:", error)
        return null
      }
    }

    const unsubscribePromise = setupSubscription()

    return () => {
      // Clean up subscription
      if (unsubscribePromise) {
        unsubscribePromise.then((unsub) => {
          if (unsub) unsub()
        })
      }
    }
  }, [])

  // If not initialized, don't show the cart counter
  if (!initialized) {
    return null
  }

  return (
    <Link href="/cart">
      <Button variant="outline" size="icon" className="relative">
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {count}
          </span>
        )}
        <span className="sr-only">Cart</span>
      </Button>
    </Link>
  )
}

