import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "anima";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.005em] " +
  "transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[6px]",
  md: "h-10 px-4 text-[14px] rounded-[10px]",
  lg: "h-12 px-6 text-[15px] rounded-[10px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-ink-800 text-ink-50 hover:bg-ink-700 active:bg-ink-900 " +
    "shadow-[0_1px_2px_rgba(11,10,7,0.12)]",
  secondary:
    "bg-ink-50 text-ink-700 border border-ink-200 hover:bg-ink-100 " +
    "hover:border-ink-300",
  ghost: "bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-800",
  anima:
    "bg-anima-400 text-ink-50 hover:bg-anima-500 active:bg-anima-600 " +
    "shadow-[0_1px_2px_rgba(11,10,7,0.12)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leadingIcon,
      trailingIcon,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...rest}
      >
        {leadingIcon && <span className="-ml-0.5 flex">{leadingIcon}</span>}
        {children}
        {trailingIcon && <span className="-mr-0.5 flex">{trailingIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
