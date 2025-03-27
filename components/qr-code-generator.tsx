"use client"

import { useState, useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Download } from "lucide-react"

type QRCodeGeneratorProps = {
  serialNumber: string
  toolName: string
  baseUrl?: string
}

export function QRCodeGenerator({ serialNumber, toolName, baseUrl = "" }: QRCodeGeneratorProps) {
  const [size, setSize] = useState(200)
  const qrRef = useRef<HTMLDivElement>(null)

  // Get the current hostname or use the provided baseUrl
  const hostname = typeof window !== "undefined" ? window.location.origin : baseUrl || "https://yourapp.com"

  const qrUrl = `${hostname}/tools/${serialNumber}`

  const downloadQRCode = () => {
    if (!qrRef.current) return

    try {
      const canvas = qrRef.current.querySelector("canvas")
      if (!canvas) return

      const link = document.createElement("a")
      link.download = `qr-${serialNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download the QR code.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div ref={qrRef} className="bg-white p-4 rounded-lg border mb-4">
          <QRCodeCanvas
            value={qrUrl}
            size={size}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "/placeholder.svg?height=24&width=24",
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>
        <div className="text-center mb-4">
          <p className="font-medium">{serialNumber}</p>
          <p className="text-sm text-muted-foreground">{toolName}</p>
        </div>
        <Button onClick={downloadQRCode} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  )
}

