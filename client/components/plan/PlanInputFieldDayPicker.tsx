"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Day } from "@/lib/types";

const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type PlanInputFieldDayPickerProps = {
  value: Day[];
  onChange: (next: Day[]) => void;
  placeholder?: string;
  buttonClassName?: string;
  disabled?: boolean;
};

export default function PlanInputFieldDayPicker({
  value,
  onChange,
  placeholder = "Select available days",
  buttonClassName,
  disabled,
}: PlanInputFieldDayPickerProps) {
  const [open, setOpen] = React.useState(false);

  const toggleDay = (d: Day) => {
    const set = new Set(value);
    if (set.has(d)) set.delete(d);
    else set.add(d);
    onChange(Array.from(set));
  };

  const label = React.useMemo(() => {
    if (!value?.length) return placeholder;
    // Show up to 3 days; else show count
    const sorted = DAYS.filter((d) => value.includes(d));
    return sorted.length <= 3
      ? sorted.join(", ")
      : `${sorted.length} days selected`;
  }, [value, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", buttonClassName)}
          disabled={disabled}
        >
          <span className={cn(!value?.length && "text-muted-foreground")}>
            {label}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width]"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search day…" />
          <CommandList>
            <CommandEmpty>No day found.</CommandEmpty>

            <CommandGroup heading="Weekdays">
              {DAYS.map((d) => {
                const checked = value?.includes(d) ?? false;
                return (
                  <CommandItem
                    key={d}
                    value={d}
                    // allow keyboard selection
                    onSelect={() => toggleDay(d)}
                    className="gap-2"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleDay(d)}
                      aria-label={d}
                    />
                    <span className="flex-1">{d}</span>
                    {checked && <Check className="h-4 w-4 opacity-70" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
