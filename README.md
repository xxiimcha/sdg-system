This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToolsTable } from "@/app/(routes)/tracking/tools-record/tools-table"
import { QrScanner } from "@/app/(routes)/tracking/tools-record/qr-scanner"
import { ToolHistory } from "@/app/(routes)/tracking/tools-record/tool-history"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddToolForm } from "@/app/(routes)/tracking/tools-record/add-tool-form"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from "@/utils/supabase/client"


export type Tool = {
  id: string
  name: string
  quantity: number
  qrCode: string
  status: "Available" | "Not Available" | "Under Maintenance"
}

export type ToolHistoryEntry = {
  id: string
  toolId: string
  toolName: string
  qrCode: string
  project: string
  date: string
}

const initialToolHistory: ToolHistoryEntry[] = [
  { id: "H001", toolId: "T001", toolName: "Hammer", qrCode: "T001-QR", project: "Building A", date: "2023-05-15" },
  { id: "H002", toolId: "T002", toolName: "Drill", qrCode: "T002-QR", project: "Renovation C", date: "2023-06-20" },
  { id: "H003", toolId: "T001", toolName: "Hammer", qrCode: "T001-QR", project: "Maintenance D", date: "2023-07-10" },
  { id: "H004", toolId: "T001", toolName: "Hammer", qrCode: "T001-QR", project: "Maintenance E", date: "2023-09-10" },
  { id: "H005", toolId: "T001", toolName: "Hammer", qrCode: "T001-QR", project: "Maintenance C", date: "2023-08-15" },
]

export function ToolsManagement() {
  const [tools, setTools] = useState<Tool[]>([])
  const [toolHistory, setToolHistory] = useState<ToolHistoryEntry[]>(initialToolHistory)
  const [activeTab, setActiveTab] = useState("tool_adding")
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isAddToolOpen, setIsAddToolOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    async function fetchTools() {
      const { data, error } = await supabase.from("tool_adding").select("*")
      if (error) console.error("Error fetching tools:", error)
      else setTools(data || [])
    }
    fetchTools()
  }, [])

  const handleQrCodeScanned = (qrCode: string) => {
    const tool = tools.find((t) => t.qrCode === qrCode)
    if (tool) {
      setSelectedTool(tool)
      setIsHistoryOpen(true)
    } else {
      alert("Tool not found with this QR code")
    }
  }

  const handleStatusChange = (toolId: string, newStatus: Tool["status"]) => {
    setTools(tools.map((tool) => (tool.id === toolId ? { ...tool, status: newStatus } : tool)))
  }

  const handleAddTool = (newTool: Omit<Tool, "id" | "qrCode">) => {
    const id = `T${String(tools.length + 1).padStart(3, "0")}`
    const qrCode = `${id}-QR`

    const tool: Tool = {
      id,
      qrCode,
      ...newTool,
    }

    setTools([...tools, tool])
    setIsAddToolOpen(false)
  }

  const getToolHistory = (toolId: string) => {
    return toolHistory.filter((history) => history.toolId === toolId)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddToolOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </div>
        </div>

        <TabsContent value="tools" className="space-y-4">
          <ToolsTable
            tools={tools}
            onStatusChange={handleStatusChange}
            onViewHistory={(tool) => {
              setSelectedTool(tool)
              setIsHistoryOpen(true)
            }}
          />
        </TabsContent>

        <TabsContent value="scanner">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold">Scan Tool QR Code</h2>
              <p className="text-muted-foreground">Scan a QR code to view tool details and history</p>
            </div>
            <QrScanner onScan={handleQrCodeScanned} />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddToolOpen} onOpenChange={setIsAddToolOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <AddToolForm onSubmit={handleAddTool} onCancel={() => setIsAddToolOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTool && (
            <ToolHistory
              tool={selectedTool}
              history={getToolHistory(selectedTool.id)}
              onClose={() => setIsHistoryOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
