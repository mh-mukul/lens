"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  // Modified splitText function to preserve word spacing
  const splitText = (text: string) => {
    // Split the text into words
    const words = text.split(" ")

    // Process each word
    return words.map((word, wordIndex) => (
      <span key={`word-${wordIndex}`} className="inline-block">
        {/* Split each word into characters */}
        {word.split("").map((char, charIndex) => (
          <span key={`char-${wordIndex}-${charIndex}`} className="inline-block opacity-0 hero-char">
            {char}
          </span>
        ))}
        {/* Add a space after each word except the last one */}
        {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
      </span>
    ))
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Text animation
    const tl = gsap.timeline()

    tl.to(".hero-char", {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      duration: 0.5,
      ease: "power2.out",
    })

    tl.to(
      ".hero-subtitle",
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.4",
    )

    tl.to(
      ".hero-button",
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.4",
    )

    // Parallax effect
    if (heroRef.current) {
      gsap.to(".hero-image", {
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="hero-image absolute inset-0 opacity-40">
          <Image
            src="https://rsnyriwbzvtprtcbtimc.supabase.co/storage/v1/object/public/images/669bce51-4d7d-44b9-8095-94761b27d965/669bce51-4d7d-44b9-8095-94761b27d965-cirp33gn4ft.jpg"
            alt="Hero background"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background"></div>
      </div>

      <div className="container mx-auto px-4 z-10 pt-20">
        <div ref={textRef} className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            {splitText("Capturing moments that last forever")}
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground mb-8 opacity-0 transform translate-y-8">
            Professional photography that tells your unique story
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/gallery">
              <Button className="hero-button opacity-0 transform translate-y-8" size="lg">
                View Gallery
              </Button>
            </Link>
            <Link href="/#contact">
              <Button className="hero-button opacity-0 transform translate-y-8" variant="outline" size="lg">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
