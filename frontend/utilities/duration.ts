import {UNBOUNDED_DURATION_SECONDS} from "../entities/Filters";

// Formats a duration in seconds as e.g. "1:02:03" or "2:03"
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - (hours * 3600)) / 60);
  const secondsLeft = seconds - (hours * 3600) - (minutes * 60);
  let result = "";
  if (hours > 0) {
    result += hours.toString() + ":";
    result += minutes.toString().padStart(2, "0") + ":";
  } else {
    result += minutes.toString() + ":";
  }
  result += secondsLeft.toString().padStart(2, "0");
  return result;
}

function formatSeconds(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

// Formats a min/max duration in seconds as e.g. "2m - 60m", "> 1h" or "< 2m"; undefined when unbounded.
export function formatDurationRange(minSeconds?: number, maxSeconds?: number): string | undefined {
  const min = minSeconds !== undefined && minSeconds > 0 ? formatSeconds(minSeconds) : undefined;
  const max = maxSeconds !== undefined && maxSeconds < UNBOUNDED_DURATION_SECONDS ? formatSeconds(maxSeconds) : undefined;

  if (min && max) return `${min} - ${max}`;
  if (min) return `> ${min}`;
  if (max) return `< ${max}`;
  return undefined;
}
