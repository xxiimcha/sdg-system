"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, MoreHorizontal, QrCode } from "lucide-react"
import type { Tool } from "./tools-management"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRCode from "react-qr-code"
import { supabase } from "@/utils/supabase/client"

interface ToolsTableProps {
  tools: Tool[]
  onStatusChange: (toolId: string, status: Tool["status"]) => void
  onViewHistory: (tool: Tool) => void
}

export function ToolsTable({ tools, onStatusChange, onViewHistory }: ToolsTableProps) {
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

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

  const showQrCode = (tool: Tool) => {
    setSelectedTool(tool)
    setQrDialogOpen(true)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium">{tool.id}</TableCell>
                <TableCell>{tool.name}</TableCell>
                <TableCell>{tool.quantity}</TableCell>
                <TableCell>{getStatusBadge(tool.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => showQrCode(tool)}>
                        <QrCode className="h-4 w-4 mr-2" />
                        View QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewHistory(tool)}>
                        <History className="h-4 w-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(tool.id, "Available")}
                        disabled={tool.status === "Available"}
                      >
                        Mark as Available
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(tool.id, "Not Available")}
                        disabled={tool.status === "Not Available"}
                      >
                        Mark as Not Available
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange(tool.id, "Under Maintenance")}
                        disabled={tool.status === "Under Maintenance"}
                      >
                        Mark as Under Maintenance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
        <DialogTitle>QR Code for {selectedTool?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
        {selectedTool && (
          <>
            <div className="bg-white p-4 rounded-md">
          <QRCode value={selectedTool.qrCode} size={200} />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
          Tool ID: {selectedTool.id}
          <br />
          QR Code: {selectedTool.qrCode}
            </p>
            <Button
          onClick={() => {
            if (selectedTool) {
              window.location.href = `/tools/${selectedTool.id}`;
            }
          }}
            >
          Go to Tool Details
            </Button>
          </>
        )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
