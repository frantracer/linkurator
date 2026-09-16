type TopicIconProps = {
  name: string;
}

const PALETTE = [
  "#06974c", // primary
  "#0c93e8", // secondary
  "#db2777", // pink
  "#d97706", // amber
  "#7c3aed", // violet
  "#dc2626", // red
  "#0d9488", // teal
  "#4f46e5", // indigo
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const TopicIcon = ({name}: TopicIconProps) => {
  const color = PALETTE[hashName(name) % PALETTE.length];

  return (
    <div
      className="flex items-center justify-center w-14 h-14 rounded-xl text-white font-semibold text-lg shrink-0"
      style={{backgroundColor: color}}
    >
      {getInitials(name)}
    </div>
  )
}

export default TopicIcon;
