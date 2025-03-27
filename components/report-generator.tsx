"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, AlertCircle, Check, Download, Mail, FileUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type ReportGeneratorProps = {
  forecastResults: any
}

export function ReportGenerator({ forecastResults }: ReportGeneratorProps) {
  const [reportName, setReportName] = useState(`${forecastResults.name} Report`)
  const [reportType, setReportType] = useState("cost-forecast")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(true)
  const [notes, setNotes] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [reportGenerated, setReportGenerated] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationError(null)
    let interval: NodeJS.Timeout | undefined = undefined

    try {
      // Simulate progress
      interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 100)

      // Call API to generate report
      const response = await fetch("/api/forecasting/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          forecastResults,
          reportName,
          reportType,
          includeCharts,
          includeRawData,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const result = await response.json()

      clearInterval(interval)
      setGenerationProgress(100)

      setTimeout(() => {
        setIsGenerating(false)
        setReportGenerated(true)
        toast({
          title: "Report generated",
          description: `${reportName} has been generated successfully`,
        })
      }, 500)
    } catch (error) {
      clearInterval(interval)
      setGenerationError(error instanceof Error ? error.message : "Failed to generate report")
      setIsGenerating(false)
    }
  }

  const downloadReport = () => {
    toast({
      title: "Report downloaded",
      description: "Your report has been downloaded",
    })
  }

  const emailReport = async () => {
    if (!recipientEmail) {
      toast({
        title: "Email required",
        description: "Please enter a recipient email address",
        variant: "destructive",
      })
      return
    }

    try {
      // Call API to email report
      const response = await fetch("/api/forecasting/email-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportName,
          recipientEmail,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to email report")
      }

      toast({
        title: "Report emailed",
        description: `Report has been sent to ${recipientEmail}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to email report",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Reports</CardTitle>
        <CardDescription>Create and share reports based on your forecast results</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="share" disabled={!reportGenerated}>
              Share Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter a name for this report"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost-forecast">Cost Forecast Report</SelectItem>
                    <SelectItem value="project-planning">Project Planning Report</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {reportType === "cost-forecast"
                    ? "Detailed analysis of forecasted costs with trends and insights"
                    : "Project planning report with cost projections and resource allocation recommendations"}
                </p>
              </div>

              <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-medium mb-2">Report Options</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="include-charts">Include Charts</Label>
                    <p className="text-sm text-muted-foreground">Add visual charts and graphs to the report</p>
                  </div>
                  <Switch id="include-charts" checked={includeCharts} onCheckedChange={setIncludeCharts} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="include-raw-data">Include Raw Data</Label>
                    <p className="text-sm text-muted-foreground">Include detailed tables with raw forecast data</p>
                  </div>
                  <Switch id="include-raw-data" checked={includeRawData} onCheckedChange={setIncludeRawData} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or context for this report"
                  rows={4}
                />
              </div>
            </div>

            {generationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{generationError}</AlertDescription>
              </Alert>
            )}

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Generating report...</span>
                  <span className="text-sm font-medium">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>
            )}

            {reportGenerated && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Report Generated</AlertTitle>
                <AlertDescription>
                  Your report has been generated successfully. You can now download or share it.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="share" className="space-y-4">
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Report Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Report Name</p>
                    <p className="font-medium">{reportName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Report Type</p>
                    <p className="font-medium">
                      {reportType === "cost-forecast" ? "Cost Forecast Report" : "Project Planning Report"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Based On</p>
                    <p className="font-medium">{forecastResults.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Forecast Range</p>
                    <p className="font-medium">{forecastResults.range} months</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-email">Email Report To</Label>
                <div className="flex gap-2">
                  <Input
                    id="recipient-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="flex-1"
                  />
                  <Button onClick={emailReport} disabled={!recipientEmail} className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Send the report directly to stakeholders via email</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={downloadReport} variant="outline" className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  Download as PDF
                </Button>

                <Button onClick={downloadReport} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download as CSV
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={generateReport}
          disabled={isGenerating || !reportName || reportGenerated}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </CardFooter>
    </Card>
  )
}

