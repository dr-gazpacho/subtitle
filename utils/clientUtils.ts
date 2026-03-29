import { Result, SpeechmaticsBatchResponse, WordResult } from "@/data/types";
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
    // can define T when invoked to forward real data returned to tsc -> fun<TYPE>(args);
    return { success: true, data: data as T };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};

export const getSyncTranscript = (data: SpeechmaticsBatchResponse | null) => {
  if (!data) {
    // let the null pass through and don't process - handle null outside the function
    return data;
  } else {
    return data.results
      .filter((item): item is WordResult => item.type === "word")
      .map((item) => ({
        word: item.alternatives[0].content, // TO DO - handle alternatives.length > 1; these edge cases are not included in dataset, solution deferred
        start: item.start_time,
        end: item.end_time,
        speaker: item.alternatives[0].speaker ?? "",
      }));
  }
};
