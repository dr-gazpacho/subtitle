"use client";

import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { genericFetch, getSyncTranscript } from "@/utils/clientUtils";
import { useQuery } from "@tanstack/react-query";
import { YouTubeOptions, TranscriptDetails } from "@/data/types";

interface YouTubePlayerProps {
  videoId: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  const [activeWord, setActiveWord] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ====== DATA FETCHING (TanStack Query) ======
  const {
    data: transcript,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["transcript", videoId],
    queryFn: async () => {
      const response = await genericFetch<TranscriptDetails>(
        `/api/transcript/${videoId}`,
        { method: "GET" },
      );
      if (!response.success) throw new Error(response.error);
      return response.data.transcript;
    },
    enabled: !!videoId,
  });

  // Transform data for syncing
  const words = transcript ? getSyncTranscript(transcript) : [];

  // ====== SYNC LOGIC ======
  const startTracking = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        // Find the index of the word where the time falls between start and end
        const index = words.findIndex((w) => time >= w.start && time <= w.end);

        if (index !== -1 && index !== activeIndex) {
          setActiveIndex(index);
          console.log("Active Word:", words[index].word);
          setActiveWord(words[index].word);
        }
      }
    }, 100);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => stopTracking();
  }, []);

  // ====== YOUTUBE EVENTS ======
  const onReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
  };

  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  const opts: YouTubeOptions = {
    height: "390",
    width: "640",
    playerVars: { autoplay: 0 },
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
      />

      <div className="text-center p-4 border rounded bg-slate-50 w-full max-w-2xl">
        <p className="text-sm text-gray-500">Time: {currentTime.toFixed(2)}s</p>
        <p className="text-2xl font-bold text-blue-600 h-8">
          {activeWord || "..."}
        </p>
      </div>

      {isLoading && <p>Loading transcript...</p>}
      {isError && (
        <p className="text-red-500">Error: {(error as Error).message}</p>
      )}

      <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-4 border">
        {words.map((item, idx) => (
          <span
            key={`${item.word}-${idx}`}
            className={`transition-colors cursor-pointer rounded px-1 ${
              activeIndex === idx
                ? "bg-yellow-300 font-bold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => {
              // takes the timestamp from the transcipt and forces the player to jump to it on click
              playerRef.current?.seekTo(item.start, true);
            }}
          >
            {item.word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default YouTubePlayer;
