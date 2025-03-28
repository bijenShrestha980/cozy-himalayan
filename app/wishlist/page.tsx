"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { WishlistItem, Product } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<(WishlistItem & { product: Product })[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/login?redirect=/wishlist")
        return
      }

      setUser(session.user)
      fetchWishlistItems(session.user.id)
    }

    checkUser()
  }, [router])

  const fetchWishlistItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*, product:products(*)")
        .eq("user_id", userId)

      if (error) throw error
      setWishlistItems(data || [])
    } catch (error) {
      console.error("Error fetching wishlist items:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase.from("wishlist_items").delete().eq("id", itemId)

      if (error) throw error

      setWishlistItems(wishlistItems.filter((item) => item.id !== itemId))

      toast({
        title: "Item removed",
        description: "Item has been removed from your wishlist.",
      })
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const addToCart = async (productId: string) => {
    try {
      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      if (existingItem) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (updateError) throw updateError
      } else {
        // Add new item to cart
        const { error: insertError } = await supabase.from("cart_items").insert([
          {
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          },
        ])

        if (insertError) throw insertError
      }

      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <Link href="/products">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your wishlist yet.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.product.image_url || "/placeholder.svg?height=300&width=300"}
                  alt={item.product.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{item.product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {item.product.description?.substring(0, 100)}
                  {item.product.description && item.product.description.length > 100 ? "..." : ""}
                </p>
                <p className="font-medium">${item.product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="default" className="flex-1" onClick={() => addToCart(item.product_id)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon" onClick={() => removeFromWishlist(item.id)}>
                  <Heart className="h-4 w-4 fill-current" />
                  <span className="sr-only">Remove from wishlist</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

