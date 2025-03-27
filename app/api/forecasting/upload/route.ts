import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    // Validate data has required fields
    const hasRequiredFields = data.every((item) => "date" in item && "cost" in item)
    if (!hasRequiredFields) {
      return NextResponse.json({ error: "Data must contain 'date' and 'cost' fields" }, { status: 400 })
    }

    // Insert data into historical_data table
    const supabase = createServerSupabaseClient()

    // Prepare data for insertion
    const itemsToInsert = data.map((item) => ({
      item_name: item.item_name || "Unknown",
      item_type: item.item_type || "Material",
      date: item.date,
      cost: Number.parseFloat(item.cost),
    }))

    const { error } = await supabase.from("historical_data").insert(itemsToInsert)

    if (error) {
      console.error("Error inserting data:", error)
      return NextResponse.json({ error: "Failed to store historical data" }, { status: 500 })
    }

    // Return processed data
    return NextResponse.json({
      success: true,
      message: "Data uploaded successfully",
      data: itemsToInsert,
    })
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ error: "Failed to process data" }, { status: 500 })
  }
}

