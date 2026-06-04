import { CSSProperties, ReactNode } from "react";

interface LogoProps {
  variant?: "wordmark" | "lockup" | "mark" | "block";
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Tagline shown under the lockup in the `block` variant. */
  tagline?: ReactNode;
  /** Small "for X" label aligned to the right of the tagline. */
  forLabel?: string;
}

/**
 * Anima logo. Fraunces wordmark with the dot of "i" replaced by a circle —
 * the seed/breath metaphor.
 */
export function Logo({
  variant = "wordmark",
  size = 28,
  className = "",
  style,
  tagline,
  forLabel,
}: LogoProps) {
  if (variant === "mark") {
    return (
      <span
        className={`inline-flex items-center justify-center font-display ${className}`}
        style={{
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          fontWeight: 400,
          ...style,
        }}
      >
        A
      </span>
    );
  }

  if (variant === "lockup") {
    return (
      <span
        className={`inline-flex items-baseline gap-[0.35em] ${className}`}
        style={style}
      >
        <Wordmark size={size} />
        <span
          className="font-sans text-ink-400"
          style={{
            fontSize: size * 0.42,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          studio
        </span>
      </span>
    );
  }

  if (variant === "block") {
    return (
      <div className={className} style={style}>
        <div className="flex items-baseline justify-between gap-3 w-full">
          <Logo variant="lockup" size={size} />
          {forLabel && (
            <span
              className="font-sans text-ink-300 shrink-0"
              style={{
                fontSize: size * 0.5,
                letterSpacing: "0.04em",
                fontWeight: 400,
                fontStyle: "italic",
              }}
            >
              {forLabel}
            </span>
          )}
        </div>
        {tagline && (
          <p
            className="mt-2 font-sans text-ink-500"
            style={{
              fontSize: size * 0.55,
              lineHeight: 1.45,
              letterSpacing: "-0.005em",
              fontWeight: 400,
            }}
          >
            {tagline}
          </p>
        )}
      </div>
    );
  }

  return <Wordmark size={size} className={className} style={style} />;
}

function Wordmark({
  size,
  className = "",
  style,
}: {
  size: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`font-display inline-flex items-baseline ${className}`}
      style={{
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        fontWeight: 400,
        ...style,
      }}
    >
      <span>An</span>
      <span className="relative inline-block" style={{ width: "0.3em" }}>
        {/* the "i" stem without dot */}
        <span
          className="absolute"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 0,
            width: "0.06em",
            height: "0.55em",
            background: "currentColor",
            borderRadius: "0.02em",
          }}
        />
        {/* dot replaced by circle (seed) */}
        <span
          className="absolute rounded-full"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            top: "0.02em",
            width: "0.16em",
            height: "0.16em",
            background: "currentColor",
          }}
        />
      </span>
      <span>ma</span>
    </span>
  );
}
