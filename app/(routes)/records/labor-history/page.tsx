"use client";

import { useEffect, useState, useCallback } from "react";
import { LaborHistory, columns } from "./columns";
import { DataTable } from "./LaborHistoryForms";
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
import { supabase } from "@/utils/supabase/client";

// Fetch labor history records ordered by created_at (descending)
async function getData(): Promise<LaborHistory[]> {
  const { data, error } = await supabase
    .from("labor_history")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching labor history", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    labor: item.labor,
    cost: item.cost ?? 0,
    // "date" is displayed, but "created_at" is used only for ordering
    date: item.date ?? "N/A",
  }));
}

export default function LaborHistoryPage() {
  const [data, setData] = useState<LaborHistory[]>([]);

  // Reusable function to fetch data
  const fetchLaborHistory = useCallback(async () => {
    const records = await getData();
    setData(records);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchLaborHistory();

    // Real-time subscription to labor_history inserts
    const channel = supabase
      .channel("labor_history")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "labor_history" },
        () => {
          // Re-fetch the entire dataset whenever a new row is inserted
          fetchLaborHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLaborHistory]);

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
                <BreadcrumbPage>Labor History</BreadcrumbPage>
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
