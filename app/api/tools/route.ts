import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/utils/supabase/server"

// GET /api/tools - Get all tools or filter by status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("tools").select(`
      *,
      tool_serial_numbers(*)
    `)

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,tool_serial_numbers.serial_number.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ tools: data })
  } catch (error) {
    console.error("Error fetching tools:", error)
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 })
  }
}

// POST /api/tools - Create a new tool
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, quantity, status, condition_notes, last_maintenance, serial_numbers } = body

    const supabase = createServerSupabaseClient()

    // Insert the tool
    const { data: tool, error: toolError } = await supabase
      .from("tools")
      .insert({
        name,
        quantity,
        status,
        condition_notes,
        last_maintenance,
      })
      .select()
      .single()

    if (toolError) {
      throw toolError
    }

    // Insert the serial numbers
    const serialNumbersToInsert = serial_numbers.map((serialNumber: string) => ({
      tool_id: tool.id,
      serial_number: serialNumber,
      status,
    }))

    const { data: serialNumbersData, error: serialNumbersError } = await supabase
      .from("tool_serial_numbers")
      .insert(serialNumbersToInsert)
      .select()

    if (serialNumbersError) {
      throw serialNumbersError
    }

    return NextResponse.json({
      tool: {
        ...tool,
        tool_serial_numbers: serialNumbersData,
      },
    })
  } catch (error) {
    console.error("Error creating tool:", error)
    return NextResponse.json({ error: "Failed to create tool" }, { status: 500 })
  }
}

