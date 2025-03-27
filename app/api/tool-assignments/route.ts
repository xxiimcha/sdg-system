import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/utils/supabase/server"

// GET /api/tool-assignments - Get all tool assignments or filter by project
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("tool_assignments").select(`
      *,
      projects(id, name),
      tool_serial_numbers(
        id, 
        serial_number,
        tools(id, name)
      )
    `)

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    // Order by assigned date
    query = query.order("assigned_date", { ascending: false })

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ assignments: data })
  } catch (error) {
    console.error("Error fetching tool assignments:", error)
    return NextResponse.json({ error: "Failed to fetch tool assignments" }, { status: 500 })
  }
}

// POST /api/tool-assignments - Create a new tool assignment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, serial_number, assigned_date, return_date } = body

    const supabase = createServerSupabaseClient()

    // Get the serial number ID and check if it's available
    const { data: serialNumberData, error: serialNumberError } = await supabase
      .from("tool_serial_numbers")
      .select("id, status, tool_id")
      .eq("serial_number", serial_number)
      .single()

    if (serialNumberError) {
      throw serialNumberError
    }

    if (serialNumberData.status !== "Available") {
      return NextResponse.json(
        { error: `Tool with serial number ${serial_number} is not available (Status: ${serialNumberData.status})` },
        { status: 400 },
      )
    }

    // Create the tool assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from("tool_assignments")
      .insert({
        project_id,
        tool_serial_id: serialNumberData.id,
        assigned_date,
        return_date,
        status: "Assigned",
      })
      .select()
      .single()

    if (assignmentError) {
      throw assignmentError
    }

    // Update the tool serial number status
    const { error: updateError } = await supabase
      .from("tool_serial_numbers")
      .update({ status: "Not Available" })
      .eq("id", serialNumberData.id)

    if (updateError) {
      throw updateError
    }

    // Check if all serial numbers for this tool are now not available
    const { data: serialNumbers, error: fetchError } = await supabase
      .from("tool_serial_numbers")
      .select("status")
      .eq("tool_id", serialNumberData.tool_id)

    if (fetchError) {
      throw fetchError
    }

    const allNotAvailable = serialNumbers.every((sn) => sn.status !== "Available")

    if (allNotAvailable) {
      const { error: toolUpdateError } = await supabase
        .from("tools")
        .update({ status: "Not Available" })
        .eq("id", serialNumberData.tool_id)

      if (toolUpdateError) {
        throw toolUpdateError
      }
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error("Error creating tool assignment:", error)
    return NextResponse.json({ error: "Failed to create tool assignment" }, { status: 500 })
  }
}

