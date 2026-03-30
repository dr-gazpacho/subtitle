"use client";

import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { genericFetch, simplifyTranscript } from "@/utils/clientUtils";
import { useQuery } from "@tanstack/react-query";
import { YouTubeOptions, TranscriptDetails } from "@/data/types";
import TranscriptView from "./TranscriptView";

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

  // Transform data for syncing
  const words = transcript ? simplifyTranscript(transcript) : [];

  // ====== SYNC LOGIC ======

  // effectively run a polling loop which looks for the current time of the video and correlates that to the transcript
  const startTracking = () => {
    //if the timer is running or there are no words, don't start a(nother) timer
    if (intervalRef.current || !words) return;

    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();

        // Find the index of the word where the time falls between start and end
        const index = words.findIndex((w) => time >= w.start && time <= w.end);

        if (index !== -1 && index !== activeIndex) {
          setActiveIndex(index);
        }
      }
    }, 100);
  };

  // when video stops playing, clear the interval
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
    // effectively capturing the controller for the external video player
    playerRef.current = event.target;
  };

  /**
   *
   * @param event ENUM representing video player state
   * returns void, side effect only
   */
  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  /**
   * onClick of a given item in the transcript, send video playhead to a given time
   * @param wordStartTime number that represents the start time of a given word in the transcript
   * return void, side effect only
   */
  const onWordClick = (wordStartTime: number) => {
    playerRef.current?.seekTo(wordStartTime, true);
  };

  const opts: YouTubeOptions = {
    height: "390",
    width: "640",
    playerVars: { autoplay: 0 },
  };

  return (
    /* 
     - max-w-7xl: caps the width so it doesn't get too wide on ultrawide monitors.
     - items-center: centers them vertically (on top of each other) for mobile.
     - lg:flex-row: flips them side-by-side on desktop.
     - lg:items-start: aligns them to the top of the container on desktop.
  */
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* video wrapper - sticky keeps it in view on desktop while scrolling transcript */}
      <div className="lg:sticky lg:top-8 w-fit flex-shrink-0 shadow-lg rounded-xl overflow-hidden border border-slate-200">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      </div>

      {/* transcript wrapper grows to fill space but stays readable */}
      <div className="w-full max-w-2xl flex-1 h-full">
        {isLoading && (
          <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 animate-pulse">
              Loading transcript...
            </p>
          </div>
        )}

        {isError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            Error: {(error as Error).message}
          </div>
        )}

        {/* render only if we have words to show */}
        {!isLoading && !isError && (
          <div className="h-full">
            <TranscriptView
              words={words}
              activeIndex={activeIndex}
              onWordClick={onWordClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubePlayer;
