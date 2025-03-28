"use client"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Line,
  Bar,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "@/components/ui/chart"

interface ForecastChartProps {
  forecastData: any[]
  isLoading: boolean
  chartType: "line" | "bar"
  resourceType: string
}

export function ForecastChart({
  forecastData,
  isLoading,
  chartType,
  resourceType,
}: ForecastChartProps) {
  if (isLoading) return <Skeleton className="w-full h-full" />

  // Normalize and enhance forecast data
  const formattedForecast = forecastData.map((item) => {
    const price = item.price || item.cost
    return {
      date: new Date(item.date || item.created_at).toISOString().split("T")[0],
      price,
      upperBound: price * 1.05,
      lowerBound: price * 0.95,
    }
  })

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })

  const formatPrice = (price: number) =>
    resourceType === "labor"
      ? `$${price.toFixed(2)}/hr`
      : `$${price.toFixed(2)}`

  return (
    <ChartContainer className="w-full h-full">
      <Chart data={formattedForecast}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
  dataKey="date"
  tickFormatter={(dateStr) => {
    const date = new Date(dateStr)
    return `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
  }}
  tick={{ fontSize: 12 }}
/>

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

        {chartType === "line" ? (
          <>
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="transparent"
              fill="#82ca9d"
              fillOpacity={0.2}
              name="Upper Bound"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="transparent"
              fill="#82ca9d"
              fillOpacity={0.2}
              name="Lower Bound"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Forecast"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
              animationDuration={500}
            />
          </>
        ) : (
          <Bar
            dataKey="price"
            fill="#82ca9d"
            name="Forecast"
            isAnimationActive={true}
            animationDuration={500}
          />
        )}
      </Chart>
    </ChartContainer>
  )
}
