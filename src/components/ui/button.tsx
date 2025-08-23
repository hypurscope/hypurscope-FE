"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
}

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none gap-1";

const variants: Record<string, string> = {
  default: "bg-[#0A57FF] text-white hover:bg-[#004ae6]",
  outline: "border border-[#D5D5D5] bg-white text-[#3C3C3C] hover:bg-[#F4F7FF]",
  ghost: "hover:bg-black/5 text-[#3C3C3C]",
  secondary: "bg-[#EEF3FF] text-[#0A57FF] hover:bg-[#DDEAFF]",
  destructive: "bg-red-500 text-white hover:bg-red-600",
};

const sizes: Record<string, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4",
  lg: "h-11 px-6 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
