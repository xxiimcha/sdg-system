"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface SupabaseDevImage {
  image_url: string;
}

interface SupabaseDevProject {
  id: string;
  title: string;
  budget?: number;
  type: string;
  status: string;
  start_date?: string;
  target_date?: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  projects_development_images?: SupabaseDevImage[];
}

interface CompletedProject {
  id: string;
  title: string;
  type: string;
  location: string;
  imageUrl: string;
}

export function CompletedDevelopmentListing() {
  const [projects, setProjects] = useState<CompletedProject[]>([]);

  useEffect(() => {
    async function fetchCompletedProjects() {
      const { data, error } = await supabase
        .from("projects_development")
        .select(
          `
          id,
          title,
          type,
          status,
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
        const location = [
          row.street,
          row.city,
          row.state,
          row.zip_code,
          row.country,
        ]
          .filter(Boolean)
          .join(", ");

        const imageUrl =
          row.projects_development_images?.[0]?.image_url || "/placeholder.svg";

        return {
          id: row.id,
          title: row.title,
          type: row.type,
          location,
          imageUrl,
        };
      });

      setProjects(mapped);
    }

    fetchCompletedProjects();
  }, []);

  if (projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <p className="text-muted-foreground text-lg">
          No Completed SDG Project yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
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
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{project.type}</p>
            <div className="flex items-center text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <p className="text-sm truncate">{project.location}</p>
            </div>
            <Button variant="outline" className="w-full mt-2" asChild>
              <Link href={`/view-project/${project.id}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
