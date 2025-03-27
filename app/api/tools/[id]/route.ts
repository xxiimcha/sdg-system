import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/utils/supabase/server"

// GET /api/tools/[id] - Get a specific tool
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("tools")
      .select(`
        *,
        tool_serial_numbers(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ tool: data })
  } catch (error) {
    console.error(`Error fetching tool:`, error)
    return NextResponse.json({ error: "Failed to fetch tool" }, { status: 500 })
  }
}

// PATCH /api/tools/[id] - Update a tool
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, quantity, status, condition_notes, last_maintenance, serial_numbers } = body

    const supabase = createServerSupabaseClient()

    // Update the tool
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .update({
        name,
        quantity,
        status,
        condition_notes,
        last_maintenance,
      })
      .eq("id", id)
      .select()
      .single()

    if (toolError) {
      throw toolError
    }

    // Get existing serial numbers
    const { data: existingSerialNumbers, error: fetchError } = await supabase
      .from("tool_serial_numbers")
      .select("id, serial_number")
      .eq("tool_id", id)

    if (fetchError) {
      throw fetchError
    }

    // Determine which serial numbers to add, update, or delete
    const existingMap = new Map(existingSerialNumbers.map((sn) => [sn.serial_number, sn.id]))
    const newSerialNumbers = serial_numbers.filter((sn: string) => !existingMap.has(sn))
    const toDelete = existingSerialNumbers
      .filter((existing) => !serial_numbers.includes(existing.serial_number))
      .map((sn) => sn.id)

    // Delete removed serial numbers
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase.from("tool_serial_numbers").delete().in("id", toDelete)

      if (deleteError) {
        throw deleteError
      }
    }

    // Add new serial numbers
    if (newSerialNumbers.length > 0) {
      const serialNumbersToInsert = newSerialNumbers.map((serialNumber: string) => ({
        tool_id: id,
        serial_number: serialNumber,
        status,
      }))

      const { error: insertError } = await supabase.from("tool_serial_numbers").insert(serialNumbersToInsert)

      if (insertError) {
        throw insertError
      }
    }

    // Update existing serial numbers status
    const { error: updateError } = await supabase
      .from("tool_serial_numbers")
      .update({ status })
      .eq("tool_id", id)
      .not("id", "in", toDelete)

    if (updateError) {
      throw updateError
    }

    // Get updated tool with serial numbers
    const { data: updatedTool, error: fetchUpdatedError } = await supabase
      .from("tools")
      .select(`
        *,
        tool_serial_numbers(*)
      `)
      .eq("id", id)
      .single()

    if (fetchUpdatedError) {
      throw fetchUpdatedError
    }

    return NextResponse.json({ tool: updatedTool })
  } catch (error) {
    console.error(`Error updating tool:`, error)
    return NextResponse.json({ error: "Failed to update tool" }, { status: 500 })
  }
}