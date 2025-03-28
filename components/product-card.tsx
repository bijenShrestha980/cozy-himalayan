import Link from "next/link"
import type { Product } from "@/lib/supabase"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  // Handle potential undefined values
  if (!product || !product.id) {
    return null
  }

  // Ensure price is a number for toFixed
  const price =
    typeof product.price === "number" ? product.price.toFixed(2) : Number.parseFloat(product.price as any).toFixed(2)

  // Handle rating display
  const rating = product.rating || 0

  // Function to render star rating
  const renderStars = () => {
    return (
      <div className="flex items-center mt-1">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : i < Math.ceil(rating) && i >= Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400 opacity-50"
                    : "text-gray-300"
              }`}
            />
          ))}
        <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <Link href={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image_url || "/placeholder.svg?height=400&width=400"}
            alt={product.name || "Product"}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            width={400}
            height={400}
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold line-clamp-1">{product.name || "Unnamed Product"}</h3>
        </Link>
        {renderStars()}
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {product.description || "No description available"}
        </p>
        <p className="font-medium mt-2">${price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <AddToCartButton productId={product.id} className="w-full" />
      </CardFooter>
    </Card>
  )
}

