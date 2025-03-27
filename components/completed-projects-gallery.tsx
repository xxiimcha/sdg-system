"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Building, Search } from "lucide-react";

interface SupabaseDevImage {
  image_url: string;
}

interface SupabaseDevProject {
  id: string;
  title: string;
  budget: number;
  type: string;
  status: string;
  start_date: string;
  target_date: string;
  description: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  projects_development_images?: SupabaseDevImage[];
}

export interface CompletedProject {
  id: string;
  title: string;
  budget: number;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
  imageUrl: string;
}

export function CompletedProjectsGallery() {
  const [projects, setProjects] = useState<CompletedProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch completed projects from Supabase API
  useEffect(() => {
    async function fetchCompletedProjects() {
      const { data, error } = await supabase
        .from("projects_development")
        .select(
          `
          id,
          title,
          budget,
          type,
          status,
          start_date,
          target_date,
          description,
          street,
          city,
          state,
          zip_code,
          country,
          projects_development_images (
            image_url
          )
        `
        )
        .eq("status", "Completed");

      if (error) {
        console.error("Error fetching completed projects:", error.message);
        return;
      }
      if (!data) return;

      const mapped = data.map((row: SupabaseDevProject) => {
        // Combine address fields into one location string
        const location = [
          row.street,
          row.city,
          row.state,
          row.zip_code,
          row.country,
        ]
          .filter(Boolean)
          .join(", ");

        // Use the first image from the foreign table or fallback
        const imageUrl =
          row.projects_development_images?.[0]?.image_url ||
          "/placeholder.svg?height=300&width=500";

        return {
          id: row.id,
          title: row.title,
          budget: row.budget,
          type: row.type,
          status: row.status,
          startDate: row.start_date,
          endDate: row.target_date,
          description: row.description,
          location,
          imageUrl,
        } as CompletedProject;
      });

      setProjects(mapped);
    }
    fetchCompletedProjects();
  }, []);

  // Get unique project types for filtering
  const uniqueTypes = Array.from(
    new Set(projects.map((project) => project.type))
  );

  // Filter projects based on search term and filter type
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || project.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All project types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All project types</SelectItem>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No Completed SDG Project yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                  Completed
                </Badge>
              </div>
              <CardContent className="p-4 flex-grow">
                <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
                <p className="text-primary text-xl font-bold mb-2">
                  ₱{project.budget.toLocaleString()}
                </p>
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <p className="text-sm truncate">{project.location}</p>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Completed: {formatDate(project.endDate)}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm line-clamp-2">
                  {project.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/view-project/${project.id}`}>
                    View Project Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
