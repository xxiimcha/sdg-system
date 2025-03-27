

// Mock API functions to simulate interaction with the Flask backend

// // Fetch available materials
// export async function fetchMaterials(): Promise<string[]> {
//   // // In a real app, this would be an API call to your Flask backend
//   // // return fetch('/api/materials').then(res => res.json());

//   // // For demo purposes, return mock data
//   // return new Promise((resolve) => {
//   //   setTimeout(() => {
//   //     resolve(["Concrete", "Steel", "Lumber", "Copper", "Aluminum", "Sand and Gravel"])
//   //   }, 1000)
//   // })


// }


// // Fetch available labor types
// export async function fetchLabor(): Promise<string[]> {
//   // In a real app, this would be an API call to your Flask backend
//   // return fetch('/api/labor').then(res => res.json());

//   // For demo purposes, return mock data
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve([
//         "Carpenter",
//         "Electrician",
//         "Plumber",
//         "Mason",
//         "General Labor",
//         "Heavy Equipment Operator",
//         "HVAC Technician",
//       ])
//     }, 1000)
//   })
// }


// Fetch historical price data for a material or labor
export async function fetchHistoricalData(type: string, resource: string): Promise<any[]> {
  // In a real app, this would be an API call to your Flask backend
  // return fetch(`/api/historical?type=${type}&resource=${encodeURIComponent(resource)}`).then(res => res.json());

  // For demo purposes, generate mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateHistoricalData(type, resource)
      resolve(data)
    }, 1500)
  })
}

// Fetch forecast data for a material or labor
export async function fetchForecastData(type: string, resource: string, months: number): Promise<any[]> {
  // In a real app, this would be an API call to your Flask backend
  // return fetch(`/api/predict?type=${type}&resource_name=${encodeURIComponent(resource)}&steps=${months}`).then(res => res.json());

  // For demo purposes, generate mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateForecastData(type, resource, months)
      resolve(data)
    }, 1500)
  })
}

// Fetch model accuracy data
export async function fetchModelAccuracy(type: string, resource: string): Promise<any[]> {
  // In a real app, this would be an API call to your Flask backend
  // return fetch(`/api/accuracy?type=${type}&resource=${encodeURIComponent(resource)}`).then(res => res.json());

  // For demo purposes, generate mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateModelAccuracyData(type, resource)
      resolve(data)
    }, 1500)
  })
}

// Trigger model training
export async function triggerTraining(): Promise<any> {
  // In a real app, this would be an API call to your Flask backend to trigger the training script
  // return fetch('/api/train', { method: 'POST' }).then(res => res.json());

  // For demo purposes, simulate a successful response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Training completed successfully" })
    }, 15000)
  })
}

// Helper function to generate mock historical data
function generateHistoricalData(type: string, resource: string): any[] {
  const data = []
  const today = new Date()
  const basePrice = getResourceBasePrice(type, resource)

  // Generate 12 months of historical data
  for (let i = 12; i >= 1; i--) {
    const date = new Date(today)
    date.setMonth(today.getMonth() - i)

    // Add some randomness to the price
    const randomFactor = 0.9 + Math.random() * 0.2 // Between 0.9 and 1.1
    const price = basePrice * randomFactor * (1 + (12 - i) * 0.01) // Slight upward trend

    data.push({
      date: date.toISOString().split("T")[0],
      price: Number.parseFloat(price.toFixed(2)),
      resource: resource,
      type: type,
    })
  }

  return data
}

// Helper function to generate mock forecast data
function generateForecastData(type: string, resource: string, months: number): any[] {
  const data = []
  const today = new Date()
  const basePrice = getResourceBasePrice(type, resource)
  const lastHistoricalPrice = basePrice * (1 + 0.12) // Approximate last historical price

  // Generate forecast data
  for (let i = 1; i <= months; i++) {
    const date = new Date(today)
    date.setMonth(today.getMonth() + i)

    // Add some randomness and trend to the price
    const trend = getResourceTrend(type, resource)
    const randomFactor = 0.98 + Math.random() * 0.04 // Between 0.98 and 1.02
    const price = lastHistoricalPrice * randomFactor * (1 + i * trend)

    data.push({
      date: date.toISOString().split("T")[0],
      price: Number.parseFloat(price.toFixed(2)),
      resource: resource,
      type: type,
    })
  }

  return data
}

// Helper function to generate mock model accuracy data
function generateModelAccuracyData(type: string, resource: string): any[] {
  const data = []
  const today = new Date()
  const basePrice = getResourceBasePrice(type, resource)

  // Generate 6 months of accuracy data
  for (let i = 6; i >= 1; i--) {
    const date = new Date(today)
    date.setMonth(today.getMonth() - i)

    // Generate forecasted and actual prices with some variance
    const forecastedPrice = basePrice * (1 + 0.05 * (6 - i))
    const randomError = Math.random() * 0.1 - 0.05 // Between -5% and +5%
    const actualPrice = forecastedPrice * (1 + randomError)
    const errorPercent = ((actualPrice - forecastedPrice) / forecastedPrice) * 100

    data.push({
      date: date.toISOString().split("T")[0],
      forecastedPrice: Number.parseFloat(forecastedPrice.toFixed(2)),
      actualPrice: Number.parseFloat(actualPrice.toFixed(2)),
      errorPercent: Number.parseFloat(errorPercent.toFixed(2)),
      resource: resource,
      type: type,
    })
  }

  return data
}

// Helper function to get base price for each resource
function getResourceBasePrice(type: string, resource: string): number {
  if (type === "material") {
    switch (resource) {
      case "Concrete":
        return 120
      case "Steel":
        return 800
      case "Lumber":
        return 450
      case "Copper":
        return 950
      case "Aluminum":
        return 350
      default:
        return 500
    }
  } else {
    // labor
    switch (resource) {
      case "Carpenter":
        return 35
      case "Electrician":
        return 45
      case "Plumber":
        return 50
      case "Mason":
        return 40
      case "General Labor":
        return 25
      case "Heavy Equipment Operator":
        return 55
      case "HVAC Technician":
        return 48
      default:
        return 40
    }
  }
}

// Helper function to get trend for each resource
function getResourceTrend(type: string, resource: string): number {
  if (type === "material") {
    switch (resource) {
      case "Concrete":
        return 0.01 // 1% increase per month
      case "Steel":
        return 0.015 // 1.5% increase per month
      case "Lumber":
        return -0.005 // 0.5% decrease per month
      case "Copper":
        return 0.02 // 2% increase per month
      case "Aluminum":
        return 0.008 // 0.8% increase per month
      default:
        return 0.01
    }
  } else {
    // labor
    switch (resource) {
      case "Carpenter":
        return 0.008 // 0.8% increase per month
      case "Electrician":
        return 0.012 // 1.2% increase per month
      case "Plumber":
        return 0.015 // 1.5% increase per month
      case "Mason":
        return 0.007 // 0.7% increase per month
      case "General Labor":
        return 0.005 // 0.5% increase per month
      case "Heavy Equipment Operator":
        return 0.01 // 1% increase per month
      case "HVAC Technician":
        return 0.013 // 1.3% increase per month
      default:
        return 0.01
    }
  }
}

