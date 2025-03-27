"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataUploader } from "@/components/data-uploader"
import { ModelTraining } from "@/components/model-training"
import { ForecastResults } from "@/components/forecast-results"
import { ReportGenerator } from "@/components/report-generator"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { BarChart, LineChart, FileText, FileUp } from "lucide-react"
import { supabase } from "@/utils/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ForecastingDashboard() {
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [trainedModel, setTrainedModel] = useState<any>(null)
  const [forecastResults, setForecastResults] = useState<any>(null)

  // Function to handle data upload completion
  const handleDataUploaded = (data: any) => {
    setUploadedData(data)
    setActiveTab("train")
  }

  // Function to handle model training completion
  const handleModelTrained = (model: any) => {
    setTrainedModel(model)
    setActiveTab("forecast")
  }

  // Function to handle forecast completion
  const handleForecastComplete = (results: any) => {
    setForecastResults(results)
    setActiveTab("reports")
  }

  const handleResourceSelect = (value: string) => {
    console.log("Selected Resource:", value);
    // Dito mo maaaring gamitin ang selected resource (halimbawa, i-save sa state o gamitin sa data upload)
  };


  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Materials Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Labor Types Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            <span>Upload Data</span>
          </TabsTrigger>
          <TabsTrigger value="train" className="flex items-center gap-2" disabled={!uploadedData}>
            <BarChart className="h-4 w-4" />
            <span>Train Model</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2" disabled={!trainedModel}>
            <LineChart className="h-4 w-4" />
            <span>Forecast</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2" disabled={!forecastResults}>
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
            <DataUploader onDataUploaded={handleDataUploaded} />
        </TabsContent>

        <TabsContent value="train">
          <ModelTraining data={uploadedData} onModelTrained={handleModelTrained} />
        </TabsContent>

        <TabsContent value="forecast">
          <ForecastResults model={trainedModel} onForecastComplete={handleForecastComplete} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportGenerator forecastResults={forecastResults} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const prevTab = {
              train: "upload",
              forecast: "train",
              reports: "forecast",
            }[activeTab]
            if (prevTab) setActiveTab(prevTab as string)
          }}
          disabled={activeTab === "upload"}
        >
          Previous Step
        </Button>
        <Button
          onClick={() => {
            const nextTab = {
              upload: "train",
              train: "forecast",
              forecast: "reports",
            }[activeTab]
            if (nextTab) setActiveTab(nextTab as string)
          }}
          disabled={
            (activeTab === "upload" && !uploadedData) ||
            (activeTab === "train" && !trainedModel) ||
            (activeTab === "forecast" && !forecastResults) ||
            activeTab === "reports"
          }
        >
          Next Step
        </Button>
      </div>
    </div>
  )
}

