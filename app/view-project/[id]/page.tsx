"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Building,
  Calendar,
  Clock,
  FileText,
  Briefcase,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { supabase } from "@/utils/supabase/client";

// Updated interface to include projectId for the parent project
interface Project {
  id: string; // development record's ID
  projectId: string; // parent project ID from projects_development.project_id
  title: string;
  budget: number;
  location: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  features: string[];
  images: string[];
  client: {
    name: string;
    phone: string;
    email: string;
    photo: string;
  };
}

export default function ViewProject() {
  const { id } = useParams(); // The development project's ID
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1) Fetch the development project row
        const { data: devData, error: devError } = await supabase
          .from("projects_development")
          .select("*")
          .eq("id", id)
          .single();

        if (devError) {
          console.error("Error fetching development data:", devError.message);
          setProject(null);
          setLoading(false);
          return;
        }
        if (!devData) {
          // Not found
          setProject(null);
          setLoading(false);
          return;
        }

        // 2) Fetch the associated project row (for client info) using devData.project_id
        const { data: projData, error: projError } = await supabase
          .from("projects")
          .select("name, email, number, client")
          .eq("id", devData.project_id)
          .single();

        if (projError) {
          console.error("Error fetching client data:", projError.message);
          // Continue even if client data fails
        }

        // 3) Fetch images from projects_development_images
        const { data: imagesData, error: imagesError } = await supabase
          .from("projects_development_images")
          .select("image_url")
          .eq("development_id", id);

        if (imagesError) {
          console.error("Error fetching images:", imagesError.message);
        }

        // 4) Fetch features from projects_development_features
        const { data: featuresData, error: featuresError } = await supabase
          .from("projects_development_features")
          .select("name")
          .eq("development_id", id);

        if (featuresError) {
          console.error("Error fetching features:", featuresError.message);
        }

        // Combine address fields
        const location = [
          devData.street,
          devData.city,
          devData.state,
          devData.zip_code,
          devData.country,
        ]
          .filter(Boolean)
          .join(", ");

        // Build final project object, including parent projectId
        const finalProject: Project = {
          id: String(devData.id), // dev record's ID
          projectId: String(devData.project_id), // parent project's ID
          title: devData.title || "Untitled Development",
          budget: devData.budget || 0,
          location,
          description: devData.description || "",
          type: devData.type || "",
          status: devData.status || "",
          startDate: devData.start_date || "",
          endDate: devData.target_date || "",
          features: (featuresData || []).map((f) => f.name),
          images: (imagesData || []).map((img) => img.image_url),
          client: {
            name: projData?.client || "Unknown Client",
            phone: projData?.number || "N/A",
            email: projData?.email || "N/A",
            photo: "/placeholder.svg",
          },
        };

        setProject(finalProject);
      } catch (err) {
        console.error("Unexpected error:", err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleMarkAsCompleted = async () => {
    try {
      const { data, error } = await supabase
        .from("projects_development")
        .update({ status: "Completed" })
        .eq("id", id);
      if (error) {
        console.error("Error updating project status:", error.message);
        return;
      }
      setProject((prev) => (prev ? { ...prev, status: "Completed" } : prev));
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-xl">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Button onClick={() => router.push("/")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <div className="flex items-center space-x-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{project.title}</h1>
        </div>
        {project.status === "Completed" ? (
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
            Completed
          </span>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"}>Mark as Completed</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to mark this project as complete?
                </DialogTitle>
                <DialogDescription>
                  By marking this project complete, you will end all
                  transactions in this development project.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">No</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleMarkAsCompleted}>Yes</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: main content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="relative aspect-video overflow-hidden rounded-lg mb-2">
              <Image
                src={project.images[activeImage] || "/placeholder.svg"}
                alt={`Project image ${activeImage + 1}`}
                fill
                className="object-cover"
              />
            </div>
            {project.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {project.images.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-video rounded-md overflow-hidden cursor-pointer ${
                      index === activeImage ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Project thumbnail ${index + 1}`}
                      width={160}
                      height={90}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>

            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{project.location || "No address provided"}</span>
            </div>

            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <p className="font-medium">{project.type}</p>
                  <p className="text-sm text-muted-foreground">Type</p>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <p className="font-medium">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <p className="font-medium">
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">Target Date</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">
                {project.description || "No description provided."}
              </p>
            </div>

            {project.features.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right side: budget and client info */}
        <div>
          {/* Budget Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-primary">
                  ₱{project.budget.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Budget</p>
              </div>

              <div className="space-y-3">
                <Link href={`/projects/${project.projectId}`}>
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Project Plan
                  </Button>
                </Link>
               {/* {project.status !== "Completed" && (
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                )} */}
              </div>
            </CardContent>
          </Card>

          {/* Hide Client Info if Completed */}
          {project.status !== "Completed" && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                    <Image
                      src={project.client.photo}
                      alt={project.client.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{project.client.name}</h3>
                    <p className="text-sm text-muted-foreground">Client</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    {project.client.phone}
                  </p>
                  <p className="text-sm flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {project.client.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
