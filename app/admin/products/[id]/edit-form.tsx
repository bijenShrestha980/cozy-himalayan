"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { updateProductImages } from "@/app/actions/product-actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EditProductFormProps {
  productId: string
}

export function EditProductForm({ productId }: EditProductFormProps) {
  const [product, setProduct] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single()

        if (productError) throw productError

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true })

        if (categoriesError) throw categoriesError

        setProduct(productData)
        setCategories(categoriesData || [])

        // Set images array from product data
        const productImages = []
        if (productData.image_url) {
          productImages.push(productData.image_url)
        }
        if (productData.additional_images && Array.isArray(productData.additional_images)) {
          productImages.push(...productData.additional_images)
        }
        setImages(productImages)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductAndCategories()
  }, [productId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setProduct({ ...product, [name]: value })
  }

  const handleImagesChange = async (newImages: string[]) => {
    setImages(newImages)

    // Update product images in database
    const result = await updateProductImages(productId, newImages)

    if (!result.success) {
      toast({
        title: "Error",
        description: result.message || "Failed to update product images",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Update product data
      const { error } = await supabase
        .from("products")
        .update({
          name: product.name,
          description: product.description,
          price: Number.parseFloat(product.price),
          category_id: product.category_id,
          stock_quantity: Number.parseInt(product.stock_quantity),
          image_url: images[0] || null,
          additional_images: images.slice(1),
        })
        .eq("id", productId)

      if (error) throw error

      toast({
        title: "Product updated",
        description: "Product has been updated successfully",
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Product not found</p>
        <Button className="mt-4" onClick={() => router.push("/admin/products")}>
          Back to Products
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={product.name || ""} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={product.description || ""}
                onChange={handleInputChange}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.price || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={product.category_id || ""}
                  onValueChange={(value) => handleSelectChange("category_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={product.stock_quantity || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImageGallery images={images} onImagesChange={handleImagesChange} maxImages={5} />
          </CardContent>
        </Card>

        <CardFooter className="flex justify-between px-0">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </div>
    </form>
  )
}

