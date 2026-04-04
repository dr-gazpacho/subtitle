import { describe, it, expect } from "vitest";
import {
  simplifyTranscript,
  formatTranscript,
  formatTime,
} from "../utils/clientUtils";
import {
  SpeechmaticsBatchResponse,
  SimplifiedTranscript,
  WordResult,
} from "@/types/types";

describe("simplifyTranscript()", () => {
  it("should return null if data is null", () => {
    expect(simplifyTranscript(null)).toBeNull();
  });

  it("should attach punctuation to the previous word and skip the punctuation index", () => {
    // Creating specific typed results to avoid 'any'
    const mockResults: WordResult[] = [
      {
        type: "word",
        start_time: 0,
        end_time: 1,
        alternatives: [{ content: "Hello", confidence: 1, speaker: "S1" }],
      },
      {
        type: "punctuation",
        start_time: 1,
        end_time: 1.1,
        alternatives: [{ content: ",", confidence: 1, speaker: "S1" }],
      },
      {
        type: "word",
        start_time: 1.1,
        end_time: 2,
        alternatives: [{ content: "World", confidence: 1, speaker: "S1" }],
      },
    ];

    const mockData: SpeechmaticsBatchResponse = {
      format: "2.9",
      job: {
        id: "mock-job-id",
        created_at: new Date().toISOString(),
        data_name: "test-video",
        duration: 2.0,
        type: "transcription",
      },
      metadata: {
        transcription_config: {
          language: "en",
          operating_point: "enhanced",
        },
      },
      results: mockResults,
    };

    const result = simplifyTranscript(mockData);

    // Check that punctuation attached: "Hello" + ","
    expect(result?.[0].word).toBe("Hello,");
    // Check that it correctly skipped the punctuation index and moved to "World"
    expect(result?.[1].word).toBe("World");
    expect(result?.length).toBe(2);
  });
});

describe("formatTranscript()", () => {
  it("should return an empty array if input is null or empty", () => {
    expect(formatTranscript(null)).toEqual([]);
    expect(formatTranscript([])).toEqual([]);
  });

  it("should group words by speaker and inject globalIndex", () => {
    const mockWords: SimplifiedTranscript[] = [
      { word: "Hi", start: 0, end: 1, speaker: "S1" },
      { word: "There", start: 1, end: 2, speaker: "S1" },
      { word: "Hello", start: 2, end: 3, speaker: "S2" },
    ];

    const turns = formatTranscript(mockWords);

    expect(turns.length).toBe(2);
    expect(turns[0].speaker).toBe("S1");
    expect(turns[0].words.length).toBe(2);
    // Verify globalIndex mapping for the "OnWordClick" logic
    expect(turns[1].words[0].globalIndex).toBe(2);
    expect(turns[1].speaker).toBe("S2");
  });
});

describe("formatTime()", () => {
  it("should format various second counts correctly", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(59)).toBe("0:59");
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(361)).toBe("6:01");
  });
});
