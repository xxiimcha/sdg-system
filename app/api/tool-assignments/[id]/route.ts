import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/utils/supabase/server"

// PATCH /api/tool-assignments/[id] - Update a tool assignment (e.g., mark as returned)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, return_date } = body

    const supabase = createServerSupabaseClient()

    // Get the current assignment
    const { data: currentAssignment, error: fetchError } = await supabase
      .from("tool_assignments")
      .select(`
        *,
        tool_serial_numbers(id, tool_id)
      `)
      .eq("id", id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Update the assignment
    const updateData: any = { status }
    if (return_date) {
      updateData.return_date = return_date
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from("tool_assignments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (assignmentError) {
      throw assignmentError
    }

    // If status is Returned, update the tool serial number status
    if (status === "Returned") {
      const { error: updateError } = await supabase
        .from("tool_serial_numbers")
        .update({ status: "Available" })
        .eq("id", currentAssignment.tool_serial_id)

      if (updateError) {
        throw updateError
      }

      // Check if any serial numbers for this tool are still not available
      const { data: serialNumbers, error: fetchSerialError } = await supabase
        .from("tool_serial_numbers")
        .select("status")
        .eq("tool_id", currentAssignment.tool_serial_numbers.tool_id)

      if (fetchSerialError) {
        throw fetchSerialError
      }

      const anyNotAvailable = serialNumbers.some((sn) => sn.status === "Not Available")

      if (!anyNotAvailable) {
        // If no serial numbers are still assigned, update the tool status
        const { error: toolUpdateError } = await supabase
          .from("tools")
          .update({ status: "Available" })
          .eq("id", currentAssignment.tool_serial_numbers.tool_id)

        if (toolUpdateError) {
          throw toolUpdateError
        }
      }
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error(`Error updating tool assignment:`, error)
    return NextResponse.json({ error: "Failed to update tool assignment" }, { status: 500 })
  }
}