"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { X } from "lucide-react"

interface GalleryImage {
  id: string
  title: string
  description?: string
  url: string
  created_at: string
}

interface GalleryGridProps {
  images: GalleryImage[]
  showViewAll?: boolean
}

export default function GalleryGrid({ images, showViewAll = true }: GalleryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const timelineRefs = useRef<Map<string, gsap.core.Timeline>>(new Map())

  // Split text helper function (similar to hero component)
  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span
        key={i}
        className="inline-block opacity-0 desc-char"
        style={{ display: char === " " ? "inline" : "inline-block" }}
      >
        {char}
      </span>
    ))
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (gridRef.current) {
      const items = gridRef.current.querySelectorAll(".gallery-item")

      gsap.fromTo(
        items,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top bottom-=100",
            end: "bottom center",
            toggleActions: "play none none none",
          },
        },
      )
    }

    // Clean up any existing timelines
    return () => {
      timelineRefs.current.forEach((timeline) => {
        timeline.kill()
      })
      timelineRefs.current.clear()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [images])

  // If no images are provided, use placeholders
  const displayImages =
    images.length > 0
      ? images
      : [
          {
            id: "1",
            title: "Mountain Landscape",
            description: "Majestic peaks reaching into the clouds at sunrise",
            url: "/placeholder.svg?height=800&width=1200",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Portrait",
            description: "Capturing the essence of human emotion and character",
            url: "/placeholder.svg?height=1200&width=800",
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            title: "City Skyline",
            description: "Urban architecture against a dramatic evening sky",
            url: "/placeholder.svg?height=800&width=1200",
            created_at: new Date().toISOString(),
          },
          {
            id: "4",
            title: "Nature Close-up",
            description: "The intricate details of nature's smallest wonders",
            url: "/placeholder.svg?height=1200&width=800",
            created_at: new Date().toISOString(),
          },
          {
            id: "5",
            title: "Beach Sunset",
            description: "Golden hour reflections on tranquil waters",
            url: "/placeholder.svg?height=800&width=1200",
            created_at: new Date().toISOString(),
          },
          {
            id: "6",
            title: "Wildlife",
            description: "Capturing the spirit and beauty of animals in their natural habitat",
            url: "/placeholder.svg?height=1200&width=800",
            created_at: new Date().toISOString(),
          },
        ]

  const closeModal = () => setSelectedImage(null)

  const handleMouseEnter = (imageId: string, element: HTMLElement) => {
    const overlay = element.querySelector(".image-overlay") as HTMLElement
    const descChars = element.querySelectorAll(".desc-char")

    // Kill any existing timeline for this element
    if (timelineRefs.current.has(imageId)) {
      timelineRefs.current.get(imageId)?.kill()
    }

    // Reset all elements to their initial state
    gsap.set(overlay, { opacity: 0 })
    gsap.set(descChars, { opacity: 0, y: 10 })

    // Create a new timeline
    const tl = gsap.timeline()
    timelineRefs.current.set(imageId, tl)

    // Add animation for the overlay
    tl.to(overlay, {
      opacity: 1,
      duration: 0.3,
    })

    // Add animation for the description characters
    tl.to(
      descChars,
      {
        opacity: 1,
        y: 0,
        stagger: 0.01,
        duration: 0.2,
        ease: "power2.out",
      },
      "-=0.1",
    )
  }

  const handleMouseLeave = (imageId: string, element: HTMLElement) => {
    const overlay = element.querySelector(".image-overlay") as HTMLElement
    const descChars = element.querySelectorAll(".desc-char")

    // Immediately set elements to their initial state
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
    })

    gsap.to(descChars, {
      opacity: 0,
      duration: 0.1,
    })

    // Kill the timeline
    if (timelineRefs.current.has(imageId)) {
      timelineRefs.current.get(imageId)?.kill()
      timelineRefs.current.delete(imageId)
    }
  }

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayImages.map((image) => (
          <div
            key={image.id}
            className="gallery-item overflow-hidden rounded-lg cursor-pointer"
            onClick={() => setSelectedImage(image)}
            onMouseEnter={(e) => handleMouseEnter(image.id, e.currentTarget)}
            onMouseLeave={(e) => handleMouseLeave(image.id, e.currentTarget)}
          >
            <div className="relative aspect-[4/3] group">
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 opacity-0 image-overlay flex flex-col justify-between p-4">
                {/* Title at top left */}
                <h3 className="text-xl font-semibold text-white text-left">{image.title}</h3>

                {/* Description at bottom with character animation */}
                {image.description && (
                  <div className="mt-auto w-full">
                    <p className="text-sm text-white">{splitText(image.description)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showViewAll && images.length > 0 && (
        <div className="text-center mt-12">
          <Link href="/gallery">
            <Button size="lg">View Full Gallery</Button>
          </Link>
        </div>
      )}

      {/* Image modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={closeModal}>
          <div
            className="relative max-w-[90vw] max-h-[90vh] overflow-auto bg-background rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-foreground"
              onClick={closeModal}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedImage.title}</h2>

              <div className="relative">
                <img
                  src={selectedImage.url || "/placeholder.svg"}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-md"
                />
              </div>

              {selectedImage.description && <p className="mt-6 text-muted-foreground">{selectedImage.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
