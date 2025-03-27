"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LineChart, AlertCircle, Check, Download, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ForecastResultsProps = {
  model: any
  onForecastComplete: (results: any) => void
}

export function ForecastResults({ model, onForecastComplete }: ForecastResultsProps) {
  const [forecastName, setForecastName] = useState("Forecast " + new Date().toLocaleDateString())
  const [forecastRange, setForecastRange] = useState(12)
  const [isForecasting, setIsForecasting] = useState(false)
  const [forecastProgress, setForecastProgress] = useState(0)
  const [forecastError, setForecastError] = useState<string | null>(null)
  const [forecastData, setForecastData] = useState<any>(null)

  const runForecast = async () => {
    setIsForecasting(true)
    setForecastProgress(0)
    setForecastError(null)

    let interval: NodeJS.Timeout | null = null
    try {
      // Simulate progress
      interval = setInterval(() => {
        setForecastProgress((prev) => {
          if (prev >= 95) {
            if (interval) {
              if (interval !== null) {
                if (interval !== null) {
                  clearInterval(interval)
                }
              }
            }
            return prev
          }
          return prev + 5
        })
      }, 100)

      // Call API to generate forecast
      const response = await fetch("/api/forecasting/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          forecastRange,
          forecastName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate forecast")
      }

      const result = await response.json()

      clearInterval(interval)
      setForecastProgress(100)

      setForecastData(result.forecast)

      setTimeout(() => {
        setIsForecasting(false)
        toast({
          title: "Forecast generated",
          description: `${forecastRange} months of cost predictions generated`,
        })
      }, 500)
    } catch (error) {
      // clearInterval(interval)
      setForecastError(error instanceof Error ? error.message : "Failed to generate forecast")
      setIsForecasting(false)
    }
  }

  const handleSaveForecast = () => {
    if (forecastData) {
      onForecastComplete({
        name: forecastName,
        range: forecastRange,
        data: forecastData,
        model,
      })

      toast({
        title: "Forecast saved",
        description: "You can now generate reports based on this forecast",
      })
    }
  }

  const downloadCSV = () => {
    if (!forecastData) return

    // Create CSV content
    const headers = ["Date", "Forecasted Cost"]
    const rows = forecastData.map((item: any) => [item.date, item.cost])

    const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${forecastName.replace(/\s+/g, "_")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "CSV Downloaded",
      description: "Forecast data has been downloaded as CSV",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Forecast</CardTitle>
        <CardDescription>Generate cost forecasts based on your trained ARIMA model</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Forecast Settings</TabsTrigger>
            <TabsTrigger value="results" disabled={!forecastData}>
              Forecast Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forecast-name">Forecast Name</Label>
                <Input
                  id="forecast-name"
                  value={forecastName}
                  onChange={(e) => setForecastName(e.target.value)}
                  placeholder="Enter a name for this forecast"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="forecast-range">Forecast Range: {forecastRange} months</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setForecastRange(Math.max(1, forecastRange - 1))}
                      disabled={forecastRange === 1}
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setForecastRange(Math.min(24, forecastRange + 1))}
                      disabled={forecastRange === 24}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Slider
                  id="forecast-range"
                  min={1}
                  max={24}
                  step={1}
                  value={[forecastRange]}
                  onValueChange={(value) => setForecastRange(value[0])}
                />
                <p className="text-sm text-muted-foreground">How many months into the future to forecast costs</p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Model Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ARIMA Parameters</p>
                    <p className="text-lg font-medium">
                      ({model.parameters.p}, {model.parameters.d}, {model.parameters.q})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model Accuracy (RMSE)</p>
                    <p className="text-lg font-medium">{model.rmse.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            </div>

            {forecastError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{forecastError}</AlertDescription>
              </Alert>
            )}

            {isForecasting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Generating forecast...</span>
                  <span className="text-sm font-medium">{forecastProgress}%</span>
                </div>
                <Progress value={forecastProgress} className="w-full" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="results">
            {forecastData && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  {/* This would be replaced with an actual chart component */}
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Forecast Visualization</p>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Forecasted Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {forecastData.slice(0, 10).map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell className="text-right">${Number.parseFloat(item.cost).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {forecastData.length > 10 && (
                    <div className="p-2 text-sm text-muted-foreground">Showing 10 of {forecastData.length} months</div>
                  )}
                </div>

                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Forecast Ready</AlertTitle>
                  <AlertDescription>
                    Your forecast has been generated successfully. You can now save this forecast or download the data
                    as CSV.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={downloadCSV} disabled={!forecastData} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
        <div className="flex gap-2">
          <Button onClick={runForecast} disabled={isForecasting || !forecastName} className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            {isForecasting ? "Generating..." : "Generate Forecast"}
          </Button>

          <Button
            onClick={handleSaveForecast}
            disabled={!forecastData || isForecasting}
            variant="default"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Forecast
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

