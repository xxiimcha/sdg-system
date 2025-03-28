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

export function PriceChart({
  historicalData,
  forecastData,
  isLoading,
  chartType,
  resourceType,
}: PriceChartProps) {
  if (isLoading) return <Skeleton className="w-full h-full" />

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })

  const formatPrice = (price: number | null) =>
    typeof price === "number"
      ? resourceType === "labor"
        ? `₱${price.toFixed(2)}/hr`
        : `₱${price.toFixed(2)}`
      : "N/A"
  

  const formattedHistorical = historicalData.map((item) => ({
    date: new Date(item.date || item.created_at).toISOString().split("T")[0],
    value: Number(item.price || item.cost),
  }))

  const formattedForecast = forecastData.map((item) => {
    const rawPrice = item.price ?? item.cost
    const parsed = typeof rawPrice === "string" ? parseFloat(rawPrice.trim()) : rawPrice

    return {
      date: new Date(item.date || item.created_at).toISOString().split("T")[0],
      value: isNaN(parsed) ? null : parsed,
    }
  })

  const dataToShow = forecastData?.length > 0 ? formattedForecast : formattedHistorical

  return (
    <ChartContainer className="w-full h-full">
      <Chart data={dataToShow}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
        />
        <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(value) => `₱${value.toFixed(2)}`}
            tick={{ fontSize: 12 }}
            label={{
              value: resourceType === "labor" ? "Price (₱/hr)" : "Price (₱)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
        <Legend />

        {chartType === "line" ? (
          <Line
            type="monotone"
            dataKey="value"
            stroke={forecastData?.length > 0 ? "#82ca9d" : "#8884d8"}
            strokeWidth={2}
            name={forecastData?.length > 0 ? "Forecast" : "Historical"}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
            connectNulls
          />
        ) : (
          <Bar
            dataKey="value"
            fill={forecastData?.length > 0 ? "#82ca9d" : "#8884d8"}
            name={forecastData?.length > 0 ? "Forecast" : "Historical"}
            isAnimationActive={false}
          />
        )}
      </Chart>
    </ChartContainer>
  )
}
