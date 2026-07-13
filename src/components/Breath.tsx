/**
 * The breath — the studio's one gesture, used everywhere: the mark, the
 * divider, the loading rhythm, the sign-off.
 *
 * The line length and dot spacing are sized in `em`, so both scale with the
 * font-size of whatever they sit in and are never set by hand.
 */

/** Three dots, each smaller and fainter — breath dispersing into air. */
export const BreathDots = ({
  loading = false,
  className = "",
}: {
  /** Exhale on a loop rather than holding still — for work in flight. */
  loading?: boolean;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={`breath-dots ${loading ? "breath-loading" : ""} ${className}`}
  >
    <i />
    <i />
    <i />
  </span>
);

/** The full gesture: a clay line exhaling into the trailing dots. */
export const BreathRule = ({
  loading = false,
  className = "",
}: {
  loading?: boolean;
  className?: string;
}) => (
  <span aria-hidden="true" className={`breath-rule ${className}`}>
    <BreathDots loading={loading} />
  </span>
);
