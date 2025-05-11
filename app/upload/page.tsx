import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import UploadForm from "@/components/upload-form"

export default async function UploadPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-4xl md:text-6xl font-bold mb-8">Upload Images</h1>
      <p className="text-xl text-muted-foreground mb-16 max-w-2xl">Add new photographs to your portfolio collection.</p>

      <UploadForm />
    </div>
  )
}
