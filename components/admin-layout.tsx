"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { User } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Box,
  CreditCard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
  Info,
  MessageSquare,
  Image,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn("Supabase environment variables are not available. Admin features will be disabled.")
          router.push("/")
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
          router.push("/auth/login")
          return
        }

        // Check if user is admin using JWT claims
        const isAdmin = session.user.user_metadata?.role === "admin" || session.user.app_metadata?.role === "admin"

        if (!isAdmin) {
          // Also check the database as a fallback
          const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (error || userData?.role !== "admin") {
            await supabase.auth.signOut()
            router.push("/auth/login")
            toast({
              title: "Access denied",
              description: "You don't have permission to access the admin area.",
              variant: "destructive",
            })
            return
          }

          setUser(userData)
        } else {
          // User is admin based on JWT claims
          const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()
          setUser(
            userData ||
              ({
                id: session.user.id,
                email: session.user.email,
                role: "admin",
                first_name: session.user.user_metadata?.first_name,
                last_name: session.user.user_metadata?.last_name,
              } as User),
          )
        }
      } catch (error) {
        console.error("Error checking user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router, toast])

  const handleSignOut = async () => {
    if (!initialized) return

    try {
      const { supabase } = await import("@/lib/supabase")
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // If not initialized, redirect to home
  if (!initialized) {
    router.push("/")
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { name: "Orders", href: "/admin/orders", icon: Package },
    { name: "Products", href: "/admin/products", icon: Box },
    { name: "Featured Products", href: "/admin/featured-products", icon: Image },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Role Management", href: "/admin/roles", icon: Settings },
    { name: "About Us", href: "/admin/about-us", icon: Info },
    { name: "Contact Us", href: "/admin/contact-us", icon: MessageSquare },
  ]

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-background px-4 md:hidden">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
            <ShoppingBag className="h-6 w-6" />
            <span>Cozy Himalayan Admin</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-background p-4 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
                <ShoppingBag className="h-6 w-6" />
                <span>Cozy Himalayan Admin</span>
              </Link>
              <Button variant="outline" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="mt-4 flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sign out
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden border-r md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow overflow-y-auto bg-background">
          <div className="flex h-16 items-center justify-between gap-2 border-b px-6">
            <div className="flex items-center gap-2 font-bold">
              <ShoppingBag className="h-6 w-6" />
              <span>Cozy Himalayan</span>
            </div>
            <ThemeToggle />
          </div>
          <nav className="mt-6 flex flex-1 flex-col px-4 gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href || pathname?.startsWith(`${item.href}/`)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

