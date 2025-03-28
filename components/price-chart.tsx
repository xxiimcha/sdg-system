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

  // Normalize data
  const formattedHistorical = historicalData.map((item) => ({
    date: item.date || item.created_at,
    price: item.price || item.cost,
    type: "Historical",
  }))

  const formattedForecast = forecastData.map((item) => ({
    date: item.date || item.created_at,
    price: item.price || item.cost,
    type: "Forecast",
  }))

  const combinedData = [...formattedHistorical, ...formattedForecast]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const formatPrice = (price: number) =>
    resourceType === "labor" ? `$${price.toFixed(2)}/hr` : `$${price.toFixed(2)}`

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
        <ChartTooltip
          content={
            <ChartTooltipContent
              label=""
              payload={[]}
              labelFormatter={formatDate}
              formatter={formatPrice}
            />
          }
        />
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
              data={formattedHistorical}
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
              data={formattedForecast}
            />
          </>
        ) : (
          <>
            <Bar
              dataKey="price"
              fill="#8884d8"
              name="Historical"
              data={formattedHistorical}
              isAnimationActive={false}
            />
            <Bar
              dataKey="price"
              fill="#82ca9d"
              name="Forecast"
              data={formattedForecast}
              isAnimationActive={false}
            />
          </>
        )}
      </Chart>
    </ChartContainer>
  )
}
