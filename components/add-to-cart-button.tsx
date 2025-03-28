"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { addToCart } from "@/app/actions/cart-actions"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps extends ButtonProps {
  productId: string
  quantity?: number
  showIcon?: boolean
  onSuccess?: () => void
}

export function AddToCartButton({
  productId,
  quantity = 1,
  showIcon = true,
  onSuccess,
  ...props
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAddToCart = async () => {
    if (!productId) {
      toast({
        title: "Error",
        description: "Invalid product ID",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await addToCart(productId, quantity)

      if (result.success) {
        setIsSuccess(true)
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart",
        })

        if (onSuccess) {
          onSuccess()
        }

        // Reset success state after 2 seconds
        setTimeout(() => {
          setIsSuccess(false)
        }, 2000)
      } else if (result.requiresAuth && result.redirectUrl) {
        // Handle authentication redirect
        toast({
          title: "Authentication required",
          description: "Please log in to add items to your cart",
        })
        router.push(result.redirectUrl)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add item to cart",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in add to cart button:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : isSuccess ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className="mr-2 h-4 w-4" />}
          Add to cart
        </>
      )}
    </Button>
  )
}

