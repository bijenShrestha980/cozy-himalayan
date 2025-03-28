import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import { CarouselBanner } from "@/components/carousel-banner"
import { ProductCard } from "@/components/product-card"

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  // Fetch featured products with error handling
  let featuredProducts = []
  try {
    // First, get the featured product IDs and positions
    const { data: featuredData, error: featuredError } = await supabase
      .from("featured_products")
      .select("product_id, position")
      .order("position", { ascending: true })
      .limit(4)

    if (!featuredError && featuredData && featuredData.length > 0) {
      // Then, get the product details separately to avoid RLS issues
      const productIds = featuredData.map((item) => item.product_id)

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)

      if (!productsError && productsData) {
        // Combine the data
        featuredProducts = featuredData
          .map((featured) => {
            const product = productsData.find((p) => p.id === featured.product_id)
            return {
              product: product || null,
            }
          })
          .filter((item) => item.product !== null) // Filter out any null products
      }
    }
  } catch (error) {
    console.error("Error fetching featured products:", error)
    // Continue with empty featured products
  }

  // Carousel images
  const carouselImages = [
    {
      src: "/placeholder.svg?height=600&width=1200&text=Summer+Sale",
      alt: "Summer Sale",
      title: "Summer Sale",
      description: "Up to 50% off on selected items",
      buttonText: "Shop Now",
      buttonLink: "/products",
    },
    {
      src: "/placeholder.svg?height=600&width=1200&text=New+Arrivals",
      alt: "New Arrivals",
      title: "New Arrivals",
      description: "Check out our latest products",
      buttonText: "Explore",
      buttonLink: "/products",
    },
    {
      src: "/placeholder.svg?height=600&width=1200&text=Special+Offers",
      alt: "Special Offers",
      title: "Special Offers",
      description: "Limited time deals on premium products",
      buttonText: "View Offers",
      buttonLink: "/products",
    },
  ]

  return (
    <div className="flex flex-col">
      <section className="w-full mb-12">
        <CarouselBanner images={carouselImages} />
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Products</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Check out our most popular items
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-8">
            {featuredProducts && featuredProducts.length > 0
              ? featuredProducts.map((item, index) => <ProductCard key={`featured-${index}`} product={item.product} />)
              : Array.from({ length: 4 }).map((_, i) => (
                  <Link
                    href={`/products/${i + 1}`}
                    key={i}
                    className="group relative overflow-hidden rounded-lg border"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=400&width=400&text=Product ${i + 1}`}
                        alt={`Product ${i + 1}`}
                        className="object-cover transition-transform group-hover:scale-105 h-full w-full"
                        width={400}
                        height={400}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">Product {i + 1}</h3>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-medium">${(19.99 + i * 10).toFixed(2)}</span>
                        <Button size="sm" variant="secondary">
                          Add to cart
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/products">
              <Button variant="outline">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 items-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Secure Payments</h3>
              <p className="text-muted-foreground">All transactions are secure and encrypted</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-primary"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <h3 className="text-xl font-bold">Free Shipping</h3>
              <p className="text-muted-foreground">On all orders over $50</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-primary"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              <h3 className="text-xl font-bold">Quality Guarantee</h3>
              <p className="text-muted-foreground">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

