import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "muted" | "anima" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  dotColor?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-ink-100 text-ink-700 border-ink-200",
  muted: "bg-transparent text-ink-500 border-ink-200",
  anima: "bg-anima-50 text-anima-700 border-anima-200",
  success: "bg-[rgba(95,139,110,0.10)] text-[#3d6049] border-[rgba(95,139,110,0.25)]",
  warning: "bg-[rgba(201,169,97,0.12)] text-[#7a6428] border-[rgba(201,169,97,0.30)]",
  danger: "bg-[rgba(181,86,74,0.10)] text-[#7c3a31] border-[rgba(181,86,74,0.25)]",
};

export function Badge({
  variant = "default",
  dot = false,
  dotColor,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium tracking-[0.005em] ${variants[variant]} ${className}`}
      {...rest}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dotColor ?? "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}
