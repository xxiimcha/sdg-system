"use client";

import { useEffect, useState, useCallback } from "react";
import { Material, columns } from "./columns";
import { DataTable } from "./MaterialsForm";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MaterialRecordPage() {
  const [data, setData] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Dedicated fetch function that refreshes the parent's data
  const fetchMaterials = useCallback(async () => {
    const { data, error } = await supabase
      .from("material_adding")
      .select("*")
      .order("id", { ascending: false });
    if (data) {
      setData(
        data.map((item) => ({
          id: item.id,
          name: item.material,
          unitOfMeasurement: item.unit,
          cost: item.cost,
          total_cost: item.total_cost,
          category: item.category,
          quantity: item.quantity,
          created_at: item.created_at,
        }))
      );
    } else {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

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
                <BreadcrumbPage>Add Materials</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="container mx-auto py-10">
        {loading ? (
          <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col, colIndex) => (
                        <TableHead key={col.id || `col-${colIndex}`}>
                          <Skeleton className="h-6 w-24" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map((_, colIndex) => (
                          <TableCell key={colIndex}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            refreshMaterials={fetchMaterials}
          />
        )}
      </div>
    </SidebarInset>
  );
}
