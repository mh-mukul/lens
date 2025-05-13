"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollReveal } from "./scroll-reveal"

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    if (sectionRef.current) {
      gsap.fromTo(
        ".about-image",
        {
          x: -50,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".about-image",
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

  return (
    <section id="about" ref={sectionRef} className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="about-image">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src="profile.jpg"
                alt="Photographer portrait"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">About Me</h2>
              <p className="text-lg text-muted-foreground mb-6">
                I'm a professional photographer with over 10 years of experience capturing life's most beautiful
                moments.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                My passion for photography began when I was a teenager, and I've been honing my craft ever since. I
                specialize in portrait, landscape, and event photography, bringing a unique perspective to each shot.
              </p>
              <p className="text-lg text-muted-foreground">
                When I'm not behind the camera, you can find me exploring new locations, studying the latest photography
                techniques, or enjoying a cup of coffee at my favorite local café.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
