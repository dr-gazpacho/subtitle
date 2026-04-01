"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import {
  genericFetch,
  simplifyTranscript,
  formatTranscript,
} from "@/utils/clientUtils";
import {
  YouTubeOptions,
  TranscriptDetails,
  SpeechmaticsBatchResponse,
} from "@/data/types";
import TranscriptView from "./TranscriptView";
import TranscriptSearch from "./TranscriptSearch";
import SpeakerTag from "./SpeakerTag";

interface YouTubePlayerProps {
  videoId: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [transcript, setTranscript] =
    useState<SpeechmaticsBatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  let refreshKey;
  useEffect(() => {
    const getTranscript = async () => {
      setIsLoading(true);
      try {
        const response = await genericFetch<TranscriptDetails>(
          `/api/transcript/${videoId}`,
        );
        if (response.success) {
          setTranscript(response.data.transcript);
        }
        setIsLoading(false);
      } catch {
        setIsError(true);
      }
    };

    if (videoId) getTranscript();
  }, [videoId, refreshKey]);

  const words = useMemo(() => {
    return transcript ? simplifyTranscript(transcript) : [];
  }, [transcript]);

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

  const turns = useMemo(() => formatTranscript(words), [words]);

  const onRename = async (oldName: string, newName: string) => {
    try {
      const response = await fetch(`/api/transcript/${videoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        // Option A: Update local state with the new JSON returned by the server
        setTranscript(updatedData);

        // Option B: If you prefer a fresh fetch, trigger your refreshKey
        // setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to rename speaker:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-12 p-6 max-w-7xl mx-auto w-full">
      <SpeakerTag onRename={onRename} turns={turns} />
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
              There was an error fetching the transcript for this video
            </div>
          )}

          {!isLoading && !isError && (
            <TranscriptView
              turns={turns}
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
          <TranscriptSearch turns={turns} onWordClick={onWordClick} />
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
