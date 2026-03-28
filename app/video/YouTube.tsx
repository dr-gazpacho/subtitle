"use client";

import React, { useState, useRef } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

interface YouTubePlayerProps {
  videoId: string;
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

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  // can get time from the ref, but there is no explicit playing event or "time" event to hook into, initialize at 0
  const [currentTime, setCurrentTime] = useState<number>(0);

  // ref as YT.Player - available globally via @types/youtube
  const playerRef = useRef<YT.Player | null>(null);

  // explictly define this onReady method to fit with the library's props
  const onReady: YouTubeProps["onReady"] = (event) => {
    console.log("Player is ready:", event.target);
    playerRef.current = event.target;
  };

  const getCurrentTime = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      playerRef.current.stopVideo();
      setCurrentTime(time);
    }
  };

  // library types these "optional props" as  YouTube["opts"] which resolves to any, I do not love this
  // used a little Gemini to define a complete interface for this - hoping for accuracy given the popularity of the library
  const optionalProps: YouTubeOptions = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <YouTube videoId={videoId} opts={optionalProps} onReady={onReady} />
      <div className="text-center">
        <p>Current Time: {Math.floor(currentTime)} seconds</p>
        <button
          onClick={getCurrentTime}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Get Current Timestamp
        </button>
      </div>
    </div>
  );
};

export default YouTubePlayer;
