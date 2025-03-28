import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn't find the product you're looking for. It may have been removed or the URL might be incorrect.
      </p>
      <div className="flex gap-4">
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    </div>
  )
}

