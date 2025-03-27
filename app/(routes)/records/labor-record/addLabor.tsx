"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/utils/supabase/client";

const formSchema = z.object({
  labor: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(1, "Number of Workers is required"),
  cost: z.coerce
    .number()
    .refine((value) => /^\d+(\.\d{2})$/.test(value.toFixed(2)), {
      message: "Cost must be a decimal with 2 decimal places",
    }),
  category: z.string().min(1, "Category is required"),
});

export default function AddLaborForm({
  onLaborAdded,
}: {
  onLaborAdded: (newLabor: any) => void;
}) {
  const [loader, setLoader] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      labor: "",
      quantity: 1,
      cost: 0.0,
      category: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoader(true);
    try {
      // Calculate total cost
      const total_cost = parseFloat((values.cost * values.quantity).toFixed(2));
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("labor_adding")
        .insert([
          {
            labor: values.labor,
            quantity: values.quantity,
            cost: values.cost,
            total_cost,
            category: values.category,
            created_at: now,
          },
        ])
        .select();

      if (data && data.length > 0) {
        // Also insert into labor_history
        const { error: historyError } = await supabase
          .from("labor_history")
          .insert([
            {
              labor: values.labor,
              cost: values.cost,
              date: new Date().toISOString().split("T")[0],
              created_at: now,
            },
          ])
          .select();

        if (historyError) {
          toast.error("Error inserting into labor_history");
        }

        toast.success("New Labor Added!");
        onLaborAdded(data[0]); // Notify parent
        form.reset(); // Clear form
      }
      if (error) {
        console.error("Error", error);
        toast.error("Server-side error");
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setLoader(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-full mx-auto py-6 px-4"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Name of Labor */}
          <FormField
            control={form.control}
            name="labor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name of Labor</FormLabel>
                <FormControl>
                  <Input placeholder="Enter labor name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity */}
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Workers</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Number of workers"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost */}
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter cost (e.g., 65.00)"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select labor category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Management and Supervision">
                      Management and Supervision
                    </SelectItem>
                    <SelectItem value="General Laborers">General Laborers</SelectItem>
                    <SelectItem value="Masonry">Masonry</SelectItem>
                    <SelectItem value="Carpentry">Carpentry</SelectItem>
                    <SelectItem value="Steel Works">Steel Works</SelectItem>
                    <SelectItem value="Electrical Works">Electrical Works</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Painting and Finishing">
                      Painting and Finishing
                    </SelectItem>
                    <SelectItem value="Heavy Equipment Operators">
                      Heavy Equipment Operators
                    </SelectItem>
                    <SelectItem value="Safety and Inspection">
                      Safety and Inspection
                    </SelectItem>
                    <SelectItem value="Administrative Support">
                      Administrative Support
                    </SelectItem>
                    <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

            )}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={loader}>
          {loader ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
