"use client";

import React, { useState, useRef } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { genericFetch, getSyncTranscript } from "@/utils/clientUtils";
import { useQuery } from "@tanstack/react-query";
import { YouTubeOptions, TranscriptDetails } from "@/data/types";

interface YouTubePlayerProps {
  videoId: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  // ====== STATE/HOOKS ======

  const [currentWord, setCurrentWord] = useState("");
  // can get time from the ref, but there is no explicit playing event or "time" event to hook into, initialize at 0
  const [currentTime, setCurrentTime] = useState<number>(0);
  // ref as YT.Player - available globally via @types/youtube
  const playerRef = useRef<YT.Player | null>(null);
  // explictly define this onReady method to fit with the library's props

  // ====== EVENT HANDLERS ======
  const onReady: YouTubeProps["onReady"] = (event) => {
    // console.log("Player is ready:", event.target);
    playerRef.current = event.target;
  };

  const getCurrentTime = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      playerRef.current.stopVideo();
      setCurrentTime(time);
    }
  };

  // ====== DATA ======

  // library types these "optional props" as  YouTube["opts"] which resolves to any, I do not love this
  // used a little Gemini to define a complete interface for this - hoping for accuracy given the popularity of the library
  const optionalProps: YouTubeOptions = {
    height: "390",
    width: "640",
    playerVars: {
      autoplay: 0,
    },
  };

  const {
    data: transcript, // noted in the return statement, the hook is returning response.data.transcript made available through this destructuring as "transcript"
    isLoading,
    isError,
    error,
  } = useQuery({
    // Unique key for caching; refetches automatically if videoId changes - unlikey scenario but
    queryKey: ["transcript", videoId],

    queryFn: async () => {
      const response = await genericFetch<TranscriptDetails>(
        `/api/transcript/${videoId}`,
        { method: "GET" },
      );

      if (!response.success) {
        throw response.error;
      }
      return response.data.transcript;
    },

    // only run the query if videoId is truthy
    enabled: !!videoId,
  });

  const formatted = getSyncTranscript(transcript);

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
      {isLoading && <p>Loading transcript...</p>}
      {isError && <p>Error: {(error as Error).message}</p>}
      {!!formatted &&
        formatted?.map((item) => {
          return <div key={item.word}>{item.word}</div>;
        })}
    </div>
  );
};

export default YouTubePlayer;
