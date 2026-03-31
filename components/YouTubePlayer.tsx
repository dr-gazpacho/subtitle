"use client";

import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { genericFetch, simplifyTranscript } from "@/utils/clientUtils";
import { useQuery } from "@tanstack/react-query";
import { YouTubeOptions, TranscriptDetails } from "@/data/types";
import TranscriptView from "./TranscriptView";
import TranscriptSearch from "./TranscriptSearch";

interface YouTubePlayerProps {
  videoId: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
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
      if (!response.success) throw new Error(response.error.toString());
      return response.data.transcript;
    },
    enabled: !!videoId,
  });

  const words = transcript ? simplifyTranscript(transcript) : [];

  // ====== SYNC LOGIC ======
  const startTracking = () => {
    if (intervalRef.current || !words) return;
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        const index = words.findIndex((w) => time >= w.start && time <= w.end);
        if (index !== -1 && index !== activeIndex) {
          setActiveIndex(index);
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

  useEffect(() => {
    return () => stopTracking();
  }, []);

  // ====== YOUTUBE EVENTS ======
  const onReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
  };

  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    if (event.data === 1) startTracking();
    else stopTracking();
  };

  const onWordClick = (wordStartTime: number) => {
    playerRef.current?.seekTo(wordStartTime, true);
  };

  const opts: YouTubeOptions = {
    height: "390",
    width: "640",
    playerVars: { autoplay: 0 },
  };

  return (
    <div className="flex flex-col items-center gap-12 p-6 max-w-7xl mx-auto w-full">
      {/* 
          side-by-side on large screens, stacked & centered on mobile 
      */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 w-full">
        {/* video (sticky on desktop) */}
        <div className="lg:sticky lg:top-8 w-fit flex-shrink-0 shadow-xl rounded-2xl overflow-hidden border border-slate-200 bg-black">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        </div>

        {/* transcript showing current spoken word*/}
        <div className="w-full max-w-2xl flex-1">
          {isLoading && (
            <div className="h-[390px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-400 animate-pulse">
                Loading transcript...
              </p>
            </div>
          )}

          {isError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
              Error: {(error as Error).message}
            </div>
          )}

          {!isLoading && !isError && (
            <TranscriptView
              words={words}
              activeIndex={activeIndex}
              onWordClick={onWordClick}
            />
          )}
        </div>
      </div>

      {/* 
          word/phrase search
      */}
      {!isLoading && !isError && (
        <div className="w-full max-w-4xl border-t border-slate-100 pt-10">
          <div className="mb-6 px-2">
            <h3 className="text-xl font-bold text-slate-200">
              Search Mentions
            </h3>
            <p className="text-sm text-slate-100">
              Find specific phrases and jump to that moment in the video.
            </p>
          </div>
          <TranscriptSearch words={words} onWordClick={onWordClick} />
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
