"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";

export interface MaterialRow {
  id: number;
  material: string; // original property (e.g., the internal identifier)
  name: string; // display name for history insert
  unit: string;
  category: string;
  quantity: number;
  cost: number;
  total_cost: number;
  created_at?: string;
  updated_at?: string;
}

const formSchema = z.object({
  cost: z.coerce
    .number()
    .refine((value) => /^\d+(\.\d{2})$/.test(value.toFixed(2)), {
      message: "Cost must be a decimal with 2 decimal places",
    }),
});

export default function EditMaterial({
  material,
  onMaterialUpdated,
  onClose,
}: {
  material: MaterialRow;
  onMaterialUpdated: (updatedMaterial: MaterialRow) => void;
  onClose: () => void;
}) {
  const [loader, setLoader] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost: material.cost,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting form with values:", values);
    console.log("Material before update:", material);
    setLoader(true);
    try {
      const now = new Date().toISOString();
      const total_cost = parseFloat(
        (values.cost * material.quantity).toFixed(2)
      );
      console.log("Calculated total_cost:", total_cost);

      const { data, error } = await supabase
        .from("material_adding")
        .update({
          cost: values.cost,
          total_cost,
          updated_at: now,
        })
        .eq("id", material.id)
        .select("*");
      console.log("Update response:", data, error);

      if (error) {
        toast.error("Server-side error");
        console.log("Update error:", error);
        return;
      }
      if (!(data && data.length > 0)) {
        toast.error("Update failed: no data returned");
        console.log("No data returned after update:", data);
        return;
      }

      // Insert a record into material_history using the displayed material name.
      const { error: historyError } = await supabase
        .from("material_history")
        .insert([
          {
            material: material.name, // using the display name passed to the dialog
            cost: values.cost,
            date: new Date().toISOString().split("T")[0],
            created_at: now,
          },
        ])
        .select("*");
      console.log("History insert error:", historyError);

      if (historyError) {
        toast.error("Error inserting into material history");
      }

      onMaterialUpdated(data[0]);
      toast.success("Material updated successfully");
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Failed to update the material. Please try again.");
      console.log("Catch error:", error);
    } finally {
      setLoader(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-full mx-auto py-10 px-4"
      >
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter cost (e.g., 65.00)"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : "")
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loader}>
          {loader ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
