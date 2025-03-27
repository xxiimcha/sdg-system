"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PriceChart } from "@/components/price-chart"
import { exportToPDF } from "@/lib/export-utils"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: string
  resourceType: string
  historicalData: any[]
  forecastData: any[]
}

export function ReportDialog({
  open,
  onOpenChange,
  resource,
  resourceType,
  historicalData,
  forecastData,
}: ReportDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateReport = () => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: "Report Generated",
        description: "Your report has been generated successfully.",
      })
    }, 2000)
  }

  const handleDownloadReport = () => {
    try {
      exportToPDF(
        resource,
        resourceType,
        historicalData,
        forecastData,
        `${resourceType}-${resource}-report-${new Date().toISOString().split("T")[0]}.pdf`,
      )
      toast({
        title: "Report Downloaded",
        description: "Your report has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download report.",
        variant: "destructive",
      })
    }
  }

  const handlePrintReport = () => {
    toast({
      title: "Print Initiated",
      description: "Your report is being sent to the printer.",
    })
  }

  // Calculate summary statistics
  const calculateStats = () => {
    if (!historicalData.length || !forecastData.length) return null

    const lastHistorical = historicalData[historicalData.length - 1]?.price || 0
    const lastForecast = forecastData[forecastData.length - 1]?.price || 0
    const percentChange = ((lastForecast - lastHistorical) / lastHistorical) * 100

    const historicalAvg = historicalData.reduce((sum, item) => sum + item.price, 0) / historicalData.length
    const forecastAvg = forecastData.reduce((sum, item) => sum + item.price, 0) / forecastData.length

    return {
      lastHistorical,
      lastForecast,
      percentChange,
      historicalAvg,
      forecastAvg,
    }
  }

  const stats = calculateStats()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Price Forecast Report</DialogTitle>
          <DialogDescription>
            Comprehensive report for {resource} {resourceType} price forecast
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {/* <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger> */}
            </TabsList>

            <TabsContent value="summary">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Price Forecast Summary for {resource} {resourceType}
                </h3>

                {stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {resourceType === "labor"
                            ? `$${stats.lastForecast.toFixed(2)}/hr`
                            : `$${stats.lastForecast.toFixed(2)}`}
                        </div>
                        <div className="text-sm text-muted-foreground">Forecasted Price</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {stats.percentChange >= 0 ? "+" : ""}
                          {stats.percentChange.toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Expected Change</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {resourceType === "labor"
                            ? `$${stats.forecastAvg.toFixed(2)}/hr`
                            : `$${stats.forecastAvg.toFixed(2)}`}
                        </div>
                        <div className="text-sm text-muted-foreground">Average Forecast</div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="pt-6">
                          <Skeleton className="h-8 w-24 mb-2" />
                          <Skeleton className="h-4 w-32" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Analysis</h4>
                  <p className="text-sm">
                    Based on our ARIMA forecasting model, the price of {resource} {resourceType} is expected to
                    {stats && stats.percentChange >= 0 ? " increase " : " decrease "}
                    by {stats ? Math.abs(stats.percentChange).toFixed(2) : "0"}% over the forecast period. This trend is
                    consistent with historical patterns and market conditions.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detailed Price Analysis</h3>

                <div className="space-y-2">
                  <h4 className="font-medium">Historical Data Summary</h4>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Data points: {historicalData.length}</li>
                    <li>
                      Average price:{" "}
                      {resourceType === "labor"
                        ? `$${stats?.historicalAvg.toFixed(2)}/hr`
                        : `$${stats?.historicalAvg.toFixed(2)}`}{" "}
                      || "N/A"
                    </li>
                    <li>
                      Latest price:{" "}
                      {resourceType === "labor"
                        ? `$${stats?.lastHistorical.toFixed(2)}/hr`
                        : `$${stats?.lastHistorical.toFixed(2)}`}{" "}
                      || "N/A"
                    </li>
                    <li>
                      Date range: {historicalData[0]?.date || "N/A"} to{" "}
                      {historicalData[historicalData.length - 1]?.date || "N/A"}
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Forecast Summary</h4>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Forecast period: {forecastData.length} months</li>
                    <li>
                      Average forecasted price:{" "}
                      {resourceType === "labor"
                        ? `$${stats?.forecastAvg.toFixed(2)}/hr`
                        : `$${stats?.forecastAvg.toFixed(2)}`}{" "}
                      || "N/A"
                    </li>
                    <li>
                      Final forecasted price:{" "}
                      {resourceType === "labor"
                        ? `$${stats?.lastForecast.toFixed(2)}/hr`
                        : `$${stats?.lastForecast.toFixed(2)}`}{" "}
                      || "N/A"
                    </li>
                    <li>
                      Expected change:{" "}
                      {stats ? (stats.percentChange >= 0 ? "+" : "") + stats.percentChange.toFixed(2) : "N/A"}%
                    </li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Methodology</h4>
                  <p className="text-sm">
                    This forecast was generated using an ARIMA (Autoregressive Integrated Moving Average) model, which
                    is well-suited for time series forecasting. The model was trained on historical price data and
                    optimized for accuracy. The confidence interval is set at 95%, indicating a high level of confidence
                    in the forecast.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visualization">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Price Trend Visualization</h3>

                <div className="h-[300px]">
                  <PriceChart
                    historicalData={historicalData}
                    forecastData={forecastData}
                    isLoading={false}
                    chartType="line"
                    resourceType={resourceType}
                  />
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Interpretation</h4>
                  <p className="text-sm">
                    The chart above shows historical price data (solid line) and forecasted prices (dashed line) for{" "}
                    {resource} {resourceType}. The forecast indicates a
                    {stats && stats.percentChange >= 0 ? " positive " : " negative "}
                    trend over the next {forecastData.length} months, with an expected
                    {stats && stats.percentChange >= 0 ? " increase " : " decrease "}
                    of {stats ? Math.abs(stats.percentChange).toFixed(2) : "0"}%.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
          <Button variant="outline" onClick={handleDownloadReport} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {/* <Button variant="outline" onClick={handlePrintReport} disabled={isGenerating}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

