"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { uploadToBlob } from "@/lib/blob"
import { Upload, X, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploaderProps {
  onUploadComplete?: (url: string) => void
  onUploadError?: (error: Error) => void
  folder?: string
  maxSizeMB?: number
  acceptedTypes?: string
  defaultImage?: string
  className?: string
}

export function ImageUploader({
  onUploadComplete,
  onUploadError,
  folder = "uploads",
  maxSizeMB = 5,
  acceptedTypes = "image/jpeg,image/png,image/webp",
  defaultImage,
  className,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`,
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Accepted file types: ${acceptedTypes.replace(/image\//g, "")}`,
        variant: "destructive",
      })
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload file
    try {
      setIsUploading(true)

      // Simulate progress (since Vercel Blob doesn't provide progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      const result = await uploadToBlob(file, folder)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (onUploadComplete) {
        onUploadComplete(result.url)
      }

      toast({
        title: "Upload complete",
        description: "Your image has been uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      if (onUploadError && error instanceof Error) {
        onUploadError(error)
      }

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (onUploadComplete) {
      onUploadComplete("")
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            {previewUrl ? (
              <div className="relative w-full aspect-square max-w-xs mx-auto">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full aspect-square max-w-xs mx-auto border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 text-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop an image, or click to browse</p>
                <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, WebP</p>
                <p className="text-xs text-muted-foreground">Max size: {maxSizeMB}MB</p>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">Uploading... {Math.round(uploadProgress)}%</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <div className="flex gap-2">
              <Input
                id="image-upload"
                type="file"
                accept={acceptedTypes}
                onChange={handleFileChange}
                disabled={isUploading}
                ref={fileInputRef}
                className="flex-1"
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

