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

interface LaborRow {
  id: string;
  labor: string;
  category: string;
  quantity: number;
  cost: number;
  total_cost: number;
  created_at: string;
}

const formSchema = z.object({
  cost: z.coerce
    .number()
    .refine((value) => /^\d+(\.\d{2})$/.test(value.toFixed(2)), {
      message: "Cost must be a decimal with 2 decimal places",
    }),
});

export default function EditLabor({
  labor,
  onUpdated,
}: {
  labor: LaborRow;
  onUpdated: () => void;
}) {
  const [loader, setLoader] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cost: labor.cost,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoader(true);
    try {
      const now = new Date().toISOString();
      // Recalculate total_cost
      const total_cost = parseFloat((values.cost * labor.quantity).toFixed(2));

      const { data, error } = await supabase
        .from("labor_adding")
        .update({
          cost: values.cost,
          total_cost,
          // If you track update times:
          updated_at: now,
        })
        .eq("id", labor.id)
        .select("*");

      if (error) {
        toast.error("Server-side error");
        return;
      }
      if (!data || data.length === 0) {
        toast.error("Update failed: no data returned");
        return;
      }

      // Insert a record into labor_history
      const { error: historyError } = await supabase
        .from("labor_history")
        .insert([
          {
            labor: labor.labor,
            cost: values.cost,
            date: new Date().toISOString().split("T")[0],
            created_at: now,
          },
        ])
        .select("*");

      if (historyError) {
        toast.error("Error inserting into labor_history");
      }

      toast.success("Labor cost updated successfully");
      form.reset();
      onUpdated();
    } catch (error) {
      toast.error("Failed to update labor cost. Please try again.");
      console.error("Catch error:", error);
    } finally {
      setLoader(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-full mx-auto py-4 px-4"
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
