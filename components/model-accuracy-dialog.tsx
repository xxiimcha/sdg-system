"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportToCSV } from "@/lib/export-utils"

interface ModelAccuracyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource: string
  resourceType: string
  accuracyData: any[]
}

export function ModelAccuracyDialog({
  open,
  onOpenChange,
  resource,
  resourceType,
  accuracyData,
}: ModelAccuracyDialogProps) {
  const { toast } = useToast()

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return resourceType === "labor" ? `$${price.toFixed(2)}/hr` : `$${price.toFixed(2)}`
  }

  // Calculate overall accuracy metrics
  const calculateOverallMetrics = () => {
    if (!accuracyData.length) return { mape: 0, rmse: 0 }

    const totalError = accuracyData.reduce((sum, item) => sum + Math.abs(item.errorPercent), 0)
    const mape = totalError / accuracyData.length

    const squaredErrors = accuracyData.map((item) => {
      const error = item.actualPrice - item.forecastedPrice
      return error * error
    })
    const mse = squaredErrors.reduce((sum, error) => sum + error, 0) / squaredErrors.length
    const rmse = Math.sqrt(mse)

    return { mape, rmse }
  }

  const metrics = calculateOverallMetrics()

  const handleExportAccuracy = () => {
    try {
      exportToCSV(accuracyData, `${resourceType}-${resource}-accuracy-${new Date().toISOString().split("T")[0]}.csv`)
      toast({
        title: "Export Complete",
        description: "Accuracy data has been exported to CSV.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export accuracy data.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Model Accuracy Report</DialogTitle>
          <DialogDescription>
            Accuracy assessment for {resource} {resourceType} price forecasting model
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-2">
          <div className="grid grid-cols-1 md:space-y-2 gap-4">
            <Card>
              <CardContent className="pt-.5">
                <div className="text-sm text-muted-foreground">Mean Absolute Percentage Error (MAPE)</div>
                <div className="text-2xl font-bold">{metrics.mape.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Lower is better. Represents average percentage error.
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Root Mean Square Error (RMSE)</div>
                <div className="text-2xl font-bold">${metrics.rmse.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Lower is better. Represents magnitude of error.
                </div>
              </CardContent>
            </Card> */}
          </div>

          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Forecasted Price</TableHead>
                    <TableHead>Actual Price</TableHead>
                    <TableHead>Error (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accuracyData.length > 0 ? (
                    accuracyData.map((item, index) => (
                      <TableRow
                        key={index}
                        className={item.errorPercent > 5 || item.errorPercent < -5 ? "bg-destructive/10" : ""}
                      >
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{formatPrice(item.forecastedPrice)}</TableCell>
                        <TableCell>{formatPrice(item.actualPrice)}</TableCell>
                        <TableCell>
                          <span className={`${item.errorPercent > 0 ? "text-destructive" : "text-green-600"}`}>
                            {item.errorPercent > 0 ? "+" : ""}
                            {item.errorPercent.toFixed(2)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No accuracy data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end">
            {/* <Button onClick={handleExportAccuracy} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Accuracy Data
            </Button> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

