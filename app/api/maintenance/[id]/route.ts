import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";

// PATCH /api/maintenance/[id] - Update a maintenance schedule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Parse the request body
    const body = await request.json();
    const { status } = body;
    const { id } = await params;

    if (!status) {
      return NextResponse.json(
        { error: "Invalid request: status is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get the current maintenance schedule
    const { data: currentSchedule, error: fetchError } = await supabase
      .from("maintenance_schedules")
      .select(
        `
        *,
        tool_serial_numbers(id, serial_number, status)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError || !currentSchedule) {
      console.error("Error fetching current schedule:", fetchError);
      throw new Error("Failed to fetch the current maintenance schedule");
    }

    // Update the maintenance schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("maintenance_schedules")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (scheduleError) {
      console.error("Error updating schedule:", scheduleError);
      throw new Error("Failed to update the maintenance schedule");
    }

    // Handle status-specific updates
    if (status === "Completed") {
      // Update the serial number status
      const { error: serialNumberError } = await supabase
        .from("tool_serial_numbers")
        .update({
          status: "Available",
        })
        .eq("id", currentSchedule.tool_serial_numbers?.id);

      if (serialNumberError) {
        console.error("Error updating serial number status:", serialNumberError);
        throw new Error("Failed to update tool serial number status");
      }

      // Update the tool's last maintenance date
      const { error: toolError } = await supabase
        .from("tools")
        .update({
          last_maintenance: new Date().toISOString().split("T")[0],
        })
        .eq("id", currentSchedule.tool_id);

      if (toolError) {
        console.error("Error updating tool maintenance date:", toolError);
        throw new Error("Failed to update tool maintenance date");
      }

      // Check if all serial numbers are now available
      const { data: serialNumbers, error: fetchSerialError } = await supabase
        .from("tool_serial_numbers")
        .select("status")
        .eq("tool_id", currentSchedule.tool_id);

      if (fetchSerialError || !serialNumbers) {
        console.error("Error fetching serial numbers:", fetchSerialError);
        throw new Error("Failed to fetch tool serial numbers");
      }

      const allAvailable = serialNumbers.every(
        (sn) => sn.status === "Available"
      );

      if (allAvailable) {
        const { error: toolStatusError } = await supabase
          .from("tools")
          .update({ status: "Available" })
          .eq("id", currentSchedule.tool_id);

        if (toolStatusError) {
          console.error("Error updating tool status:", toolStatusError);
          throw new Error("Failed to update tool status");
        }
      }
    }

    if (
      status === "Cancelled" &&
      currentSchedule.tool_serial_numbers?.status === "Under Maintenance"
    ) {
      const { data: activeSchedules, error: activeError } = await supabase
        .from("maintenance_schedules")
        .select()
        .eq("serial_number_id", currentSchedule.tool_serial_numbers?.id)
        .in("status", ["Scheduled", "In Progress"]);

      if (activeError) {
        console.error("Error fetching active schedules:", activeError);
        throw new Error("Failed to fetch active maintenance schedules");
      }

      if (activeSchedules.length === 0) {
        const { error: serialNumberError } = await supabase
          .from("tool_serial_numbers")
          .update({ status: "Available" })
          .eq("id", currentSchedule.tool_serial_numbers?.id);

        if (serialNumberError) {
          console.error(
            "Error updating serial number status (Cancelled):",
            serialNumberError
          );
          throw new Error("Failed to update serial number status");
        }

        const { data: serialNumbers, error: fetchSerialError } = await supabase
          .from("tool_serial_numbers")
          .select("status")
          .eq("tool_id", currentSchedule.tool_id);

        if (fetchSerialError || !serialNumbers) {
          console.error(
            "Error fetching serial numbers (Cancelled):",
            fetchSerialError
          );
          throw new Error("Failed to fetch tool serial numbers");
        }

        const allAvailable = serialNumbers.every(
          (sn) => sn.status === "Available"
        );

        if (allAvailable) {
          const { error: toolStatusError } = await supabase
            .from("tools")
            .update({ status: "Available" })
            .eq("id", currentSchedule.tool_id);

          if (toolStatusError) {
            console.error("Error updating tool status (Cancelled):", toolStatusError);
            throw new Error("Failed to update tool status");
          }
        }
      }
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error(`Error updating maintenance schedule:`, error);
    return NextResponse.json(
      { error: "Failed to update maintenance schedule" },
      { status: 500 }
    );
  }
}