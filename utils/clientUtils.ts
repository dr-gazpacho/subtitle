type Result<T> = { success: true; data: T } | { success: false; error: Error };
/**
 *
 * @param url - plan to use only one URL then using different HTTP actions
 * @param options - Fetch options headers, method, etc
 * @returns standard object with success/failure responses
 */
export const genericFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<Result<T>> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: new Error(`HTTP ${response.status}: ${response.statusText}`),
      };
    }

    const data = await response.json();
    return { success: true, data: data as T };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};
