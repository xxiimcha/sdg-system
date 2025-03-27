"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart, AlertCircle, Check, LineChart } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ModelTrainingProps = {
  data: any
  onModelTrained: (model: any) => void
}

export function ModelTraining({ data, onModelTrained }: ModelTrainingProps) {
  const [p, setP] = useState(1)
  const [d, setD] = useState(1)
  const [q, setQ] = useState(1)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [trainingError, setTrainingError] = useState<string | null>(null)
  const [modelResults, setModelResults] = useState<any>(null)
  const [bestRMSE, setBestRMSE] = useState<number | null>(null)

  const trainModel = async () => {
    setIsTraining(true)
    setTrainingProgress(0)
    setTrainingError(null)
    let interval: NodeJS.Timeout | undefined = undefined

    try {
      // Simulate progress
      interval = setInterval(() => {
        setTrainingProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 2
        })
      }, 100)

      // Call API to train model
      const response = await fetch("/api/forecasting/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          parameters: { p, d, q },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to train model")
      }

      const result = await response.json()

      clearInterval(interval)
      setTrainingProgress(100)

      // Update best RMSE if this is better
      if (!bestRMSE || result.rmse < bestRMSE) {
        setBestRMSE(result.rmse)
        toast({
          title: "New Best Model Found!",
          description: `RMSE: ${result.rmse.toFixed(4)}`,
        })
      }

      setModelResults(result)

      setTimeout(() => {
        setIsTraining(false)
      }, 500)
    } catch (error) {
      clearInterval(interval)
      setTrainingError(error instanceof Error ? error.message : "Failed to train model")
      setIsTraining(false)
    }
  }

  const handleSaveModel = () => {
    if (modelResults) {
      onModelTrained({
        ...modelResults,
        parameters: { p, d, q },
      })

      toast({
        title: "Model saved",
        description: "You can now proceed to forecasting",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Train ARIMA Model</CardTitle>
        <CardDescription>Configure and train the ARIMA model using your historical data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="parameters">Model Parameters</TabsTrigger>
            <TabsTrigger value="results" disabled={!modelResults}>
              Model Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="p-value">p (Autoregressive): {p}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setP(Math.max(0, p - 1))}
                      disabled={p === 0}
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setP(Math.min(5, p + 1))}
                      disabled={p === 5}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Slider id="p-value" min={0} max={5} step={1} value={[p]} onValueChange={(value) => setP(value[0])} />
                <p className="text-sm text-muted-foreground">Controls how past values influence the current value</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="d-value">d (Differencing): {d}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setD(Math.max(0, d - 1))}
                      disabled={d === 0}
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setD(Math.min(2, d + 1))}
                      disabled={d === 2}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Slider id="d-value" min={0} max={2} step={1} value={[d]} onValueChange={(value) => setD(value[0])} />
                <p className="text-sm text-muted-foreground">Ensures stationarity in the time series data</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="q-value">q (Moving Average): {q}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setQ(Math.max(0, q - 1))}
                      disabled={q === 0}
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setQ(Math.min(5, q + 1))}
                      disabled={q === 5}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Slider id="q-value" min={0} max={5} step={1} value={[q]} onValueChange={(value) => setQ(value[0])} />
                <p className="text-sm text-muted-foreground">Captures past errors' influence on future predictions</p>
              </div>
            </div>

            {trainingError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{trainingError}</AlertDescription>
              </Alert>
            )}

            {isTraining && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Training model...</span>
                  <span className="text-sm font-medium">{trainingProgress}%</span>
                </div>
                <Progress value={trainingProgress} className="w-full" />
              </div>
            )}

            {bestRMSE && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Best Model So Far</AlertTitle>
                <AlertDescription>
                  RMSE: {bestRMSE.toFixed(4)} with parameters p={p}, d={d}, q={q}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="results">
            {modelResults && (
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">Model Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">RMSE (Root Mean Squared Error)</p>
                      <p className="text-lg font-medium">{modelResults.rmse.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AIC (Akaike Information Criterion)</p>
                      <p className="text-lg font-medium">{modelResults.aic?.toFixed(4) || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  {/* This would be replaced with an actual chart component */}
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Model Accuracy Visualization</p>
                  </div>
                </div>

                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Model Ready</AlertTitle>
                  <AlertDescription>
                    Your ARIMA({p},{d},{q}) model has been trained successfully. You can now save this model and proceed
                    to forecasting.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Reset Parameters</Button>
        <div className="flex gap-2">
          <Button onClick={trainModel} disabled={isTraining} className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            {isTraining ? "Training..." : "Train Model"}
          </Button>

          <Button onClick={handleSaveModel} disabled={!modelResults || isTraining} variant="default">
            Save Model & Continue
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

