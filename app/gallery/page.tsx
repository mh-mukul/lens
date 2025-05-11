import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ScrollReveal } from "@/components/scroll-reveal"
import GalleryWithPagination from "@/components/gallery-with-pagination"

export default async function GalleryPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Initial fetch of images (first page)
  const { data: initialImages, count } = await supabase
    .from("images")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, 11) // Fetch first 12 images (0-11)

  return (
    <div className="container mx-auto px-4 py-24">
      <ScrollReveal>
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Gallery</h1>
        <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
          Explore my collection of photographs capturing moments of beauty and emotion.
        </p>
      </ScrollReveal>

      <GalleryWithPagination initialImages={initialImages || []} totalCount={count || 0} />
    </div>
  )
}
