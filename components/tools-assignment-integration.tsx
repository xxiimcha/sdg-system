"use client"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/utils/supabase/client"

// This component provides integration between the Tools Assignment Table and the Tools Record Table

export function useToolsAssignmentIntegration() {
  const updateToolStatus = async (toolId: string, serialNumber: string, status: string) => {
    try {
      // First, find the serial number ID
      const { data: serialNumberData, error: serialNumberError } = await supabase
        .from("tool_serial_numbers")
        .select("id")
        .eq("serial_number", serialNumber)
        .single()

      if (serialNumberError) throw serialNumberError

      // Update the tool serial number status
      const { error: updateError } = await supabase
        .from("tool_serial_numbers")
        .update({ status: status })
        .eq("id", serialNumberData.id)

      if (updateError) throw updateError

      // Check if all serial numbers for this tool have the same status
      const { data: serialNumbers, error: fetchError } = await supabase
        .from("tool_serial_numbers")
        .select("status")
        .eq("tool_id", toolId)

      if (fetchError) throw fetchError

      // If all serial numbers have the same status, update the tool status
      const allSameStatus = serialNumbers.every((sn) => sn.status === status)
      if (allSameStatus) {
        const { error: toolUpdateError } = await supabase.from("tools").update({ status: status }).eq("id", toolId)

        if (toolUpdateError) throw toolUpdateError
      }

      toast({
        title: "Tool Status Updated",
        description: `Tool ${serialNumber} is now ${status}`,
      })

      return true
    } catch (error) {
      console.error("Error updating tool status:", error)
      toast({
        title: "Error",
        description: "Failed to update tool status",
        variant: "destructive",
      })

      return false
    }
  }

  const checkToolAvailability = async (serialNumber: string) => {
    try {
      const { data, error } = await supabase
        .from("tool_serial_numbers")
        .select("status")
        .eq("serial_number", serialNumber)
        .single()

      if (error) throw error

      return {
        available: data.status === "Available",
        status: data.status,
      }
    } catch (error) {
      console.error("Error checking tool availability:", error)
      return {
        available: false,
        status: "Error",
      }
    }
  }

  const assignToolToProject = async (
    projectId: string,
    serialNumber: string,
    assignedDate: string,
    returnDate?: string,
  ) => {
    try {
      // Get the serial number ID
      const { data: serialNumberData, error: serialNumberError } = await supabase
        .from("tool_serial_numbers")
        .select("id, status, tool_id")
        .eq("serial_number", serialNumber)
        .single()

      if (serialNumberError) throw serialNumberError

      // Check if the tool is available
      if (serialNumberData.status !== "Available") {
        throw new Error(`Tool with serial number ${serialNumber} is not available (Status: ${serialNumberData.status})`)
      }

      // Create the tool assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from("tool_assignments")
        .insert({
          project_id: projectId,
          tool_serial_id: serialNumberData.id,
          assigned_date: assignedDate,
          return_date: returnDate || null,
          status: "Assigned",
        })
        .select()
        .single()

      if (assignmentError) throw assignmentError

      // Update the tool serial number status
      const { error: updateError } = await supabase
        .from("tool_serial_numbers")
        .update({ status: "Not Available" })
        .eq("id", serialNumberData.id)

      if (updateError) throw updateError

      // Check if all serial numbers for this tool are now not available
      const { data: serialNumbers, error: fetchError } = await supabase
        .from("tool_serial_numbers")
        .select("status")
        .eq("tool_id", serialNumberData.tool_id)

      if (fetchError) throw fetchError

      const allNotAvailable = serialNumbers.every((sn) => sn.status !== "Available")

      if (allNotAvailable) {
        const { error: toolUpdateError } = await supabase
          .from("tools")
          .update({ status: "Not Available" })
          .eq("id", serialNumberData.tool_id)

        if (toolUpdateError) throw toolUpdateError
      }

      return {
        success: true,
        assignment: assignment,
      }
    } catch (error) {
      console.error("Error assigning tool to project:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to assign tool to project",
      }
    }
  }

  const returnToolFromProject = async (assignmentId: string) => {
    try {
      // Get the current assignment
      const { data: currentAssignment, error: fetchError } = await supabase
        .from("tool_assignments")
        .select(`
        id,
        tool_serial_id,
        tool_serial_numbers(
          id, 
          tool_id
        )
      `)
        .eq("id", assignmentId)
        .single()

      if (fetchError) throw fetchError

      // Update the assignment
      const { error: assignmentError } = await supabase
        .from("tool_assignments")
        .update({
          status: "Returned",
          return_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", assignmentId)

      if (assignmentError) throw assignmentError

      // Update the tool serial number status
      const { error: updateError } = await supabase
        .from("tool_serial_numbers")
        .update({ status: "Available" })
        .eq("id", currentAssignment.tool_serial_id)

      if (updateError) throw updateError

      // Check if any serial numbers for this tool are still not available
      const { data: serialNumbers, error: fetchSerialError } = await supabase
        .from("tool_serial_numbers")
        .select("status")
        .eq("tool_id", currentAssignment.tool_serial_numbers[0].tool_id)

      if (fetchSerialError) throw fetchSerialError

      const anyNotAvailable = serialNumbers.some((sn) => sn.status === "Not Available")

      if (!anyNotAvailable) {
        // If no serial numbers are still assigned, update the tool status
        const { error: toolUpdateError } = await supabase
          .from("tools")
          .update({ status: "Available" })
          .eq("id", currentAssignment.tool_serial_numbers[0].tool_id)

        if (toolUpdateError) throw toolUpdateError
      }

      return {
        success: true,
      }
    } catch (error) {
      console.error("Error returning tool from project:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to return tool from project",
      }
    }
  }

  return {
    updateToolStatus,
    checkToolAvailability,
    assignToolToProject,
    returnToolFromProject,
  }
}

