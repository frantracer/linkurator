import {isAxiosError} from "axios";

function isClientError(error: unknown): boolean {
  if (isAxiosError(error) && error.response) {
    return error.response.status >= 400 && error.response.status < 500;
  }
  if (error instanceof Error && 'status' in error) {
    const status = (error as Error & { status: number }).status;
    return status >= 400 && status < 500;
  }
  return false;
}

export function shouldRetryQuery(failureCount: number, error: unknown, maxRetries: number = 3): boolean {
  if (failureCount >= maxRetries) return false;
  if (isClientError(error)) return false;
  return true;
}
