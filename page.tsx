"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Upload, Download, Eraser, ImageIcon } from "lucide-react"
import { toast } from "sonner"

export default function ImageBackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveBackground = async () => {
    if (!originalImage) return

    try {
      setIsLoading(true)

      const response = await fetch(originalImage)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append("image", blob)

      const res = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to remove background")
      }

      const data = await res.json()
      setProcessedImage(data.image)
      toast.success("Background removed successfully!")
    } catch (error) {
      console.error("Error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to remove background")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!processedImage) return

    try {
      const link = document.createElement("a")
      link.href = processedImage
      link.download = "removed-background.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
      toast.error("Failed to download image")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-black">Background Remover</h1>

        <div className="mb-8 flex justify-center">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" ref={fileInputRef} />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Original Image</h2>
              {originalImage ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={originalImage || "/placeholder.svg"}
                    alt="Original"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-16 w-16" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Processed Image</h2>
              {processedImage ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={processedImage || "/placeholder.svg"}
                    alt="Processed"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-16 w-16 animate-spin" />
                      <p>Removing background...</p>
                    </div>
                  ) : (
                    <Eraser className="h-16 w-16" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button
            onClick={handleRemoveBackground}
            disabled={!originalImage || isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Eraser className="mr-2 h-4 w-4" />
                Remove Background
              </>
            )}
          </Button>

          {processedImage && (
            <Button
              onClick={handleDownload}
              variant="secondary"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

