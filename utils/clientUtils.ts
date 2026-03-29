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

/**
 * maps through speechmatics transcript, simplifies dataset
 * @param data Speechmatics transcript
 * @returns simplfied dataset that contains speaker name, timestamps, and word
 */
export const getSyncTranscript = (data: SpeechmaticsBatchResponse | null) => {
  if (!data) return null;

  const words: WordResult[] = [];
  const results = data.results;

  for (let i = 0; i < results.length; i++) {
    const item = results[i];

    if (item.type === "word") {
      let content = item.alternatives[0].content; // brittle but will work for the dataset- hypothetical do to is nested loop and extract "highest confidence" result

      // need to look ahead to identify if the next item is punctuation and then attach it to the previous word
      const nextItem = results[i + 1];
      if (nextItem && nextItem.type === "punctuation") {
        content += nextItem.alternatives[0].content;
        i++; // skip ahead if we attach punctionation
      }

      words.push({
        word: content,
        start: item.start_time,
        end: item.end_time,
        speaker: item.alternatives[0].speaker ?? "Unknown",
      });
    }
  }
  return words;
};
