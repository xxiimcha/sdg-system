"use client";

import { useCallback, useEffect, useState } from "react";
import { Labor, columns } from "./columns";
import { DataTable } from "./LaborRecordForms";
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

export default function LaborRecordPage() {
  const [data, setData] = useState<Labor[]>([]);
  const [loading, setLoading] = useState(true);

  // Dedicated fetch function that can be called after editing or adding
  const fetchLaborRecords = useCallback(async () => {
    const { data: laborData, error } = await supabase
      .from("labor_adding")
      .select("*")
      .order("id", { ascending: false });

    if (laborData) {
      setData(
        laborData.map((item) => ({
          id: item.id,
          labor: item.labor,
          category: item.category,
          quantity: item.quantity,
          cost: item.cost,
          total_cost: item.total_cost,
          created_at: item.created_at,
        }))
      );
    } else {
      console.error("Error fetching labor records:", error);
    }
    setLoading(false);
  }, []);

  // Fetch labor records on mount
  useEffect(() => {
    fetchLaborRecords();
  }, [fetchLaborRecords]);

  return (
    <SidebarInset>
      {/* Page Header */}
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
                <BreadcrumbPage>Labor Record</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto py-10">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          refreshLabor={fetchLaborRecords}
        />
      </div>
    </SidebarInset>
  );
}
