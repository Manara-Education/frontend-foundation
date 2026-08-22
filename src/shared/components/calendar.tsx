"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

// react-day-picker v10 renamed every `classNames` key and moved the day
// modifiers onto the grid cell. Two consequences shape the map below:
//
//   * `cell` -> `day` (the <td>) and `day` -> `day_button` (the <button>).
//   * `selected` / `today` / `outside` / `disabled` / `hidden` / `range_*` are
//     now merged into the <td>'s class list, and `aria-selected` is set on that
//     same <td>. In v8 both lived on the button, which is why the old map used
//     `[&:has([aria-selected])]` from the cell; the equivalent is now a plain
//     `aria-selected:` on the cell itself.
//
// So the cell owns the backgrounds and text colours, and the button stays
// transparent on top of it — the ghost variant contributes no colour of its own,
// only hover, which is neutralised here so it cannot paint over a selected day.

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1",
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 aria-selected:bg-accent",
          props.mode === "range" ? "" : "aria-selected:rounded-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal bg-transparent hover:bg-transparent hover:text-inherit",
        ),
        range_start:
          "rounded-l-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_end:
          "rounded-r-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        selected: "bg-primary text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "text-muted-foreground aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ) : (
            <ChevronRight
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
