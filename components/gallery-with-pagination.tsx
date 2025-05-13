"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { X, Pencil, Trash2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"
import { ConfirmationDialog } from "./confirmation-dialog"
import { EditImageModal } from "./edit-image-modal"
import { useToast } from "@/hooks/use-toast"

interface GalleryImage {
  id: string
  title: string
  description?: string
  url: string
  created_at: string
  user_id?: string
}

interface GalleryWithPaginationProps {
  initialImages: GalleryImage[]
  totalCount: number
  isLoggedIn?: boolean
  userId?: string
}

export default function GalleryWithPagination({
  initialImages,
  totalCount,
  isLoggedIn = false,
  userId = "",
}: GalleryWithPaginationProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialImages.length < totalCount)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [imageToEdit, setImageToEdit] = useState<GalleryImage | null>(null)

  const loaderRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const timelineRefs = useRef<Map<string, gsap.core.Timeline>>(new Map())
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const ITEMS_PER_PAGE = 12

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

      // Clean up any existing timelines
      timelineRefs.current.forEach((timeline) => {
        timeline.kill()
      })
      timelineRefs.current.clear()

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

  const handleMouseEnter = (imageId: string, element: HTMLElement) => {
    const overlay = element.querySelector(".image-overlay") as HTMLElement
    const descChars = element.querySelectorAll(".desc-char")
    const actionButtons = element.querySelector(".action-buttons") as HTMLElement

    // Kill any existing timeline for this element
    if (timelineRefs.current.has(imageId)) {
      timelineRefs.current.get(imageId)?.kill()
    }

    // Reset all elements to their initial state
    gsap.set(overlay, { opacity: 0 })
    gsap.set(descChars, { opacity: 0, y: 10 })
    if (actionButtons) {
      gsap.set(actionButtons, { opacity: 0, y: -10 })
    }

    // Create a new timeline
    const tl = gsap.timeline()
    timelineRefs.current.set(imageId, tl)

    // Add animation for the overlay
    tl.to(overlay, {
      opacity: 1,
      duration: 0.3,
    })

    // Add animation for action buttons if they exist
    if (actionButtons) {
      tl.to(
        actionButtons,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.2",
      )
    }

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
    const actionButtons = element.querySelector(".action-buttons") as HTMLElement

    // Immediately set elements to their initial state
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
    })

    gsap.to(descChars, {
      opacity: 0,
      duration: 0.1,
    })

    if (actionButtons) {
      gsap.to(actionButtons, {
        opacity: 0,
        duration: 0.1,
      })
    }

    // Kill the timeline
    if (timelineRefs.current.has(imageId)) {
      timelineRefs.current.get(imageId)?.kill()
      timelineRefs.current.delete(imageId)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, image: GalleryImage) => {
    e.stopPropagation()
    setImageToDelete(image)
    setDeleteConfirmOpen(true)
  }

  const handleEditClick = (e: React.MouseEvent, image: GalleryImage) => {
    e.stopPropagation()
    setImageToEdit(image)
    setEditModalOpen(true)
  }

  const deleteImage = async () => {
    if (!imageToDelete) return

    try {
      // Extract the path from the URL
      const url = new URL(imageToDelete.url)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)/)
      const storagePath = pathMatch ? pathMatch[1] : null

      if (storagePath) {
        // Delete the file from storage
        const { error: storageError } = await supabase.storage.from("images").remove([storagePath])

        if (storageError) {
          throw storageError
        }
      }

      // Delete the database entry
      const { error: dbError } = await supabase.from("images").delete().eq("id", imageToDelete.id)

      if (dbError) {
        throw dbError
      }

      // Update the UI
      setImages((prevImages) => prevImages.filter((img) => img.id !== imageToDelete.id))

      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Failed to delete the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateImage = async (id: string, title: string, description: string) => {
    try {
      const { error } = await supabase.from("images").update({ title, description }).eq("id", id)

      if (error) {
        throw error
      }

      // Update the UI
      setImages((prevImages) => prevImages.map((img) => (img.id === id ? { ...img, title, description } : img)))

      // If this image is currently selected in the modal, update it
      if (selectedImage && selectedImage.id === id) {
        setSelectedImage({ ...selectedImage, title, description })
      }

      toast({
        title: "Image updated",
        description: "The image details have been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating image:", error)
      toast({
        title: "Error",
        description: "Failed to update the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  // If no images are provided, use placeholders
  const displayImages =
    images.length > 0
      ? images
      : Array(6)
          .fill(null)
          .map((_, i) => ({
            id: `placeholder-${i}`,
            title: `Placeholder Image ${i + 1}`,
            description: `This is a placeholder description for image ${i + 1}`,
            url: `/placeholder.svg?height=${i % 2 === 0 ? 800 : 1200}&width=${i % 2 === 0 ? 1200 : 800}`,
            created_at: new Date().toISOString(),
          }))

  const canEditImage = (image: GalleryImage) => {
    return isLoggedIn && (userId === image.user_id || !image.user_id)
  }

  return (
    <>
      <div ref={galleryRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayImages.map((image, index) => (
          <div
            key={image.id}
            className={`overflow-hidden rounded-lg cursor-pointer ${
              index >= initialImages.length && page > 1 ? "new-gallery-item" : "gallery-item"
            }`}
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
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-white text-left">{image.title}</h3>

                  {/* Action buttons - only visible when logged in */}
                  {canEditImage(image) && (
                    <div className="action-buttons flex space-x-2 opacity-0">
                      <button
                        onClick={(e) => handleEditClick(e, image)}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        aria-label="Edit image"
                      >
                        <Pencil className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, image)}
                        className="p-1.5 bg-white/20 hover:bg-red-500/70 rounded-full transition-colors"
                        aria-label="Delete image"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>

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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedImage.title}</h2>

                {canEditImage(selectedImage) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(e, selectedImage)
                      }}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                      aria-label="Edit image"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(e, selectedImage)
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      aria-label="Delete image"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>

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

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={deleteImage}
      />

      {/* Edit image modal */}
      {imageToEdit && (
        <EditImageModal image={imageToEdit} open={editModalOpen} onOpenChange={setEditModalOpen} onSave={updateImage} />
      )}
    </>
  )
}
