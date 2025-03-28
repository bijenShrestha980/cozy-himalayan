"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImageUploader } from "@/components/image-uploader"
import { deleteFromBlob } from "@/lib/blob"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProductImageGalleryProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ProductImageGallery({ images = [], onImagesChange, maxImages = 5 }: ProductImageGalleryProps) {
  const [showUploader, setShowUploader] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = (url: string) => {
    if (url) {
      const newImages = [...images, url]
      onImagesChange(newImages)
    }
    setShowUploader(false)
  }

  const handleRemoveImage = async (index: number) => {
    try {
      const imageUrl = images[index]

      // Remove from state first for better UX
      const newImages = [...images]
      newImages.splice(index, 1)
      onImagesChange(newImages)

      // Then delete from Blob storage
      await deleteFromBlob(imageUrl)

      toast({
        title: "Image removed",
        description: "The image has been removed successfully",
      })
    } catch (error) {
      console.error("Error removing image:", error)
      toast({
        title: "Error",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Images</h3>
        {images.length < maxImages && !showUploader && (
          <Button variant="outline" size="sm" onClick={() => setShowUploader(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        )}
      </div>

      {showUploader && (
        <div className="mb-4">
          <ImageUploader
            folder="products"
            onUploadComplete={handleImageUpload}
            onUploadError={() => setShowUploader(false)}
          />
          <div className="flex justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowUploader(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0 relative group">
              <img
                src={image || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="destructive" size="icon" onClick={() => handleRemoveImage(index)} className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {images.length === 0 && !showUploader && (
          <div className="col-span-full text-center p-8 border border-dashed rounded-md">
            <p className="text-muted-foreground">No images added yet</p>
            <Button variant="outline" size="sm" onClick={() => setShowUploader(true)} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Add First Image
            </Button>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} of {maxImages} images
        </p>
      )}
    </div>
  )
}

