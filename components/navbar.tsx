"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingBag, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartCounter } from "@/components/cart-counter"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith("/admin")

  useEffect(() => {
    // Initialize auth only on the client side
    const initializeAuth = async () => {
      try {
        // Check if environment variables are available
        if (typeof window !== "undefined" && window.ENV_VARS_CHECKED !== true) {
          // Create a global flag to avoid checking multiple times
          window.ENV_VARS_CHECKED = true

          // Check if we can access the environment variables
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn("Supabase environment variables are not available. Authentication features will be disabled.")
            setLoading(false)
            return
          }
        }

        // Dynamically import supabase
        const { supabase } = await import("@/lib/supabase")

        // Mark auth as initialized
        setAuthInitialized(true)

        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)

        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null)
        })

        return () => {
          authListener?.subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const handleSignOut = async () => {
    if (!authInitialized) return

    try {
      const { supabase } = await import("@/lib/supabase")
      await supabase.auth.signOut()
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Don't show the main navbar on admin pages
  if (isAdminPage) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <ShoppingBag className="h-6 w-6" />
          <span>Cozy Himalayan</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
            Products
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {authInitialized && <CartCounter />}

          {authInitialized && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/order-tracking">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                {user.user_metadata?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-6">
                <Link href="/products" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Products
                </Link>
                <Link href="/about" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <Link href="/contact" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
                {authInitialized && user ? (
                  <>
                    <Link href="/account" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                      My Account
                    </Link>
                    <Link
                      href="/order-tracking"
                      className="text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link href="/wishlist" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Wishlist
                    </Link>
                    {user.user_metadata?.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="text-lg font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start p-0 text-lg font-medium"
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/login" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                )}
                <div className="mt-4">
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

// Add the global type for our environment variables check
declare global {
  interface Window {
    ENV_VARS_CHECKED?: boolean
  }
}

