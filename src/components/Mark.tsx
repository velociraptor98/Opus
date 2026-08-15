import { PIPELINE_LENGTH } from "@/lib/pipeline";

/**
 * The mark — the studio's one gesture, and now the app's: five bars, the
 * pipeline itself. Wherever it appears (the wordmark, a row, a detail panel,
 * work in flight) it's the same five segments filling left to right, so the
 * logo and the data are literally drawn from the same shape.
 */

/** Fixed glyph under the wordmark: three of five, the third one live. */
const WORDMARK_BARS = [
  "var(--color-text)",
  "var(--color-text)",
  "var(--color-accent)",
  "var(--color-neutral-300)",
  "var(--color-neutral-300)",
];

/** Reversed, for the coral hero panel — value, not hue, carries it there. */
const WORDMARK_BARS_REVERSED = [
  "var(--color-on-accent)",
  "var(--color-on-accent)",
  "var(--color-on-accent)",
  "color-mix(in srgb, var(--color-on-accent) 45%, transparent)",
  "color-mix(in srgb, var(--color-on-accent) 45%, transparent)",
];

const WORDMARK_SIZES = {
  sm: { word: 17, bar: 10, height: 3, gap: 2 },
  md: { word: 20, bar: 12, height: 3, gap: 2 },
  lg: { word: 24, bar: 14, height: 4, gap: 3 },
} as const;

export const Wordmark = ({
  size = "md",
  reversed = false,
}: {
  size?: keyof typeof WORDMARK_SIZES;
  /** On the coral ground, where the bars go white rather than ink. */
  reversed?: boolean;
}) => {
  const s = WORDMARK_SIZES[size];
  const bars = reversed ? WORDMARK_BARS_REVERSED : WORDMARK_BARS;
  return (
    <span className="inline-block leading-none">
      <span
        className="block"
        style={{
          fontWeight: 800,
          fontSize: s.word,
          letterSpacing: "-0.045em",
          lineHeight: 1,
          marginBottom: s.height + 2,
        }}
      >
        OPUS
      </span>
      <span className="flex" style={{ gap: s.gap }} aria-hidden="true">
        {bars.map((bg, i) => (
          <i key={i} style={{ width: s.bar, height: s.height, background: bg }} />
        ))}
      </span>
    </span>
  );
};

/**
 * An application's progress, as the same five bars. `segments` is a list of
 * fill colours (see lib/pipeline.ts) rather than a number, because the colour
 * carries the tone — accent for live, grey for finished — not just the count.
 */
export const PipelineBars = ({
  segments,
  width = 18,
  height = 6,
  grow = false,
  className = "",
}: {
  segments: string[];
  /** Fixed segment width; ignored when `grow` spreads them across the row. */
  width?: number;
  height?: number;
  /** Fill the container instead of sitting at a fixed width. */
  grow?: boolean;
  className?: string;
}) => (
  <span
    className={`flex ${grow ? "w-full" : ""} ${className}`}
    style={{ gap: 3 }}
    aria-hidden="true"
  >
    {segments.map((bg, i) => (
      <i
        key={i}
        style={{
          width: grow ? undefined : width,
          flex: grow ? "1 1 0" : undefined,
          height,
          background: bg,
        }}
      />
    ))}
  </span>
);

/** The same bars, cycling — the app's only loading rhythm. */
export const LoadingBars = ({
  width = 10,
  height = 4,
  className = "",
}: {
  width?: number;
  height?: number;
  className?: string;
}) => (
  <span
    className={`bars-loading inline-flex ${className}`}
    style={{ gap: 2 }}
    aria-hidden="true"
  >
    {Array.from({ length: PIPELINE_LENGTH }, (_, i) => (
      <i key={i} style={{ width, height, background: "var(--color-neutral-300)" }} />
    ))}
  </span>
);
