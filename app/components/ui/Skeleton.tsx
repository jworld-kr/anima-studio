import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[6px] bg-ink-100 ${className}`}
      style={style}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[skeleton_1.6s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
