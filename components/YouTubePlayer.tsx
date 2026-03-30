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
    <div className="flex flex-col items-center gap-4">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
      />

      {/* <div className="text-center p-4 border rounded bg-slate-50 w-full max-w-2xl">
        <p className="text-sm text-gray-500">Time: {currentTime.toFixed(2)}s</p>
        <p className="text-2xl font-bold text-blue-600 h-8">
          {activeWord || "..."}
        </p>
      </div> */}

      {isLoading && <p>Loading transcript...</p>}
      {isError && (
        <p className="text-red-500">Error: {(error as Error).message}</p>
      )}

      <TranscriptView
        words={words}
        activeIndex={activeIndex}
        onWordClick={onWordClick}
      />
    </div>
  );
};

export default YouTubePlayer;
