"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Construction, User, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MaterialLaborTable } from "@/components/material-labor-table";
import { ToolsAssignmentTable } from "@/components/tools-assignment-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type Project = {
  id: string;
  name: string;
  type: string;
  status: string;
  client: string;
  date_requested: string;
  target_date: string;
  description?: string;
};

interface ProjectDetailsClientProps {
  project: Project;
}

/**
 * A helper component that wraps its children in a div with a tooltip if disabled.
 */
function TooltipWrapper({
  disabled,
  title,
  children,
}: {
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return disabled ? <div title={title}>{children}</div> : <>{children}</>;
}

export default function ProjectDetailsClient({
  project,
}: ProjectDetailsClientProps) {
  const router = useRouter();

  // Initialize these states to control the enabled status of the button.
  // Note: Adjust the initial values as needed based on your use case.
  const [materialAssigned, setMaterialAssigned] = useState(true);
  const [toolsAssigned, setToolsAssigned] = useState(true);
  const [grandTotalCost, setGrandTotalCost] = useState(0);

  // Button is enabled only when both assignments exist
  const isMoveDisabled = !materialAssigned || !toolsAssigned;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "In Progress":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80";
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Callback functions that are invoked by the child components.
  // In the children these callbacks are called when no items or tools are found.
  const handleNoItems = () => {
    setMaterialAssigned(false);
  };

  const handleNoToolAssigned = () => {
    setToolsAssigned(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-row items-start gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="text-muted-foreground mt-1">{project.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          {project.status !== "Completed" && (
            <TooltipWrapper
              disabled={isMoveDisabled}
              title="Please assign materials, labor, and tools for this project before proceeding."
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isMoveDisabled}>
                    <Construction className="mr-2 h-4 w-4" />
                    Move to Development Phase
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure you want to move the project to Development
                      Phase?
                    </DialogTitle>
                    <DialogDescription>
                      By moving to development phase, you are confirming the
                      materials, labor, and tools for this project are final.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">No</Button>
                    </DialogClose>
                    <Button
                      onClick={() =>
                        router.push(
                          `/add-new-listing?projectId=${project.id}&grandTotalCost=${grandTotalCost}`
                        )
                      }
                    >
                      Yes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TooltipWrapper>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Client</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{project.client}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Date Requested
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formatDate(project.date_requested)}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Target Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formatDate(project.target_date)}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
          <CardDescription>
            Overview of the construction project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{project.description || "No description provided."}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="materials-labor">
        <TabsList className="mb-6">
          <TabsTrigger value="materials-labor">Materials & Labor</TabsTrigger>
          <TabsTrigger value="tools">Tools Assignment</TabsTrigger>
        </TabsList>
        <TabsContent value="materials-labor">
          <MaterialLaborTable
            projectId={project.id}
            onNoItems={handleNoItems}
            onGrandTotalChange={(total) => setGrandTotalCost(total)}
            isCompleted={project.status === "Completed"}
          />
        </TabsContent>
        <TabsContent value="tools">
          <ToolsAssignmentTable
            projectId={project.id}
            onNoToolAssigned={handleNoToolAssigned}
            isCompleted={project.status === "Completed"}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
