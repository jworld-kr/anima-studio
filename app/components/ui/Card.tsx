import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "ghost";
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = "default", interactive = false, className = "", ...rest },
    ref
  ) => {
    const variants = {
      default: "bg-paper border border-ink-200",
      muted: "bg-ink-50/60 border border-ink-200",
      ghost: "bg-transparent border border-ink-200",
    };
    const interactiveClass = interactive
      ? "hover:border-ink-300 transition-colors cursor-pointer"
      : "";
    return (
      <div
        ref={ref}
        className={`rounded-[10px] ${variants[variant]} ${interactiveClass} ${className}`}
        {...rest}
      />
    );
  }
);
Card.displayName = "Card";
