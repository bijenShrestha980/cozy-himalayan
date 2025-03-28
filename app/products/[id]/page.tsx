import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { QuantitySelector } from "@/components/quantity-selector"
import { Star } from "lucide-react"

interface ProductPageProps {
  params: {
    id: string
  }
}

export const revalidate = 3600 // Revalidate every hour

export default async function ProductPage({ params }: ProductPageProps) {
  console.log("Attempting to fetch product with ID:", params.id)

  if (!params.id) {
    console.error("Product ID is undefined or empty")
    notFound()
  }

  try {
    // Directly query the product without UUID validation
    const { data: product, error } = await supabase.from("products").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Supabase error fetching product:", error)
      notFound()
    }

    if (!product) {
      console.error("Product not found for ID:", params.id)
      notFound()
    }

    // Function to render star rating
    const renderStars = (rating: number) => {
      return (
        <div className="flex items-center">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : i < Math.ceil(rating) && i >= Math.floor(rating)
                      ? "text-yellow-400 fill-yellow-400 opacity-50"
                      : "text-gray-300"
                }`}
              />
            ))}
          <span className="ml-2 text-sm">{rating.toFixed(1)} out of 5</span>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image_url || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold mt-2">${product.price.toFixed(2)}</p>

            {/* Rating */}
            <div className="mt-2">{renderStars(product.rating || 0)}</div>

            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Quantity:</span>
                <QuantitySelector defaultValue={1} />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <AddToCartButton productId={product.id} className="flex-1" size="lg" />
              </div>
            </div>

            <div className="mt-8 border-t pt-8">
              <h3 className="font-semibold">Product Details</h3>
              <ul className="mt-4 space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">SKU</span>
                  <span>SKU-{product.id.substring(0, 8)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Availability</span>
                  <span>{product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span>{product.stock_quantity} units</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in product page:", error)
    notFound()
  }
}

