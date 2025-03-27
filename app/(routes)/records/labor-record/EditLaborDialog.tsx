"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EditLabor from "./editLabor";
import { Labor } from "./columns";

export default function EditLaborDialog({
  labor,
  onLaborUpdated,
}: {
  labor: Labor;
  onLaborUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
          <SquarePen />
          Edit Cost
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Labor Cost</DialogTitle>
          <DialogDescription>
            Update the cost for{" "}
            <span className="font-semibold">{labor.labor}</span>.
          </DialogDescription>
        </DialogHeader>
        <EditLabor
          labor={labor}
          onUpdated={() => {
            setOpen(false);
            onLaborUpdated();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
