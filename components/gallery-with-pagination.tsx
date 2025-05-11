"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"

interface GalleryImage {
  id: string
  title: string
  description?: string
  url: string
  created_at: string
}

interface GalleryWithPaginationProps {
  initialImages: GalleryImage[]
  totalCount: number
}

export default function GalleryWithPagination({ initialImages, totalCount }: GalleryWithPaginationProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialImages.length < totalCount)
  const loaderRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Set up intersection observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          loadMoreImages()
        }
      },
      { threshold: 0.1 },
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [hasMore, loading])

  // Animation for new images
  useEffect(() => {
    const newItems = document.querySelectorAll(".new-gallery-item")

    if (newItems.length > 0) {
      gsap.fromTo(
        newItems,
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
        },
      )
    }
  }, [images.length])

  const loadMoreImages = async () => {
    if (loading || !hasMore) return

    setLoading(true)

    try {
      const start = page * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE - 1

      const { data: newImages } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false })
        .range(start, end)

      if (newImages && newImages.length > 0) {
        setImages((prevImages) => [...prevImages, ...newImages])
        setPage((prevPage) => prevPage + 1)
        setHasMore(newImages.length === ITEMS_PER_PAGE)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more images:", error)
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => setSelectedImage(null)

  // If no images are provided, use placeholders
  const displayImages =
    images.length > 0
      ? images
      : Array(6)
          .fill(null)
          .map((_, i) => ({
            id: `placeholder-${i}`,
            title: `Placeholder Image ${i + 1}`,
            url: `/placeholder.svg?height=${i % 2 === 0 ? 800 : 1200}&width=${i % 2 === 0 ? 1200 : 800}`,
            created_at: new Date().toISOString(),
          }))

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayImages.map((image, index) => (
          <div
            key={image.id}
            className={`overflow-hidden rounded-lg cursor-pointer ${
              index >= initialImages.length && page > 1 ? "new-gallery-item" : "gallery-item"
            }`}
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

      {/* Loader reference element */}
      <div ref={loaderRef} className="py-8 flex justify-center">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
        {!loading && hasMore && <div className="h-8" />}
        {!hasMore && images.length > 0 && (
          <p className="text-muted-foreground">You've reached the end of the gallery</p>
        )}
      </div>

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
