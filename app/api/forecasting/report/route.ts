import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { forecastResults, reportName, reportType, includeCharts, includeRawData, notes } = body

    if (!forecastResults || !reportName || !reportType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Store report in database
    const supabase = createServerSupabaseClient()

    // Prepare report data
    const reportData = {
      forecast_data: forecastResults.data,
      model_parameters: forecastResults.model.parameters,
      include_charts: includeCharts,
      include_raw_data: includeRawData,
      notes: notes,
    }

    // Insert report
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        report_name: reportName,
        report_type: reportType === "cost-forecast" ? "Cost Forecast" : "Project Planning",
        forecast_id: forecastResults.id,
        report_data: reportData,
      })
      .select()
      .single()

    if (reportError) {
      console.error("Error storing report:", reportError)
      return NextResponse.json({ error: "Failed to store report" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Report generated successfully",
      report: report,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

