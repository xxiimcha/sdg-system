import { ProjectForm } from "@/components/project-form"

// Example using mock API fetch function
async function fetchProject(id: string) {
  const response = await fetch(`/api/projects/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch project data")
  }
  return response.json()
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let project = null

  try {
    project = await fetchProject(id)
  } catch (error) {
    console.error(error)
  }

  if (!project) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Project Not Found</h1>
        <p>The project you're trying to edit doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Project</h1>
      <ProjectForm project={project} isEditing={true} />
    </div>
  )
}