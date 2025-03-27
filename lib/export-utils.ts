// Utility functions for exporting data
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export data to CSV
export function exportToCSV(data: any[], filename: string) {
  if (!data || !data.length) {
    throw new Error("No data to export")
  }

  // Get headers from the first data item
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map((item) =>
      headers
        .map((header) => {
          // Handle values that might contain commas
          const value = item[header]
          const valueStr = value !== null && value !== undefined ? value.toString() : ""
          return valueStr.includes(",") ? `"${valueStr}"` : valueStr
        })
        .join(","),
    ),
  ].join("\n")

  // Create a blob and download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Export data to PDF
export function exportToPDF(
  resource: string,
  resourceType: string,
  historicalData: any[],
  forecastData: any[],
  filename: string,
) {
  // In a real implementation, this would use a library like jsPDF or html2pdf
  // to generate a PDF with the forecast data and charts
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(`Forecast Report for ${resource} ${resourceType}`, 14, 20);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Add historical data table
  doc.setFontSize(14);
  doc.text('Historical Data:', 14, 45);
  
  (doc as any).autoTable({
    startY: 50,
    head: [['Date', 'Price']],
    body: historicalData.map(item => [
      item.date,
      resourceType === "labor" ? `$${item.price.toFixed(2)}/hr` : `$${item.price.toFixed(2)}`
    ]),
  });
  
  // Add forecast data table
  doc.setFontSize(14);
  doc.text('Forecast Data:', 14, (doc as any).lastAutoTable.finalY + 20);
  
  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [['Date', 'Price']],
    body: forecastData.map(item => [
      item.date,
      resourceType === "labor" ? `$${item.price.toFixed(2)}/hr` : `$${item.price.toFixed(2)}`
    ]),
  });
  
  // Save the PDF
  doc.save(filename);
}


//   // For this demo, we'll simulate the PDF export by creating a simple text file
//   const content = [
//     `Forecast Report for ${resource} ${resourceType}`,
//     `Generated on: ${new Date().toLocaleDateString()}`,
//     "",
//     "Historical Data:",
//     ...historicalData.map(
//       (item) =>
//         `${item.date}: ${resourceType === "labor" ? "$" + item.price.toFixed(2) + "/hr" : "$" + item.price.toFixed(2)}`,
//     ),
//     "",
//     "Forecast Data:",
//     ...forecastData.map(
//       (item) =>
//         `${item.date}: ${resourceType === "labor" ? "$" + item.price.toFixed(2) + "/hr" : "$" + item.price.toFixed(2)}`,
//     ),
//   ].join("\n")

//   // Create a blob and download link
//   const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
//   const url = URL.createObjectURL(blob)
//   const link = document.createElement("a")
//   link.setAttribute("href", url)
//   link.setAttribute("download", filename)
//   link.style.visibility = "hidden"
//   document.body.appendChild(link)
//   link.click()
//   document.body.removeChild(link)

//   // Note: In a real implementation, you would use a proper PDF library
//   console.log("In a real implementation, this would generate a PDF with charts and tables")
// }

