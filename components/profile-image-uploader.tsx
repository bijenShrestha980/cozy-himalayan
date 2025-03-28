"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ImageUploader } from "@/components/image-uploader"
import { Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileImageUploaderProps {
  currentImageUrl?: string
  onImageChange: (url: string) => void
  userName?: string
}

export function ProfileImageUploader({ currentImageUrl, onImageChange, userName = "User" }: ProfileImageUploaderProps) {
  const [showUploader, setShowUploader] = useState(false)
  const { toast } = useToast()

  const handleUploadComplete = (url: string) => {
    if (url) {
      onImageChange(url)
      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully",
      })
    }
    setShowUploader(false)
  }

  const userInitials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-24 w-24">
            {currentImageUrl ? <AvatarImage src={currentImageUrl} alt={userName} /> : null}
            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background shadow-md"
            onClick={() => setShowUploader(true)}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Change profile picture</span>
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {currentImageUrl ? "Click the camera icon to change your profile picture" : "Add a profile picture"}
        </p>
      </div>

      {showUploader && (
        <div className="mt-4">
          <ImageUploader
            folder="profiles"
            onUploadComplete={handleUploadComplete}
            onUploadError={() => setShowUploader(false)}
            defaultImage={currentImageUrl}
          />
          <div className="flex justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowUploader(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

