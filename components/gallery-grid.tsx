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

    return () => {
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
            url: "/placeholder.svg?height=800&width=1200",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Portrait",
            url: "/placeholder.svg?height=1200&width=800",
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            title: "City Skyline",
            url: "/placeholder.svg?height=800&width=1200",
            created_at: new Date().toISOString(),
          },
          {
            id: "4",
            title: "Nature Close-up",
            url: "/placeholder.svg?height=1200&width=800",
            created_at: new Date().toISOString(),
          },
          {
            id: "5",
            title: "Beach Sunset",
            url: "/placeholder.svg?height=800&width=1200",
            created_at: new Date().toISOString(),
          },
          {
            id: "6",
            title: "Wildlife",
            url: "/placeholder.svg?height=1200&width=800",
            created_at: new Date().toISOString(),
          },
        ]

  const closeModal = () => setSelectedImage(null)

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayImages.map((image) => (
          <div
            key={image.id}
            className="gallery-item overflow-hidden rounded-lg cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative aspect-[4/3] group">
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <h3 className="text-xl font-semibold">{image.title}</h3>
                  {image.description && <p className="text-sm mt-2">{image.description}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showViewAll && images.length > 0 && (
        <div className="text-center mt-12">
          <Link href="/gallery">
            <Button size="lg">View All Work</Button>
          </Link>
        </div>
      )}

      {/* Custom modal for better image display */}
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
