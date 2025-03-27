"use client";

import { Material, columns } from "./columns";
import { DataTable } from "./MaterialHistory";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

// Fetch from material_history, ordering by created_at DESC, still using "date" in the UI
async function getData(): Promise<Material[]> {
  const { data, error } = await supabase
    .from("material_history")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching data", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    name: item.material,
    cost: item.cost ?? 0,
    date: item.date ?? "N/A",
  }));
}

export default function DemoPage() {
  const [data, setData] = useState<Material[]>([]);

  // Reusable fetch function
  async function fetchMaterials() {
    const materials = await getData();
    setData(materials);
  }

  useEffect(() => {
    // Initial fetch
    fetchMaterials();

    // Real-time subscription to material_adding
    const channel = supabase
      .channel("material_adding")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "material_adding" },
        () => {
          // Re-fetch the entire dataset whenever a new row is inserted
          fetchMaterials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/records">Resources</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Material History</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </SidebarInset>
  );
}
