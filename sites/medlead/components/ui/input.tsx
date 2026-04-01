import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground placeholder:font-normal selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-[#b2bcca] h-11 w-full min-w-0 rounded border bg-white px-4 py-2 text-[15px] font-semibold text-[#4f4f4f] shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string;
}

function FloatingInput({ className, label, type, id, ...props }: FloatingInputProps) {
  return (
    <div className="relative">
      <div className="absolute -top-2.5 left-3 bg-white px-2 z-10">
        <label htmlFor={id} className="text-xs font-normal text-[#828282]">
          {label}
        </label>
      </div>
      <input
        type={type}
        id={id}
        data-slot="input"
        className={cn(
          "placeholder:text-muted-foreground placeholder:font-normal selection:bg-primary selection:text-primary-foreground border-[#b2bcca] h-11 w-full min-w-0 rounded border bg-white px-4 py-2 text-[15px] font-semibold text-[#4f4f4f] transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input, FloatingInput }
