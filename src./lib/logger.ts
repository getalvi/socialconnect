enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
}

export function info(message: string, data?: unknown): void {
  console.log(formatMessage(LogLevel.INFO, message, data));
}

export function warn(message: string, data?: unknown): void {
  console.warn(formatMessage(LogLevel.WARN, message, data));
}

export function error(message: string, data?: unknown): void {
  console.error(formatMessage(LogLevel.ERROR, message, data));
}

export const logger = { info, warn, error };