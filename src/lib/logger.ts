type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private readonly enabled: boolean;
  private readonly maxEntries: number;
  private entries: LogEntry[] = [];

  constructor(enabled = process.env.NODE_ENV === 'development', maxEntries = 1000) {
    this.enabled = enabled;
    this.maxEntries = maxEntries;
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error
    };

    // Add to entries array
    this.entries.unshift(entry);

    // Trim entries if exceeding max size
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }

    // Log to console
    const consoleArgs = [
      `%c${entry.timestamp} [${level.toUpperCase()}] ${message}`,
      `color: ${this.getLogColor(level)}`,
      data,
      error
    ].filter(Boolean);

    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](...consoleArgs);
  }

  private getLogColor(level: LogLevel): string {
    switch (level) {
      case 'debug': return '#6B7280';
      case 'info': return '#3B82F6';
      case 'warn': return '#F59E0B';
      case 'error': return '#EF4444';
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error, data?: any) {
    this.log('error', message, data, error);
  }

  getEntries(level?: LogLevel): LogEntry[] {
    return level 
      ? this.entries.filter(entry => entry.level === level)
      : this.entries;
  }

  clear() {
    this.entries = [];
  }
}

export const logger = new Logger();