import { NextResponse } from "next/server"

// This is a mock API route that would typically fetch data from your database
// In a real application, you would connect to your database here
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  // Sample project data - in a real app, you would fetch this from your database
  const projectsData = [
    {
      id: "1",
      title: "Greenview Residence",
      budget: 250000,
      location: "123 Main St, New York, NY",
      type: "Residential",
      status: "In Progress",
      startDate: "2025-02-15",
      endDate: "2025-08-20",
      description:
        "A modern two-storey residence with 4 bedrooms, 3 bathrooms, and a spacious living area. The project includes landscaping and a two-car garage.",
      imageUrl: "/placeholder.svg?height=300&width=500",
      client: "John Smith",
    },
    {
      id: "5",
      title: "Highland Residence",
      budget: 320000,
      location: "789 Mountain View, Denver, CO",
      type: "Two-storey Residential with Roofdeck",
      status: "Completed",
      startDate: "2024-01-20",
      endDate: "2024-09-15",
      description:
        "A modern two-storey residence with a spacious roofdeck offering panoramic mountain views. Features 4 bedrooms, 3 bathrooms, and energy-efficient design.",
      imageUrl: "/placeholder.svg?height=300&width=500&text=Highland+Residence",
      client: "Robert Wilson",
    },
    {
      id: "6",
      title: "Riverside Apartments",
      budget: 650000,
      location: "456 River Road, Portland, OR",
      type: "Multi-unit Residential",
      status: "Completed",
      startDate: "2023-08-10",
      endDate: "2024-07-30",
      description:
        "A 12-unit apartment complex with modern amenities, including a shared courtyard, fitness center, and sustainable design features.",
      imageUrl: "/placeholder.svg?height=300&width=500&text=Riverside+Apartments",
      client: "Jennifer Adams",
    },
    // Add more projects as needed
  ]

  // Filter projects by status if provided
  const filteredProjects = status ? projectsData.filter((project) => project.status === status) : projectsData

  return NextResponse.json(filteredProjects)
}

