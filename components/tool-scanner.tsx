"use client"

import { useState, useRef, useEffect } from "react"
import { QrCode, Camera, Check, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrowserQRCodeReader } from "@zxing/library";

type ScanResult = {
  serialNumber: string
  toolName: string
  status: string
  projectId?: string
  projectName?: string
}

export function ToolScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [action, setAction] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample projects data for the demo
  const projects = [
    { id: "1", name: "Greenview Residence" },
    { id: "2", name: "Skyline Apartments" },
    { id: "3", name: "Oceanview Manor" },
    { id: "4", name: "Sunset Bungalow" },
    { id: "5", name: "Highland Residence" },
  ]

  // Start the camera for QR code scanning
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)

        // In a real app, you would use a QR code scanning library
        // For demo purposes, we'll simulate a scan after 3 seconds
        setTimeout(() => {
          simulateScan()
        }, 3000)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  // Stop the camera
  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  // Simulate a QR code scan (for demo purposes)
  const simulateScan = () => {
    // Capture a frame from the video
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // In a real app, you would process this image to detect QR codes
        // For demo purposes, we'll simulate finding a random tool
        const tools = [
          { serialNumber: "CM-2023-001", toolName: "Concrete Mixer", status: "Available" },
          {
            serialNumber: "JH-2023-005",
            toolName: "Jackhammer",
            status: "Not Available",
            projectId: "1",
            projectName: "Greenview Residence",
          },
          { serialNumber: "PD-2023-012", toolName: "Power Drill", status: "Available" },
          { serialNumber: "CS-2023-008", toolName: "Circular Saw", status: "Under Maintenance" },
        ]

        const randomTool = tools[Math.floor(Math.random() * tools.length)]
        setScanResult(randomTool)
        stopScanner()
      }
    }
  }

  // Process the scan result based on the selected action
  const processAction = async () => {
    if (!scanResult) return

    setIsProcessing(true)

    try {
      // In a real app, you would call your API endpoints
      // For demo purposes, we'll simulate API calls

      if (action === "checkout") {
        if (scanResult.status !== "Available") {
          throw new Error(`Tool is not available (Status: ${scanResult.status})`)
        }

        if (!selectedProject) {
          throw new Error("Please select a project")
        }

        // Simulate API call to assign tool to project
        // await fetch('/api/tool-assignments', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     project_id: selectedProject,
        //     serial_number: scanResult.serialNumber,
        //     assigned_date: new Date().toISOString().split('T')[0]
        //   })
        // })

        toast({
          title: "Tool Checked Out",
          description: `${scanResult.toolName} (${scanResult.serialNumber}) has been assigned to the project.`,
        })
      } else if (action === "checkin") {
        if (scanResult.status !== "Not Available") {
          throw new Error(`Tool is not checked out (Status: ${scanResult.status})`)
        }

        // Simulate API call to return tool
        // const { data: assignments } = await supabase
        //   .from('tool_assignments')
        //   .select('id')
        //   .eq('tool_serial_numbers.serial_number', scanResult.serialNumber)
        //   .eq('status', 'Assigned')
        //   .single()

        // await fetch(`/api/tool-assignments/${assignments.id}`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     status: 'Returned',
        //     return_date: new Date().toISOString().split('T')[0]
        //   })
        // })

        toast({
          title: "Tool Checked In",
          description: `${scanResult.toolName} (${scanResult.serialNumber}) has been returned.`,
        })
      } else if (action === "maintenance") {
        // Simulate API call to schedule maintenance
        // await fetch('/api/maintenance', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     tool_id: '1', // In a real app, you would get this from the scan
        //     serial_number: scanResult.serialNumber,
        //     scheduled_date: new Date().toISOString().split('T')[0],
        //     maintenance_type: 'Repair',
        //     notes: 'Scheduled from QR scan'
        //   })
        // })

        toast({
          title: "Maintenance Scheduled",
          description: `Maintenance has been scheduled for ${scanResult.toolName} (${scanResult.serialNumber}).`,
        })
      }

      // Reset the scanner
      setScanResult(null)
      setAction("")
      setSelectedProject("")
    } catch (error) {
      console.error("Error processing action:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process action",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tool Scanner</CardTitle>
          <CardDescription>Scan tool QR codes to check out, check in, or schedule maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          {!isScanning && !scanResult ? (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-4">
                Scan a tool's QR code to check its status, assign it to a project, or schedule maintenance
              </p>
              <Button onClick={startScanner}>
                <Camera className="mr-2 h-4 w-4" />
                Start Scanner
              </Button>
            </div>
          ) : isScanning ? (
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-70"></div>
              </div>
              <Button variant="secondary" className="absolute bottom-4 right-4" onClick={stopScanner}>
                Cancel
              </Button>
            </div>
          ) : scanResult ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{scanResult.toolName}</h3>
                    <p className="text-sm text-muted-foreground">{scanResult.serialNumber}</p>
                  </div>
                  <Badge
                    className={
                      scanResult.status === "Available"
                        ? "bg-green-100 text-green-800"
                        : scanResult.status === "Not Available"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {scanResult.status}
                  </Badge>
                </div>

                {scanResult.projectId && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Assigned to: </span>
                    <span>{scanResult.projectName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Action</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="What would you like to do?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkout" disabled={scanResult.status !== "Available"}>
                      Check Out Tool
                    </SelectItem>
                    <SelectItem value="checkin" disabled={scanResult.status !== "Not Available"}>
                      Check In Tool
                    </SelectItem>
                    <SelectItem value="maintenance" disabled={scanResult.status === "Under Maintenance"}>
                      Schedule Maintenance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {action === "checkout" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign to Project</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {scanResult && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setScanResult(null)
                  setAction("")
                  setSelectedProject("")
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={processAction}
                disabled={isProcessing || !action || (action === "checkout" && !selectedProject)}
              >
                <Check className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing..." : "Confirm"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

