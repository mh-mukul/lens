"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function FeaturedGallery() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (sectionRef.current) {
      const images = sectionRef.current.querySelectorAll(".gallery-image")

      images.forEach((image, index) => {
        gsap.fromTo(
          image,
          {
            y: 100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: image,
              start: "top bottom-=100",
              end: "bottom center",
              toggleActions: "play none none none",
            },
          },
        )
      })

      gsap.fromTo(
        ".gallery-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gallery-title",
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
  }, [])

  const featuredImages = [
    { src: "/placeholder.svg?height=600&width=800", alt: "Landscape photography" },
    { src: "/placeholder.svg?height=800&width=600", alt: "Portrait photography" },
    { src: "/placeholder.svg?height=600&width=800", alt: "Street photography" },
    { src: "/placeholder.svg?height=800&width=600", alt: "Architecture photography" },
    { src: "/placeholder.svg?height=600&width=800", alt: "Nature photography" },
    { src: "/placeholder.svg?height=800&width=600", alt: "Event photography" },
  ]

  return (
    <section ref={sectionRef} className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="gallery-title text-3xl md:text-5xl font-bold mb-4">Featured Work</h2>
          <p className="gallery-title text-lg text-muted-foreground max-w-2xl mx-auto">
            A selection of my best photographs from various projects and categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredImages.map((image, index) => (
            <div key={index} className="gallery-image overflow-hidden rounded-lg">
              <div className="relative aspect-[4/5] group">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <h3 className="text-xl font-semibold mb-2">{image.alt}</h3>
                    <p className="text-sm text-white/80">View details</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/gallery">
            <Button size="lg">View All Work</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
