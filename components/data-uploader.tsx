"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUp, AlertCircle, Check, Table } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

type DataUploaderProps = {
  onDataUploaded: (data: any) => void
}

export function DataUploader({ onDataUploaded }: DataUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[] | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadError(null)

      // Preview CSV file
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const csvData = event.target?.result as string
          const rows = csvData.split("\n")
          const headers = rows[0].split(",")

          // Check if required columns exist
          if (!headers.includes("date") || !headers.includes("cost")) {
            setUploadError("CSV must contain 'date' and 'cost' columns")
            return
          }

          // Parse a few rows for preview
          const previewRows = []
          for (let i = 1; i < Math.min(rows.length, 6); i++) {
            if (rows[i].trim()) {
              const cells = rows[i].split(",")
              const rowData: Record<string, string> = {}

              headers.forEach((header, index) => {
                rowData[header.trim()] = cells[index]?.trim() || ""
              })

              previewRows.push(rowData)
            }
          }

          setPreviewData(previewRows)
        } catch (error) {
          setUploadError("Failed to parse CSV file")
          console.error(error)
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  const uploadFile = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      // Read file content
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const csvData = event.target?.result as string
          const rows = csvData.split("\n")
          const headers = rows[0].split(",")

          // Process data
          const processedData = []
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim()) {
              const cells = rows[i].split(",")
              const rowData: Record<string, string> = {}

              headers.forEach((header, index) => {
                rowData[header.trim()] = cells[index]?.trim() || ""
              })

              processedData.push(rowData)
            }
          }

          // Upload to API endpoint
          const response = await fetch("/api/forecasting/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: processedData }),
          })

          if (!response.ok) {
            throw new Error("Failed to upload data")
          }

          const result = await response.json()

          clearInterval(interval)
          setUploadProgress(100)

          setTimeout(() => {
            toast({
              title: "Data uploaded successfully",
              description: `${processedData.length} records processed`,
            })

            onDataUploaded(result.data)
          }, 500)
        } catch (error) {
          clearInterval(interval)
          setUploadError(error instanceof Error ? error.message : "Failed to upload data")
          console.error(error)
        } finally {
          setIsUploading(false)
        }
      }

      reader.readAsText(file)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload data")
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Historical Data</CardTitle>
        <CardDescription>Upload a CSV file containing historical material and labor cost data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="preview" disabled={!previewData}>
              Data Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csv-upload">CSV File</Label>
              <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
              <p className="text-sm text-muted-foreground">File must contain at least 'date' and 'cost' columns</p>
            </div>

            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uploading...</span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {file && !isUploading && !uploadError && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Ready to upload</AlertTitle>
                <AlertDescription>
                  File "{file.name}" ({(file.size / 1024).toFixed(2)} KB) is ready to be processed
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="preview">
            {previewData && (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table>
                    <thead>
                      <tr className="bg-muted/50">
                        {Object.keys(previewData[0]).map((header) => (
                          <th key={header} className="whitespace-nowrap px-4 py-2 text-left font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t">
                          {Object.values(row).map((cell, cellIndex) => (
                            <td key={cellIndex} className="whitespace-nowrap px-4 py-2">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <div className="p-2 text-sm text-muted-foreground">
                  Showing {previewData.length} of {file?.name} rows
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={uploadFile}
          disabled={!file || isUploading || !!uploadError}
          className="flex items-center gap-2"
        >
          <FileUp className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload Data"}
        </Button>
      </CardFooter>
    </Card>
  )
}

