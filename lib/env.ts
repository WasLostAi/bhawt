/**
 * Environment variable utility for safely accessing environment variables
 */
export class ENV {
  /**
   * Get an environment variable with type safety
   * @param key The environment variable key
   * @param defaultValue Default value if the environment variable is not set
   * @returns The environment variable value or the default value
   */
  static get<T extends string | number | boolean>(key: string, defaultValue: T): T {
    const value = process.env[key] || process.env[`NEXT_PUBLIC_${key}`]

    if (value === undefined) {
      return defaultValue
    }

    // Type conversion based on the default value type
    if (typeof defaultValue === "number") {
      return Number(value) as T
    }

    if (typeof defaultValue === "boolean") {
      return (value === "true") as T
    }

    return value as T
  }

  /**
   * Check if an environment variable is defined
   * @param key The environment variable key
   * @returns True if the environment variable is defined
   */
  static has(key: string): boolean {
    return process.env[key] !== undefined || process.env[`NEXT_PUBLIC_${key}`] !== undefined
  }

  /**
   * Get all environment variables with a specific prefix
   * @param prefix The prefix to filter environment variables
   * @returns An object with all matching environment variables
   */
  static getWithPrefix(prefix: string): Record<string, string> {
    const result: Record<string, string> = {}

    Object.keys(process.env).forEach((key) => {
      if (key.startsWith(prefix)) {
        result[key.replace(prefix, "")] = process.env[key] || ""
      }
    })

    return result
  }
}
