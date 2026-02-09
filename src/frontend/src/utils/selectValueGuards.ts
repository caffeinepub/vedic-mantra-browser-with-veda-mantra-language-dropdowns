/**
 * Utility to safely validate and coerce Select controlled values.
 * Ensures the selected value exists in the current option set to prevent blank Select triggers.
 */

/**
 * Validates that a Select value exists in the available options.
 * Returns the value if valid, undefined otherwise.
 * 
 * @param value - The current selected value
 * @param availableOptions - Array of valid option values
 * @param debugLabel - Optional label for console warnings in development
 */
export function safeSelectValue<T extends string | number | bigint>(
  value: T | null | undefined,
  availableOptions: T[],
  debugLabel?: string
): string | undefined {
  // If no value selected, return undefined to show placeholder
  if (value === null || value === undefined) {
    return undefined;
  }

  // Convert value to string for comparison (Select uses string values)
  const valueStr = value.toString();
  
  // Check if the value exists in available options
  const isValid = availableOptions.some(opt => opt.toString() === valueStr);
  
  if (!isValid && process.env.NODE_ENV === 'development' && debugLabel) {
    console.warn(
      `[${debugLabel}] Selected value "${valueStr}" not found in available options:`,
      availableOptions.map(o => o.toString())
    );
  }
  
  // Return the value only if it's valid, otherwise undefined to show placeholder
  return isValid ? valueStr : undefined;
}

/**
 * Checks if a bigint value is valid (greater than 0).
 */
export function isValidBigIntSelection(value: bigint): boolean {
  return value > 0n;
}
