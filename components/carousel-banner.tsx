"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CarouselBannerProps {
  images: {
    src: string
    alt: string
    title?: string
    description?: string
    buttonText?: string
    buttonLink?: string
  }[]
  autoPlay?: boolean
  interval?: number
}

export function CarouselBanner({ images, autoPlay = true, interval = 5000 }: CarouselBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    if (!autoPlay) return

    const intervalId = setInterval(goToNext, interval)
    return () => clearInterval(intervalId)
  }, [autoPlay, interval])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0",
            )}
          >
            <div className="absolute inset-0 bg-black/30 z-10" />
            <img src={image.src || "/placeholder.svg"} alt={image.alt} className="h-full w-full object-cover" />
            {(image.title || image.description) && (
              <div className="absolute bottom-0 left-0 right-0 top-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
                {image.title && <h2 className="text-2xl md:text-4xl font-bold mb-2">{image.title}</h2>}
                {image.description && <p className="text-sm md:text-lg max-w-md mb-4">{image.description}</p>}
                {image.buttonText && image.buttonLink && (
                  <Button asChild className="mt-2">
                    <a href={image.buttonLink}>{image.buttonText}</a>
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/30 hover:bg-white/50"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/30 hover:bg-white/50"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next slide</span>
      </Button>

      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentIndex ? "bg-white w-4" : "bg-white/50",
            )}
            onClick={() => goToSlide(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

