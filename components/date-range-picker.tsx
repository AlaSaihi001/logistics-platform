"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  align?: "start" | "center" | "end";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  showCompactText?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  align = "start",
  className,
  disabled = false,
  loading = false,
  placeholder = "Sélectionner une période",
  showCompactText = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Predefined date ranges
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const predefinedRanges = [
    { label: "Aujourd'hui", range: { from: today, to: today } },
    { label: "Hier", range: { from: yesterday, to: yesterday } },
    { label: "7 derniers jours", range: { from: last7Days, to: today } },
    { label: "30 derniers jours", range: { from: last30Days, to: today } },
    { label: "Ce mois", range: { from: thisMonth, to: nextMonth } },
    { label: "Mois précédent", range: { from: lastMonth, to: lastMonthEnd } },
  ];

  const handlePredefinedRangeClick = (range: DateRange) => {
    onChange(range);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!value?.from) {
      return placeholder;
    }

    if (!value.to) {
      return format(value.from, "PPP", { locale: fr });
    }

    if (showCompactText) {
      return `${format(value.from, "dd/MM/yyyy")} - ${format(
        value.to,
        "dd/MM/yyyy"
      )}`;
    }

    return `${format(value.from, "PPP", { locale: fr })} - ${format(
      value.to,
      "PPP",
      { locale: fr }
    )}`;
  };

  if (loading) {
    return <Skeleton className={cn("h-10 w-[250px]", className)} />;
  }

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex flex-col sm:flex-row">
            <div className="border-r p-2 sm:w-40">
              <div className="space-y-1">
                {predefinedRanges.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left text-sm"
                    onClick={() => handlePredefinedRangeClick(item.range)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              locale={fr}
              required={true} // Ensure 'required' is set to true
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
