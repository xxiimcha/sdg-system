import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/utils/supabase/server"

// GET /api/maintenance - Get all maintenance schedules or filter by status/date
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const toolId = searchParams.get("toolId")
    const serialNumberId = searchParams.get("serialNumberId")
    const fromDate = searchParams.get("fromDate")
    const toDate = searchParams.get("toDate")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("maintenance_schedules").select(`
      *,
      tools(id, name),
      tool_serial_numbers(id, serial_number)
    `)

    if (status) {
      query = query.eq("status", status)
    }

    if (toolId) {
      query = query.eq("tool_id", toolId)
    }

    if (serialNumberId) {
      query = query.eq("serial_number_id", serialNumberId)
    }

    if (fromDate) {
      query = query.gte("scheduled_date", fromDate)
    }

    if (toDate) {
      query = query.lte("scheduled_date", toDate)
    }

    // Order by scheduled date
    query = query.order("scheduled_date", { ascending: true })

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ schedules: data })
  } catch (error) {
    console.error("Error fetching maintenance schedules:", error)
    return NextResponse.json({ error: "Failed to fetch maintenance schedules" }, { status: 500 })
  }
}

// POST /api/maintenance - Create a new maintenance schedule
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tool_id, serial_number, scheduled_date, maintenance_type, notes } = body

    const supabase = createServerSupabaseClient()

    // Get the serial number ID
    const { data: serialNumberData, error: serialNumberError } = await supabase
      .from("tool_serial_numbers")
      .select("id")
      .eq("tool_id", tool_id)
      .eq("serial_number", serial_number)
      .single()

    if (serialNumberError) {
      throw serialNumberError
    }

    // Create the maintenance schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("maintenance_schedules")
      .insert({
        tool_id,
        serial_number_id: serialNumberData.id,
        scheduled_date,
        maintenance_type,
        notes,
        status: "Scheduled",
      })
      .select()
      .single()

    if (scheduleError) {
      throw scheduleError
    }

    // If maintenance type is Repair, update the tool status to Under Maintenance
    if (maintenance_type === "Repair") {
      const { error: updateError } = await supabase
        .from("tool_serial_numbers")
        .update({ status: "Under Maintenance" })
        .eq("id", serialNumberData.id)

      if (updateError) {
        throw updateError
      }

      // Check if all serial numbers for this tool are under maintenance
      const { data: serialNumbers, error: fetchError } = await supabase
        .from("tool_serial_numbers")
        .select("status")
        .eq("tool_id", tool_id)

      if (fetchError) {
        throw fetchError
      }

      const allUnderMaintenance = serialNumbers.every((sn) => sn.status === "Under Maintenance")

      if (allUnderMaintenance) {
        const { error: toolUpdateError } = await supabase
          .from("tools")
          .update({ status: "Under Maintenance" })
          .eq("id", tool_id)

        if (toolUpdateError) {
          throw toolUpdateError
        }
      }
    }

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Error creating maintenance schedule:", error)
    return NextResponse.json({ error: "Failed to create maintenance schedule" }, { status: 500 })
  }
}

