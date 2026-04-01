import {
  Result,
  SpeechmaticsBatchResponse,
  SimplifiedTranscript,
  TranscriptTurn,
} from "@/data/types";
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
export const simplifyTranscript = (data: SpeechmaticsBatchResponse | null) => {
  if (!data) return null;

  const words: SimplifiedTranscript[] = [];
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

/**
 * helper function to group "speaking turns" - "speaking turn" defined as a discrete unit of unterupted speech by a unique speaker at least one word long
 * e.g. He said, "Dearly beloved we are gathered here today to get through this thing called life" And then she said, "hooray" creates two "speaking turns" worth of data
 * @param words the simplified transcript
 * @returns a version of the trascript formatted into "speaking turns" grouped under a given speaker's entire discrete bundle of speech, keeps SimplifiedTranscript structure
 */
export const formatTranscript = (words: SimplifiedTranscript[] | null) => {
  if (!words || words.length === 0) return [];

  const turns: TranscriptTurn[] = [];

  let currentTurn: TranscriptTurn = {
    speaker: words[0].speaker,
    words: [],
  };

  words.forEach((word, index) => {
    // this is a little ugly, but will keep the original index linked to how the word is reindexed in a new array with the new format
    // then, when the world is clicked, we can use this to target auto scroll and highlighting the specific word spoken with the existing "active index"
    const wordWithIndex = { ...word, globalIndex: index };

    if (word.speaker !== currentTurn.speaker) {
      // push the now grouped "speaking turn" into the turns array
      turns.push(currentTurn);
      // start a new "speaking turn" with the speaker of the new word
      currentTurn = { speaker: word.speaker, words: [wordWithIndex] };
    } else {
      currentTurn.words.push(wordWithIndex);
    }
  });

  // pushes the last unprocessed word in before returning nested format
  turns.push(currentTurn);
  return turns;
};
