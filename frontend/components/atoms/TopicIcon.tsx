export type TopicIconSize = "xs" | "sm" | "md" | "lg";

type TopicIconProps = {
  name: string;
  size?: TopicIconSize;
}

// Deep tones so the white initials stay above 4.5:1 contrast
const PALETTE = [
  "#06974c", // green
  "#0a6fb0", // blue
  "#be185d", // pink
  "#b45309", // amber
  "#6d28d9", // violet
  "#b91c1c", // red
  "#0f766e", // teal
  "#4338ca", // indigo
];

const sizeClasses: Record<TopicIconSize, string> = {
  xs: "w-5 h-5 rounded text-[0.55rem]",
  sm: "w-8 h-8 rounded-md text-xs",
  md: "w-10 h-10 rounded-lg text-sm",
  lg: "w-14 h-14 rounded-xl text-lg",
};

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const graphemeSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter(undefined, {granularity: "grapheme"})
  : null;

function splitCharacters(text: string): string[] {
  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), (part) => part.segment);
  }
  // Fallback for browsers without Intl.Segmenter: code points keep most emojis intact
  return Array.from(text);
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return splitCharacters(words[0]).slice(0, 2).join("").toUpperCase();
  return (splitCharacters(words[0])[0] + splitCharacters(words[1])[0]).toUpperCase();
}

const TopicIcon = ({name, size = "lg"}: TopicIconProps) => {
  const color = PALETTE[hashName(name) % PALETTE.length];

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center text-white font-semibold shrink-0 ${sizeClasses[size]}`}
      style={{backgroundColor: color}}
    >
      {getInitials(name)}
    </div>
  )
}

export default TopicIcon;
