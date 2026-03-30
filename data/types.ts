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
  type: "word" | "punctuation";
  start_time: number;
  end_time: number;
  alternatives: Array<{
    content: string; // The word text
    confidence: number;
    language?: string;
    speaker?: string;
  }>;
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

// used Gemini for this - the library does not provide a nice interface for the optional props
// probably wont need most of them but you don't know until you know
export interface YouTubeOptions {
  height?: string | number;
  width?: string | number;
  host?: string; // e.g., 'https://www.youtube-nocookie.com'
  playerVars?: {
    autoplay?: 0 | 1;
    cc_lang_pref?: string;
    cc_load_policy?: 1;
    color?: "red" | "white";
    controls?: 0 | 1;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    end?: number;
    fs?: 0 | 1;
    hl?: string;
    iv_load_policy?: 1 | 3;
    list?: string;
    listType?: "playlist" | "search" | "user_uploads";
    loop?: 0 | 1;
    modestbranding?: 1; // Note: Deprecated but still in many types
    origin?: string;
    playlist?: string;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    start?: number;
    widget_referrer?: string;
  };
}

export interface AppError {
  message: string;
  status?: number;
  code?: string;
}

export interface TranscriptApiResponse {
  success: boolean;
  data?: TranscriptApiResponse;
  error: AppError;
}

export interface TranscriptDetails {
  id: string | null;
  transcript: SpeechmaticsBatchResponse | null; // Matches your logic (Response OR Error string)
  createdAt: string;
}

// Generic interface for genericFetch
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export interface SimplifiedTranscript {
  word: string;
  start: number;
  end: number;
  speaker: string;
}
