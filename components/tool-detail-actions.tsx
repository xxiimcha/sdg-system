"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, AlertTriangle, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/utils/supabase/client"
import { useToolsIntegration } from "./tools-integration"
import { useToolsAssignmentIntegration } from "./tools-assignment-integration"

type ToolDetailActionsProps = {
  toolId: string
  serialNumber: string
  status: string
  assignmentId?: string
  maintenanceId?: string
}

export function ToolDetailActions({
  toolId,
  serialNumber,
  status,
  assignmentId,
  maintenanceId,
}: ToolDetailActionsProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [action, setAction] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined)
  const [maintenanceType, setMaintenanceType] = useState<string>("Routine")
  const [maintenanceDate, setMaintenanceDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 1)),
  )
  const [maintenanceNotes, setMaintenanceNotes] = useState<string>("")

  // State for conditional rendering
  const [showCheckoutFields, setShowCheckoutFields] = useState(false)
  const [showMaintenanceFields, setShowMaintenanceFields] = useState(false)

  // Get integration hooks
  const { scheduleToolMaintenance, completeToolMaintenance } = useToolsIntegration()
  const { assignToolToProject, returnToolFromProject } = useToolsAssignmentIntegration()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase.from("projects").select("id, name").order("name")

        if (error) throw error

        setProjects(data || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        })
      }
    }

    fetchProjects()
  }, [])

  useEffect(() => {
    setShowCheckoutFields(action === "checkout")
    setShowMaintenanceFields(action === "maintenance")
  }, [action])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      if (action === "checkout") {
        if (!selectedProject) {
          throw new Error("Please select a project")
        }

        const result = await assignToolToProject(
          selectedProject,
          serialNumber,
          new Date().toISOString().split("T")[0],
          returnDate ? returnDate.toISOString().split("T")[0] : undefined,
        )

        if (!result.success) {
          throw new Error(result.error)
        }

        toast({
          title: "Tool Checked Out",
          description: `${serialNumber} has been assigned to the project.`,
        })
      } else if (action === "checkin") {
        if (!assignmentId) {
          throw new Error("No active assignment found for this tool")
        }

        const result = await returnToolFromProject(assignmentId)

        if (!result.success) {
          throw new Error(result.error)
        }

        toast({
          title: "Tool Checked In",
          description: `${serialNumber} has been returned.`,
        })
      } else if (action === "maintenance") {
        if (!maintenanceDate || !maintenanceType) {
          throw new Error("Please fill in all required fields")
        }

        const result = await scheduleToolMaintenance(
          toolId,
          serialNumber,
          maintenanceType,
          maintenanceDate.toISOString().split("T")[0],
          maintenanceNotes,
        )

        if (!result.success) {
          throw new Error(result.error)
        }

        toast({
          title: "Maintenance Scheduled",
          description: `Maintenance has been scheduled for ${serialNumber}.`,
        })
      } else if (action === "complete-maintenance") {
        if (!maintenanceId) {
          throw new Error("No active maintenance found for this tool")
        }

        const result = await completeToolMaintenance(maintenanceId)

        if (!result.success) {
          throw new Error(result.error)
        }

        toast({
          title: "Maintenance Completed",
          description: `Maintenance has been completed for ${serialNumber}.`,
        })
      }

      // Refresh the page to show updated status
      router.refresh()

      // Reset form
      setAction("")
      setSelectedProject("")
      setReturnDate(undefined)
      setMaintenanceType("Routine")
      setMaintenanceDate(new Date(new Date().setDate(new Date().getDate() + 1)))
      setMaintenanceNotes("")
    } catch (error) {
      console.error("Error processing action:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process action",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Actions</CardTitle>
        <CardDescription>Check out, return, or schedule maintenance for this tool</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Action</label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue placeholder="What would you like to do?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checkout" disabled={status !== "Available"}>
                <div className="flex items-center">
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  <span>Check Out Tool</span>
                </div>
              </SelectItem>
              <SelectItem value="checkin" disabled={status !== "Not Available" || !assignmentId}>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Check In Tool</span>
                </div>
              </SelectItem>
              <SelectItem value="maintenance" disabled={status === "Under Maintenance"}>
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>Schedule Maintenance</span>
                </div>
              </SelectItem>
              <SelectItem value="complete-maintenance" disabled={status !== "Under Maintenance" || !maintenanceId}>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>Complete Maintenance</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showCheckoutFields && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Return Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {showMaintenanceFields && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Maintenance Type</label>
              <Select value={maintenanceType} onValueChange={(value) => setMaintenanceType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !maintenanceDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {maintenanceDate ? format(maintenanceDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={maintenanceDate}
                    onSelect={setMaintenanceDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                placeholder="Enter maintenance details or issues"
              />
            </div>
          </div>
        )}

        {action && (
          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (action === "checkout" && !selectedProject) ||
              (action === "maintenance" && (!maintenanceDate || !maintenanceType))
            }
          >
            {isSubmitting ? "Processing..." : "Confirm"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

