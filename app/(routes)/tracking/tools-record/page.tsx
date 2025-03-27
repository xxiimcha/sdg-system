"use client";

import { ToolsManagement } from "@/app/(routes)/tracking/tools-record/tools-management"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Tools Management System</h1>
      <ToolsManagement />
    </main>
  )
}

