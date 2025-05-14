/**
 * Utility for logging timestamps and calculating time differences in seconds
 */

// Store timestamps with labels
const timestamps: Record<string, number> = {};
// Store global last timestamp regardless of label
let lastTimestamp: number | null = null;

/**
 * Log a timestamp with a label and calculate difference from previous log in seconds
 * @param label Text label for the log entry
 * @param details Optional additional details to log
 * @returns The time difference in seconds from the last log with the same label
 */
export const logTime = (label: string, details?: string): number | null => {
  const now = performance.now();
  
  // Calculate difference from last use of same label
  const previousLabelTime = timestamps[label];
  const labelDiffMs = previousLabelTime ? now - previousLabelTime : null;
  const labelDiffSeconds = labelDiffMs !== null ? (labelDiffMs / 1000) : null;
  
  // Calculate difference from last log regardless of label
  const globalDiffMs = lastTimestamp !== null ? now - lastTimestamp : null;
  const globalDiffSeconds = globalDiffMs !== null ? (globalDiffMs / 1000) : null;
  
  // Format time for logging
  const time = new Date().toISOString();
  
  // Format diff text to include both label-specific and global differences
  let diffText = '';
  if (labelDiffSeconds !== null) {
    diffText += `+${labelDiffSeconds.toFixed(3)}s (same label)`;
  }
  
  if (globalDiffSeconds !== null) {
    if (diffText) diffText += ', ';
    diffText += `+${globalDiffSeconds.toFixed(3)}s (since last log)`;
  }
  
  if (diffText) {
    diffText = ` [${diffText}]`;
  }
  
  // Log with or without details
  if (details) {
    console.log(`[${time}] ${label}: ${details}${diffText}`);
  } else {
    console.log(`[${time}] ${label}${diffText}`);
  }
  
  // Update timestamps
  timestamps[label] = now;
  lastTimestamp = now;
  
  return labelDiffSeconds;
};

/**
 * Reset a stored timestamp
 * @param label The label to reset
 */
export const resetTimeLog = (label: string): void => {
  delete timestamps[label];
};

/**
 * Reset all stored timestamps
 */
export const resetAllTimeLogs = (): void => {
  Object.keys(timestamps).forEach(key => {
    delete timestamps[key];
  });
  lastTimestamp = null;
};

/**
 * Create a timed execution wrapper function
 * @param fn Function to time
 * @param label Label for the log
 * @returns Wrapped function that logs execution time
 */
export function withTiming<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  label: string
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    logTime(`${label}_start`);
    try {
      const result = await fn(...args);
      logTime(`${label}_end`, `completed in`);
      return result as ReturnType<T>;
    } catch (error) {
      logTime(`${label}_error`, `failed after`);
      throw error;
    }
  };
}

export default {
  logTime,
  resetTimeLog,
  resetAllTimeLogs,
  withTiming
}; 