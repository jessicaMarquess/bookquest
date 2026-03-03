"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecionar data",
  className,
}: DatePickerProps) {
  const date = value ? new Date(value + "T12:00:00") : undefined;

  function handleSelect(selected: Date | undefined) {
    if (!selected) return;
    const iso = selected.toISOString().split("T")[0];
    onChange(iso);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors hover:bg-transparent hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
