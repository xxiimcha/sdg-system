"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Tool, ToolHistoryEntry } from "./tools-management"
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ToolHistoryProps {
  tool: Tool
  history: ToolHistoryEntry[]
  onClose: () => void
}

export function ToolHistory({ tool, history, onClose }: ToolHistoryProps) {
  const getStatusBadge = (status: Tool["status"]) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-500">Available</Badge>
      case "Not Available":
        return <Badge variant="destructive">Not Available</Badge>
      case "Under Maintenance":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Under Maintenance
          </Badge>
        )
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Tool History - {tool.name}</DialogTitle>
      </DialogHeader>

      <div className="py-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tool ID</p>
            <p>{tool.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">QR Code</p>
            <p>{tool.qrCode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Quantity</p>
            <p>{tool.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Status</p>
            <p>{getStatusBadge(tool.status)}</p>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-2">Assignment History</h3>
        {history.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>QR Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.project}</TableCell>
                  <TableCell>{entry.qrCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">No history records found</p>
        )}
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </>
  )
}

