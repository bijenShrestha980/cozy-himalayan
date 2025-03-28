"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, ArrowUp, ArrowDown, Trash, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function FeaturedProductsPage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [processingAction, setProcessingAction] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch products and featured products in parallel
      await Promise.all([fetchProductsList(), fetchFeaturedProducts()])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsList = async () => {
    try {
      const { data, error } = await supabase.from("products").select("id, name").order("name", { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      console.error("Error fetching products list:", error)
      toast({
        title: "Error",
        description: "Failed to load products list",
        variant: "destructive",
      })
    }
  }

  const fetchFeaturedProducts = async () => {
    try {
      // First, get the featured product IDs and positions
      const { data: featuredData, error: featuredError } = await supabase
        .from("featured_products")
        .select("id, product_id, position")
        .order("position", { ascending: true })

      if (featuredError) throw featuredError

      if (!featuredData || featuredData.length === 0) {
        setFeaturedProducts([])
        return
      }

      // Then, get the product details separately
      const productIds = featuredData.map((item) => item.product_id)

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)

      if (productsError) throw productsError

      // Combine the data
      const combined = featuredData.map((featured) => {
        const product = productsData.find((p) => p.id === featured.product_id)
        return {
          ...featured,
          product: product || { name: "Unknown Product", price: 0 },
        }
      })

      setFeaturedProducts(combined)
    } catch (error: any) {
      console.error("Error fetching featured products:", error)
      setError(error.message || "Failed to load featured products")
      toast({
        title: "Error",
        description: "Failed to load featured products",
        variant: "destructive",
      })
    }
  }

  const addFeaturedProduct = async () => {
    if (!selectedProduct) return

    try {
      setProcessingAction(true)

      // Check if product is already featured
      const exists = featuredProducts.some((item) => item.product_id === selectedProduct)
      if (exists) {
        toast({
          title: "Already featured",
          description: "This product is already in the featured list",
          variant: "destructive",
        })
        return
      }

      const position = featuredProducts.length > 0 ? Math.max(...featuredProducts.map((p) => p.position)) + 1 : 0

      const { error } = await supabase.from("featured_products").insert([{ product_id: selectedProduct, position }])

      if (error) throw error

      toast({
        title: "Product added",
        description: "Product has been added to featured list",
      })

      setSelectedProduct("")
      fetchFeaturedProducts()
    } catch (error: any) {
      console.error("Error adding featured product:", error)
      toast({
        title: "Error",
        description: "Failed to add product to featured list",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const removeFeaturedProduct = async (id: string) => {
    try {
      setProcessingAction(true)

      const { error } = await supabase.from("featured_products").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Product removed",
        description: "Product has been removed from featured list",
      })

      fetchFeaturedProducts()
    } catch (error: any) {
      console.error("Error removing featured product:", error)
      toast({
        title: "Error",
        description: "Failed to remove product from featured list",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const movePosition = async (id: string, direction: "up" | "down") => {
    const currentIndex = featuredProducts.findIndex((p) => p.id === id)
    if (currentIndex === -1) return

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (swapIndex < 0 || swapIndex >= featuredProducts.length) return

    const currentItem = featuredProducts[currentIndex]
    const swapItem = featuredProducts[swapIndex]

    try {
      setProcessingAction(true)

      // Update positions in database
      const updates = [
        { id: currentItem.id, position: swapItem.position },
        { id: swapItem.id, position: currentItem.position },
      ]

      for (const update of updates) {
        const { error } = await supabase
          .from("featured_products")
          .update({ position: update.position })
          .eq("id", update.id)

        if (error) throw error
      }

      fetchFeaturedProducts()
    } catch (error: any) {
      console.error("Error updating position:", error)
      toast({
        title: "Error",
        description: "Failed to update product position",
        variant: "destructive",
      })
    } finally {
      setProcessingAction(false)
    }
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Featured Product</CardTitle>
          <CardDescription>Select a product to add to the featured list</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
            <div className="flex-1 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addFeaturedProduct} disabled={!selectedProduct || processingAction}>
              {processingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add to Featured
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Products</CardTitle>
          <CardDescription>Manage your featured products</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchData}>Try Again</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : featuredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No featured products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  featuredProducts.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                          <img
                            src={item.product.image_url || "/placeholder.svg?height=48&width=48"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>${item.product.price?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => movePosition(item.id, "up")}
                            disabled={index === 0 || processingAction}
                          >
                            <ArrowUp className="h-4 w-4" />
                            <span className="sr-only">Move up</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => movePosition(item.id, "down")}
                            disabled={index === featuredProducts.length - 1 || processingAction}
                          >
                            <ArrowDown className="h-4 w-4" />
                            <span className="sr-only">Move down</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => removeFeaturedProduct(item.id)}
                            disabled={processingAction}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

