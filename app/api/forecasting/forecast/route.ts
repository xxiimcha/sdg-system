import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { model, forecastRange, forecastName } = body

    if (!model || !forecastRange || !forecastName) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Generate forecast data
    const forecastData = generateForecastData(forecastRange)

    // Store forecast in database
    const supabase = createServerSupabaseClient()

    // Insert forecast results
    const { data: forecastResult, error: forecastError } = await supabase
      .from("forecast_results")
      .insert({
        forecast_name: forecastName,
        forecast_duration: forecastRange,
        model_parameters: model.parameters,
      })
      .select()
      .single()

    if (forecastError) {
      console.error("Error storing forecast:", forecastError)
      return NextResponse.json({ error: "Failed to store forecast results" }, { status: 500 })
    }

    // Insert forecast items
    const forecastItems = forecastData.map((item) => ({
      forecast_id: forecastResult.id,
      item_name: "Forecasted Cost",
      item_type: "Material",
      forecast_date: item.date,
      forecasted_cost: item.cost,
    }))

    const { error: itemsError } = await supabase.from("forecast_items").insert(forecastItems)

    if (itemsError) {
      console.error("Error storing forecast items:", itemsError)
      return NextResponse.json({ error: "Failed to store forecast items" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Forecast generated successfully",
      forecast: forecastData,
    })
  } catch (error) {
    console.error("Error generating forecast:", error)
    return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 })
  }
}

function generateForecastData(months: number) {
  const startDate = new Date()
  const forecast = []

  // Base cost - start with a random value between 1000 and 5000
  let baseCost = 1000 + Math.random() * 4000

  for (let i = 0; i < months; i++) {
    // Move to next month
    const forecastDate = new Date(startDate)
    forecastDate.setMonth(startDate.getMonth() + i + 1)

    // Add some randomness and trend to the forecast
    // Trend: slight increase over time (0.5-2% per month)
    const trend = 1 + (0.005 + Math.random() * 0.015)

    // Seasonality: costs tend to be higher in summer months (5-10% higher)
    const month = forecastDate.getMonth()
    const seasonality = month >= 4 && month <= 8 ? 1 + Math.random() * 0.1 : 1

    // Random fluctuation: -5% to +5%
    const fluctuation = 0.95 + Math.random() * 0.1

    // Calculate new cost
    baseCost = baseCost * trend * seasonality * fluctuation

    forecast.push({
      date: forecastDate.toISOString().split("T")[0],
      cost: Math.round(baseCost * 100) / 100,
    })
  }

  return forecast
}

