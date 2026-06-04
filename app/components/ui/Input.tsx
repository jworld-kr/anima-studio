import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputBase =
  "w-full bg-paper border border-ink-200 rounded-[6px] " +
  "text-[14px] text-ink-700 placeholder:text-ink-400 " +
  "transition-colors duration-150 " +
  "hover:border-ink-300 " +
  "focus:outline-none focus:border-ink-700 focus:ring-0 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={`${inputBase} h-10 px-3 ${className}`}
        {...rest}
      />
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", rows = 4, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`${inputBase} px-3 py-2.5 leading-[1.6] resize-y ${className}`}
        {...rest}
      />
    );
  }
);
Textarea.displayName = "Textarea";

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function Label({
  children,
  htmlFor,
  hint,
  required,
  className = "",
}: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`block ${className}`}>
      <span className="text-[13px] font-medium text-ink-700 tracking-[-0.005em]">
        {children}
        {required && <span className="text-anima-500 ml-0.5">*</span>}
      </span>
      {hint && (
        <span className="block mt-0.5 text-[12px] text-ink-400 leading-[1.5]">
          {hint}
        </span>
      )}
    </label>
  );
}
