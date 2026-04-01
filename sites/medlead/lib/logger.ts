type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  environment: string;
}

/**
 * Sanitize error objects to prevent sensitive data leakage
 */
function sanitizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const sanitized: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    };

    // Only include stack traces in development
    if (process.env.NODE_ENV !== 'production') {
      sanitized.stack = error.stack;
    }

    return sanitized;
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { error: String(error) };
}

/**
 * Sanitize context to remove sensitive fields
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;

  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'credit_card',
    'creditCard',
    'ssn',
    'signatureDataUrl', // Don't log base64 signatures
  ];

  const sanitized: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value as LogContext);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext
): LogEntry {
  return {
    level,
    message,
    context: sanitizeContext(context),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Log a debug message
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'production') return;

  const entry = createLogEntry('debug', message, context);
  console.debug(JSON.stringify(entry));
}

/**
 * Log an info message
 */
export function logInfo(message: string, context?: LogContext): void {
  const entry = createLogEntry('info', message, context);
  console.info(JSON.stringify(entry));
}

/**
 * Log a warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  const entry = createLogEntry('warn', message, context);
  console.warn(JSON.stringify(entry));
}

/**
 * Log an error message
 */
export function logError(
  message: string,
  error?: unknown,
  context?: LogContext
): void {
  const errorContext: LogContext = { ...context };
  if (error !== undefined) {
    errorContext.error = sanitizeError(error);
  }
  const entry = createLogEntry('error', message, errorContext);

  console.error(JSON.stringify(entry));

  // In production, you could send to external service here
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Create a logger with a specific prefix/module name
 */
export function createLogger(module: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logDebug(`[${module}] ${message}`, context),
    info: (message: string, context?: LogContext) =>
      logInfo(`[${module}] ${message}`, context),
    warn: (message: string, context?: LogContext) =>
      logWarn(`[${module}] ${message}`, context),
    error: (message: string, error?: unknown, context?: LogContext) =>
      logError(`[${module}] ${message}`, error, context),
  };
}
