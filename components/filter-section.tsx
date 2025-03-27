"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from "lucide-react";

export default function FilterSection() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([1000, 5000]);

  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search by location, project name..."
            className="pl-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-2">
          <Select defaultValue="all">
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
            <Label htmlFor="price-range">Budget Range (₱)</Label>
            <div className="mt-2">
              <Slider
                defaultValue={[1000, 5000]}
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

          <div>
            <Label>Project Size</Label>
            <div className="flex gap-2 mt-2">
              {["Any", "Small", "Medium", "Large", "Extra Large"].map(
                (option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {option}
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button variant="outline">Reset</Button>
            <Button>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  );
}
