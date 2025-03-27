"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Tool } from "./tools-management"
import { supabase } from "@/utils/supabase/client"
import { v4 as uuidv4 } from 'uuid'

interface AddToolFormProps {
  onSubmit: (tool: Omit<Tool, "id" | "qrCode">) => void
  onCancel: () => void
}

export function AddToolForm({ onSubmit, onCancel }: AddToolFormProps) {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState<Tool["status"]>("Available")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tool = {
      name,
      quantity,
      status,
      qrCode: uuidv4(), // Generate a unique QR code
    }
    onSubmit(tool)

    // Send data to Supabase
    const { error } = await supabase
      .from('tool_adding')
      .insert([tool])

    if (error) {
      console.error("Error adding tool to Supabase:", error.message)
    } else {
      console.log("Tool added successfully to Supabase")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Add New Tool</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Tool Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as Tool["status"])}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Not Available">Not Available</SelectItem>
              <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Tool</Button>
      </DialogFooter>
    </form>
  )
}

