import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface DatePickerProps {
    selectedDate: string;
    onChange: (date: string) => void;
    label: string;
}

export function DatePicker({ selectedDate, onChange, label }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        selectedDate ? new Date(selectedDate) : undefined
    );

    const handleDateChange = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);
            onChange(newDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
        }
    };

    return (
        <div>
            <label className="block text-gray-700">{label}</label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline">
                        {date ? format(date, "PPP") : "Pick a date"}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                    <Calendar mode="single" selected={date} onSelect={handleDateChange} />
                </PopoverContent>
            </Popover>
        </div>
    );
}
