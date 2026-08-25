import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50 " +
  "backdrop-blur-md border shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]",
  {
    variants: {
      variant: {
        default: "bg-secondary/60 hover:bg-secondary border-border/40 text-slate-700 hover:text-slate-900",
        primary: "bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]",
        blue: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-500 dark:text-blue-400",
        emerald: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        activeBlue: "bg-[#054579ff] hover:bg-[#07132b]/80 border-blue-900 text-white shadow-[0_0_15px_rgba(30,58,138,0.5)]",
        activeEmerald: "bg-[#07132b] hover:bg-[#07132b]/80 border-blue-900 text-white shadow-[0_0_15px_rgba(30,58,138,0.5)]",
      },
      size: {
        default: "px-5 py-2 text-sm",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-8 py-3 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(glassButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Camada de brilho superior para o efeito de vidro */}
        <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        {children}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
