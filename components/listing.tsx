"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Heart,
  Clock,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface SupabaseDevImage {
  image_url: string;
}

interface SupabaseDevProject {
  id: string;
  project_id: string;
  title: string;
  budget: number;
  type: string;
  status: string;
  start_date: string;
  target_date: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  projects_development_images?: SupabaseDevImage[];
}

interface Project {
  id: string;
  projectId: string;
  title: string;
  budget: number;
  location: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
}

export default function Listing() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Note: The select items below are lower-case so we compare with a lower-case type.
  const [selectedType, setSelectedType] = useState("all");
  // Set default price range to [1000, 100000000] so all projects show by default
  const [priceRange, setPriceRange] = useState([1000, 100000000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch all "In Progress" projects from "projects_development"
  useEffect(() => {
    async function fetchInProgressProjects() {
      const { data, error } = await supabase
        .from("projects_development")
        .select(
          `
          id,
          project_id,
          title,
          budget,
          type,
          status,
          start_date,
          target_date,
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
        .eq("status", "In Progress");

      if (error) {
        console.error("Error fetching data:", error.message);
        return;
      }
      if (!data) return;

      // Transform each row to match our Project interface
      const mapped = data.map((row: SupabaseDevProject) => {
        // Combine address fields into a single location string
        const location = [
          row.street,
          row.city,
          row.state,
          row.zip_code,
          row.country,
        ]
          .filter(Boolean)
          .join(", ");

        // Use the first image as a thumbnail or a placeholder if none
        const imageUrl =
          row.projects_development_images?.[0]?.image_url ||
          "/placeholder.svg?height=300&width=500";

        return {
          id: row.id,
          projectId: row.project_id,
          title: row.title,
          budget: row.budget,
          location,
          type: row.type,
          status: row.status,
          startDate: row.start_date,
          endDate: row.target_date,
          imageUrl,
        } as Project;
      });

      setProjects(mapped);
    }

    fetchInProgressProjects();
  }, []);

  // Filter logic: Compare project.type in lowercase with selectedType.
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || project.type.toLowerCase() === selectedType;

    const matchesBudget =
      project.budget >= priceRange[0] && project.budget <= priceRange[1];

    return matchesSearch && matchesType && matchesBudget;
  });

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-amber-100 text-amber-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Filter Section */}
      <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search by location, project name..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="text-sm font-medium">Budget Range (₱)</label>
              <div className="mt-2">
                <Slider
                  defaultValue={[1000, 100000000]}
                  max={100000000}
                  step={100}
                  onValueChange={(value) => setPriceRange(value as number[])}
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>₱{priceRange[0].toLocaleString()}</span>
                  <span>₱{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Listing */}
      {filteredProjects.length === 0 ? (
        <div className="flex justify-center items-center py-10 text-muted-foreground">
          No SDG Project in development yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="relative">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    <p className="text-primary text-xl font-bold">
                      ₱{project.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <p className="text-sm truncate">{project.location}</p>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {formatDate(project.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {formatDate(project.endDate)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Link href={`/view-project/${project.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
                <Link href={`/projects/${project.projectId}`}>
                  <Button variant="secondary">Project Plan</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}