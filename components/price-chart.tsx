"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "@/components/ui/chart"

interface PriceChartProps {
  historicalData: any[]
  forecastData: any[]
  isLoading: boolean
  chartType: "line" | "bar"
  resourceType: string
}

export function PriceChart({ historicalData, forecastData, isLoading, chartType, resourceType }: PriceChartProps) {
  if (isLoading) {
    return <Skeleton className="w-full h-full" />
  }

  // Combine data for the chart
  const combinedData = [
    ...historicalData.map((item) => ({
      ...item,
      type: "Historical",
    })),
    ...forecastData.map((item) => ({
      ...item,
      type: "Forecast",
    })),
  ]

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return resourceType === "labor" ? `$${price.toFixed(2)}/hr` : `$${price.toFixed(2)}`
  }

  return (
    <ChartContainer className="w-full h-full">
      <Chart data={combinedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(value) => `$${value}`}
          tick={{ fontSize: 12 }}
          label={{
            value: resourceType === "labor" ? "Price ($/hr)" : "Price ($)",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
        />
        <ChartTooltip content={<ChartTooltipContent label="" payload={[]} labelFormatter={formatDate} formatter={formatPrice} />} />
        <Legend />

        {chartType === "line" ? (
          <>
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              strokeWidth={2}
              name="Historical"
              connectNulls
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
              animationDuration={500}
              data={historicalData.map((item) => ({
                ...item,
                type: "Historical",
              }))}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#82ca9d"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Forecast"
              connectNulls
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
              animationDuration={500}
              data={forecastData.map((item) => ({
                ...item,
                type: "Forecast",
              }))}
            />
          </>
        ) : (
          <>
            <Bar
              dataKey="price"
              fill="#8884d8"
              name="Historical"
              isAnimationActive={false}
              animationDuration={500}
              data={historicalData.map((item) => ({
                ...item,
                type: "Historical",
              }))}
            />
            <Bar
              dataKey="price"
              fill="#82ca9d"
              name="Forecast"
              isAnimationActive={false}
              animationDuration={500}
              data={forecastData.map((item) => ({
                ...item,
                type: "Forecast",
              }))}
            />
          </>
        )}
      </Chart>
    </ChartContainer>
  )
}

