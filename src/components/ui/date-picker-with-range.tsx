"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface DatePickerWithRangeProps {
  className?: string;
  date?: DateRange;
  setDate?: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  accentColor?: string;
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  accentColor = "emerald"
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-slate-100 border-slate-300 hover:bg-slate-200 hover:text-slate-900 text-slate-800",
              !date && "text-slate-600",
              accentColor === "emerald" ? "focus:ring-emerald-500/50" : "focus:ring-blue-500/50"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {date.from.toLocaleDateString("pt-BR")} -{" "}
                  {date.to.toLocaleDateString("pt-BR")}
                </>
              ) : (
                date.from.toLocaleDateString("pt-BR")
              )
            ) : (
              <span>Selecione um período...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-col" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            locale={ptBR}
          />
          {date && (
            <div className="p-2 border-t border-slate-200">
              <Button
                variant="ghost"
                className="w-full h-8 text-xs font-medium text-slate-500 hover:text-slate-900"
                onClick={() => setDate(undefined)}
              >
                Limpar Período
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
