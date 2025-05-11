import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Hero from "@/components/hero"
import GalleryGrid from "@/components/gallery-grid"
import About from "@/components/about"
import Contact from "@/components/contact"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  // Fetch images from Supabase
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: images } = await supabase.from("images").select("*").order("created_at", { ascending: false }).limit(6)

  return (
    <div className="min-h-screen">
      <Hero />

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Gallery</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore my collection of photographs capturing moments of beauty and emotion.
              </p>
            </div>
          </ScrollReveal>

          <GalleryGrid images={images || []} />

          {/* <div className="text-center mt-12">
            <Link href="/gallery">
              <Button size="lg">View Full Gallery</Button>
            </Link>
          </div> */}
        </div>
      </section>

      <About />
      <Contact />
    </div>
  )
}
