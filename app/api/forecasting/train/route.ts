import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import os from "os"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, parameters } = body

    if (!data || !parameters) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Create a temporary CSV file with the data
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `data_${Date.now()}.csv`)

    // Convert data to CSV format
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((item: any) => Object.values(item).join(","))
    const csvContent = [headers, ...rows].join("\n")

    await writeFile(tempFilePath, csvContent)

    // Call Python script with parameters
    const result = await runPythonScript(tempFilePath, parameters)

    return NextResponse.json({
      success: true,
      message: "Model trained successfully",
      ...result,
    })
  } catch (error) {
    console.error("Error training model:", error)
    return NextResponse.json({ error: "Failed to train model" }, { status: 500 })
  }
}

async function runPythonScript(dataPath: string, parameters: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // In a real implementation, you would call your Python script
    // For now, we'll simulate the response

    // Simulate ARIMA model training
    setTimeout(() => {
      // Generate a random RMSE between 10 and 100
      const rmse = 10 + Math.random() * 90

      // Generate a random AIC value
      const aic = 100 + Math.random() * 200

      resolve({
        rmse,
        aic,
        parameters,
      })
    }, 2000)
  })
}

