// couldn't find response type from speechmatics, used Gemini to build this
export interface SpeechmaticsBatchResponse {
  format: string; // E.g., "2.9"
  job: {
    id: string;
    created_at: string; // ISO8601 date
    data_name: string;
    duration: number; // Duration in seconds
    type: "transcription" | "translation";
  };
  metadata: {
    transcription_config: {
      language: string;
      operating_point: "standard" | "enhanced";
      diarization?: "speaker" | "channel" | "none";
    };
  };
  results: Array<WordResult | SpeakerChangeResult>;
  // Optional features
  chapters?: Array<{
    start_time: number;
    end_time: number;
    title: string;
    summary: string;
  }>;
  audio_events?: Array<AudioEvent>;
  topics?: Array<{
    topic: string;
    start_time: number;
    end_time: number;
  }>;
}

// Result item types
export interface WordResult {
  type: "word";
  start_time: number;
  end_time: number;
  alternatives: Array<{
    content: string; // The word text
    confidence: number;
  }>;
  speaker?: string; // Present if diarization is "speaker"
  channel?: string; // Present if diarization is "channel"
}

export interface SpeakerChangeResult {
  type: "speaker";
  start_time: number;
  speaker: string;
  confidence: number;
}

export interface AudioEvent {
  type: "applause" | "laughter" | "music" | string;
  start_time: number;
  end_time: number;
  confidence: number;
  channel?: string;
}
