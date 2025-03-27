"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"


interface ForecastTableProps {
  historicalData: any[]
  forecastData: any[]
  isLoading: boolean
  resourceType: string
}

export function ForecastTable({ historicalData, forecastData, isLoading, resourceType }: ForecastTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return resourceType === "labor" ? `₱ ${price.toFixed(2)} /hr` : `₱ ${price.toFixed(2)}`
  }

  // Combine historical and forecast data
  const combinedData = [
    ...historicalData.map((item) => ({ ...item, dataType: "Historical" })),
    ...forecastData.map((item) => ({ ...item, dataType: "Forecast" })),
  ]

  // Filter data based on search term
  const filteredData = combinedData.filter((item) => {
    const date = formatDate(item.date).toLowerCase()
    const dataType = item.dataType.toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    return date.includes(searchLower) || dataType.includes(searchLower)
  })

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // Handle pagination
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by date or status..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
          />
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1} size="sm">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow key={index} className={item.dataType === "Forecast" ? "bg-muted/30" : item.dataType === "Historical" ? "bg-muted/30" : ""}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell>{formatPrice(item.price)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.dataType === "Forecast" ? "bg-primary/20 text-primary" : item.dataType === "Historical" ? "bg-gray-200 text-gray-700"  : ""
                          
                        }`}
                      >
                        {item.dataType === "Forecast" ? "Forecast" : "Historical"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

