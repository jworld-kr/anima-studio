import { CSSProperties } from "react";

interface InkIconProps {
  size?: number;
  variant?: "outline" | "filled";
  className?: string;
  style?: CSSProperties;
  /** Override fill color. Defaults to currentColor. */
  color?: string;
}

/**
 * Anima Ink mark.
 * A teardrop-shaped ink droplet with a subtle highlight — feels like
 * one stroke of ink poised to fall, rather than a generic water drop.
 *
 * Used wherever "잉크" appears: balance counters, package cards,
 * deduction tooltips, etc.
 */
export function InkIcon({
  size = 16,
  variant = "filled",
  className = "",
  style,
  color = "currentColor",
}: InkIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      {variant === "filled" ? (
        <>
          {/* main droplet body */}
          <path
            d="M12 2.5C12 2.5 5 10.4 5 15.2C5 18.85 8.13 21.5 12 21.5C15.87 21.5 19 18.85 19 15.2C19 10.4 12 2.5 12 2.5Z"
            fill={color}
          />
          {/* small highlight — gives the droplet a sense of liquid */}
          <path
            d="M9.5 16.2C9.5 17.55 10.5 18.6 11.85 18.7"
            stroke="white"
            strokeOpacity="0.45"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* outline-only droplet */}
          <path
            d="M12 3C12 3 5.5 10.5 5.5 15.2C5.5 18.55 8.4 21 12 21C15.6 21 18.5 18.55 18.5 15.2C18.5 10.5 12 3 12 3Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
          {/* inner highlight stroke */}
          <path
            d="M9.5 16.2C9.5 17.55 10.5 18.6 11.85 18.7"
            stroke={color}
            strokeOpacity="0.5"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

/**
 * Larger, decorative ink bottle mark — used on charge package cards.
 * The shape changes subtly between sizes (small / regular / large)
 * so the three packages feel visually distinct in a row.
 */
interface InkBottleProps {
  size?: "small" | "regular" | "large";
  className?: string;
}

export function InkBottle({
  size = "regular",
  className = "",
}: InkBottleProps) {
  const dims = {
    small: { width: 28, height: 36, neckWidth: 10, bodyHeight: 22 },
    regular: { width: 36, height: 48, neckWidth: 12, bodyHeight: 30 },
    large: { width: 44, height: 60, neckWidth: 14, bodyHeight: 40 },
  }[size];

  // 24-pt grid, scaled
  const w = dims.width;
  const h = dims.height;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Neck */}
      <rect
        x={(w - dims.neckWidth) / 2}
        y={0}
        width={dims.neckWidth}
        height={h - dims.bodyHeight - 1}
        rx={1.5}
        fill="currentColor"
        fillOpacity="0.18"
      />
      {/* Cork / cap line */}
      <line
        x1={(w - dims.neckWidth) / 2 - 1}
        x2={(w + dims.neckWidth) / 2 + 1}
        y1={2.5}
        y2={2.5}
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Bottle body */}
      <path
        d={`
          M ${(w - dims.neckWidth) / 2 - 4} ${h - dims.bodyHeight}
          L ${(w + dims.neckWidth) / 2 + 4} ${h - dims.bodyHeight}
          L ${w - 2} ${h - 2}
          Q ${w - 2} ${h} ${w - 4} ${h}
          L 4 ${h}
          Q 2 ${h} 2 ${h - 2}
          Z
        `}
        fill="currentColor"
        fillOpacity="0.85"
      />
      {/* Liquid surface highlight */}
      <ellipse
        cx={w / 2}
        cy={h - dims.bodyHeight + 1}
        rx={(dims.neckWidth + 6) / 2}
        ry={1.2}
        fill="white"
        fillOpacity="0.18"
      />
      {/* Bottom shadow */}
      <ellipse
        cx={w / 2}
        cy={h - 4}
        rx={(w - 6) / 2}
        ry={1.6}
        fill="black"
        fillOpacity="0.08"
      />
    </svg>
  );
}
