"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X } from "lucide-react"

export default function UploadForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) {
      setFile(null)
      setPreview(null)
      return
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select an image to upload")
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to upload images")
      }

      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError, data } = await supabase.storage.from("images").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath)

      // Save image metadata to database
      const { error: dbError } = await supabase.from("images").insert({
        title,
        description,
        url: publicUrl,
        user_id: user.id,
      })

      if (dbError) {
        throw dbError
      }

      // Reset form
      setTitle("")
      setDescription("")
      setFile(null)
      setPreview(null)
      setSuccess(true)

      // Refresh the page after 2 seconds
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error("Error uploading image:", err)
      setError(err instanceof Error ? err.message : "An error occurred while uploading the image")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Image Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter a title for your image"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description for your image"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>

            {!preview ? (
              <div className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <Label htmlFor="image" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <span className="text-lg font-medium">Click to upload an image</span>
                  <span className="text-sm text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</span>
                </Label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="max-h-[300px] rounded-lg mx-auto object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md">{error}</div>
          )}

          {success && (
            <div className="p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md text-center">
              Image uploaded successfully!
            </div>
          )}

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
