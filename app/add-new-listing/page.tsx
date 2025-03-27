"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Plus, Minus } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";
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

// 1) Create a function to generate the schema based on a minimum recommended budget.
const getFormSchema = (minBudget: number) =>
  z.object({
    projectTitle: z.string().min(1, "Project Title is required"),
    description: z.string().optional(),
    projectType: z.string().min(1, "Project Type is required"),
    budget: z.coerce
      .number({ invalid_type_error: "Budget must be a number" })
      .min(
        minBudget,
        `Budget must be at least ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "PHP",
        }).format(minBudget)}`
      ),
    area: z.coerce
      .number({ invalid_type_error: "Area must be a number" })
      .min(1, "Area is required"),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().min(1, "Target Completion Date is required"),
    address: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "ZIP Code is required"),
    country: z.string().min(1, "Country is required"),
    images: z.array(z.string()).min(1, "At least one image is required"),
    features: z
      .array(z.string().min(1, "Feature cannot be empty"))
      .min(1, "At least one feature is required"),
  });

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

// Create a separate component to handle searchParams
function SearchParamsProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  return children;
}

// Create the main content component
function AddNewListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  // State to disable form while submitting.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2) Keep two separate arrays in state:
  //    a) `images` for local preview URLs
  //    b) `uploadedFiles` for the actual File objects
  const [images, setImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // For features array
  const [features, setFeatures] = useState<string[]>([]);

  // For the recommended budget (grand total cost)
  const [grandTotalCost, setGrandTotalCost] = useState<number>(0);

  // For prefilling project title & description
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Read the query param for grandTotalCost, or fallback to DB if not present
  useEffect(() => {
    const paramGrandTotal = parseInt(
      searchParams.get("grandTotalCost") || "0",
      10
    );

    if (paramGrandTotal > 0) {
      setGrandTotalCost(paramGrandTotal);
    } else {
      async function fetchGrandTotalCost() {
        const { data, error } = await supabase
          .from("materials_labor")
          .select("total_cost");

        if (!error && data) {
          const total = data.reduce(
            (sum: number, row: any) => sum + row.total_cost,
            0
          );
          setGrandTotalCost(total);
        } else {
          setGrandTotalCost(0);
        }
      }
      fetchGrandTotalCost();
    }
  }, [searchParams]);

  // 4) If projectId is provided, fetch project name & description
  useEffect(() => {
    async function fetchProjectDetails() {
      if (!projectId) return;
      const { data, error } = await supabase
        .from("projects")
        .select("name, description")
        .eq("id", projectId)
        .single();
      if (!error && data) {
        setProjectTitle(data.name);
        setProjectDescription(data.description || "");
        // Update form fields with fetched details
        form.setValue("projectTitle", data.name);
        form.setValue("description", data.description || "");
      }
    }
    fetchProjectDetails();
  }, [projectId]);

  // 5) Calculate the minimum budget (fallback to 1 if none is fetched)
  const minBudget = grandTotalCost > 0 ? grandTotalCost : 1;

  // 6) Memoize the dynamic schema so that it updates when minBudget changes
  const schema = useMemo(() => getFormSchema(minBudget), [minBudget]);

  // 7) Setup react-hook-form with the dynamic schema
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectTitle,
      description: projectDescription,
      projectType: "",
      budget: 0,
      area: 0,
      startDate: "",
      endDate: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      images: [],
      features: [],
    },
  });

  // Update the budget field if minBudget changes
  useEffect(() => {
    form.setValue("budget", minBudget);
  }, [minBudget, form]);

  // 8) Keep `images` & `features` arrays in sync with the form
  useEffect(() => {
    form.setValue("images", images);
  }, [images, form]);

  useEffect(() => {
    form.setValue("features", features);
  }, [features, form]);

  // 9) When user selects files, store both local URLs (for display) and File objects
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newImages = [...images];
    const newFiles = [...uploadedFiles];

    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const localUrl = URL.createObjectURL(file);

      newImages.push(localUrl);
      newFiles.push(file);
    }
    setImages(newImages);
    setUploadedFiles(newFiles);
  };

  // Feature add/remove/update
  const addFeature = () => {
    setFeatures((prev) => [...prev, ""]);
  };

  const removeFeature = (index: number) => {
    setFeatures((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const updateFeature = (index: number, value: string) => {
    setFeatures((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // 10) onSubmit: Insert into "projects_development", then images and features.
  //     If any step fails, roll back the main insertion.
  //     Finally, update the "projects" table status to "Completed".
  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);

    // 10.1) Insert into "projects_development"
    const { data: devData, error: devError } = await supabase
      .from("projects_development")
      .insert({
        project_id: projectId, // from the query param
        title: values.projectTitle,
        description: values.description,
        type: values.projectType,
        budget: values.budget,
        area: values.area,
        status: "In Progress", // explicitly set
        start_date: values.startDate,
        target_date: values.endDate,
        street: values.address,
        city: values.city,
        state: values.state,
        zip_code: values.zip,
        country: values.country,
      })
      .select()
      .single();

    if (devError || !devData) {
      alert(devError?.message || "Error inserting development data");
      setIsSubmitting(false);
      return;
    }

    // Save the newly inserted development ID.
    const developmentId = devData.id;

    let allSucceeded = true; // flag to track transaction success

    // 10.2) Upload each file to the "development-images" bucket without a folder
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      // File path now has no folder: just a timestamp and filename.
      const filePath = `${Date.now()}-${file.name}`;

      const { error: storageError } = await supabase.storage
        .from("development-images")
        .upload(filePath, file);

      if (storageError) {
        console.error(`Failed to upload ${file.name}:`, storageError.message);
        allSucceeded = false;
        break;
      }

      // Retrieve the public URL for the file.
      const { data: publicUrlData } = supabase.storage
        .from("development-images")
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData?.publicUrl || "";

      // Insert record into "projects_development_images"
      const { error: imgError } = await supabase
        .from("projects_development_images")
        .insert({
          development_id: developmentId,
          image_url: imageUrl,
        });

      if (imgError) {
        console.error(
          `Failed to insert image record for ${file.name}:`,
          imgError.message
        );
        allSucceeded = false;
        break;
      }
    }

    // 10.3) Insert each feature into "projects_development_features"
    for (const feature of features) {
      if (feature.trim().length === 0) continue;
      const { error: featError } = await supabase
        .from("projects_development_features")
        .insert({
          development_id: developmentId,
          name: feature,
        });

      if (featError) {
        console.error("Failed to insert feature:", featError.message);
        allSucceeded = false;
        break;
      }
    }

    // If any step failed, roll back the main "projects_development" insert.
    if (!allSucceeded) {
      await supabase
        .from("projects_development")
        .delete()
        .eq("id", developmentId);
      alert("Transaction failed. No data was saved.");
      setIsSubmitting(false);
      return;
    }

    // 10.4) Update the project status in the "projects" table to "Completed".
    const { error: updateError } = await supabase
      .from("projects")
      .update({ status: "Completed" })
      .eq("id", projectId);

    if (updateError) {
      console.error("Failed to update project status:", updateError.message);
      alert("Project was created but failed to update project status.");
      setIsSubmitting(false);
      return;
    }

    // 10.5) If all succeeded, complete the process.
    alert("Project created successfully!");
    router.push("/");
  };

  return (
    <SidebarInset>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Setup SDG Development Project</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Wrap form fields in a fieldset to disable them during submission */}
          <fieldset disabled={isSubmitting}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Title */}
                  <FormField
                    control={form.control}
                    name="projectTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Modern Residence in Downtown"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Project Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Residential">
                                Residential
                              </SelectItem>
                              <SelectItem value="Commercial">
                                Commercial
                              </SelectItem>
                              <SelectItem value="Industrial">
                                Industrial
                              </SelectItem>
                              <SelectItem value="Infrastructure">
                                Infrastructure
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Budget & Area */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Budget (₱){" "}
                            <span className="text-xs font-light">
                              (Minimum Recommended Budget:{" "}
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "PHP",
                              }).format(minBudget)}
                              )
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="e.g. 250000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area (sq ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="e.g. 1200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Start & End Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Completion Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Right column */}
              <div className="space-y-8">
                {/* Location Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="ZIP Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Images Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop images here or click to browse
                      </p>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("images")?.click()
                        }
                      >
                        Upload Images
                      </Button>
                    </div>
                    {form.formState.errors.images && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.images.message}
                      </p>
                    )}
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square bg-gray-100 rounded-md overflow-hidden"
                          >
                            <img
                              src={image}
                              alt={`Project image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => {
                                setImages(images.filter((_, i) => i !== index));
                                setUploadedFiles(
                                  uploadedFiles.filter(
                                    (_, fIdx) => fIdx !== index
                                  )
                                );
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Features Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Features</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addFeature}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Feature
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {form.formState.errors.features?.message && (
                      <p className="text-red-500 text-xs mb-2">
                        {form.formState.errors.features.message}
                      </p>
                    )}
                    {Array.isArray(form.formState.errors.features) &&
                      form.formState.errors.features.map((err, i) => (
                        <p key={i} className="text-red-500 text-xs mb-2">
                          {err?.message}
                        </p>
                      ))}
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="e.g. 4 Bedrooms, Smart Home Technology, etc."
                          className="mr-2"
                        />
                        {features.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </fieldset>

          <div className="mt-8 flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating Project..." : "Create Project"}
            </Button>
          </div>
        </form>
      </Form>
    </SidebarInset>
  );
}

// Default export with Suspense
export default function AddNewListing() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsProvider>
        <AddNewListingContent />
      </SearchParamsProvider>
    </Suspense>
  );
}
