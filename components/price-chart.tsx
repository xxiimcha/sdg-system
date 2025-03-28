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

  // Normalize
  const formattedHistorical = historicalData.map((item) => ({
    date: new Date(item.date || item.created_at).toISOString().split("T")[0],
    historical: Number(item.price || item.cost),
    forecast: null,
  }))

  const formattedForecast = forecastData.map((item) => {
    const rawPrice = item.price ?? item.cost;
    const parsedPrice =
      typeof rawPrice === "string" ? parseFloat(rawPrice.trim()) : rawPrice;
  
    return {
      date: new Date(item.date || item.created_at).toISOString().split("T")[0],
      forecast: isNaN(parsedPrice) ? null : parsedPrice,
      historical: null,
    };
  });
  
  const mergedMap = new Map<string, { date: string; historical: number | null; forecast: number | null }>();

  // Insert historical data
  formattedHistorical.forEach((item) => {
    mergedMap.set(item.date, {
      date: item.date,
      historical: item.historical,
      forecast: null,
    });
  });
  
  // Insert forecast data and merge
  formattedForecast.forEach((item) => {
    if (mergedMap.has(item.date)) {
      const existing = mergedMap.get(item.date)!;
      existing.forecast = item.forecast;
    } else {
      mergedMap.set(item.date, {
        date: item.date,
        historical: null,
        forecast: item.forecast,
      });
    }
  });

  // Combine & sort
  const combined = [...formattedHistorical, ...formattedForecast].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  console.log("FINAL CHART DATA", combined);
  // Log for debugging
  console.log("Chart Data:", combined)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const formatPrice = (price: number | null) =>
    typeof price === "number"
      ? resourceType === "labor"
        ? `$${price.toFixed(2)}/hr`
        : `$${price.toFixed(2)}`
      : "N/A"

  return (
    <ChartContainer className="w-full h-full">
      <Chart data={combined}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={(value) => `$${value}`}
          tick={{ fontSize: 12 }}
          label={{
            value: resourceType === "labor" ? "Price ($/hr)" : "Price ($)",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle" },
          }}
        />
        <Legend />

        {chartType === "line" ? (
          <>
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#8884d8"
              strokeWidth={2}
              name="Historical"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#82ca9d"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Forecast"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
              connectNulls
            />
          </>
        ) : (
          <>
            <Bar
              dataKey="historical"
              fill="#8884d8"
              name="Historical"
              isAnimationActive={false}
            />
            <Bar
              dataKey="forecast"
              fill="#82ca9d"
              name="Forecast"
              isAnimationActive={false}
            />
          </>
        )}
      </Chart>
    </ChartContainer>
  )
}
