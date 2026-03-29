"use client";

import React, { useState, useRef, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { genericFetch } from "@/utils/clientUtils";
import {
  SpeechmaticsBatchResponse,
  YouTubeOptions,
  TranscriptDetails,
} from "@/data/types";

interface YouTubePlayerProps {
  videoId: string;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  // fetch the transcript
  const [transcript, setTranscript] =
    useState<SpeechmaticsBatchResponse | null>(null);

  // fetch video id on page load and get transcript
  // TO DO - parse/format data
  useEffect(() => {
    const getTranscript = async () => {
      // this doesnt quite return the type TranscriptDetails
      // genericFetch uses the generic T to type the data on the response object
      // whole response is TranscriptApiResponse, where TranscriptDetails is mapped to data.data
      const response = await genericFetch<TranscriptDetails>(
        `/api/transcript/${videoId}`,
        {
          method: "GET",
        },
      );

      // Only set state if the result was successful
      if (response.success) {
        setTranscript(response.data.transcript); // Access the nested data property
      } else {
        console.error(response.error);
        // Optional: handle error state here
      }
    };

    if (videoId) getTranscript();
  }, [videoId]);

  // can get time from the ref, but there is no explicit playing event or "time" event to hook into, initialize at 0
  const [currentTime, setCurrentTime] = useState<number>(0);

  // ref as YT.Player - available globally via @types/youtube
  const playerRef = useRef<YT.Player | null>(null);

  // explictly define this onReady method to fit with the library's props
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
      {JSON.stringify(transcript)}
    </div>
  );
};

export default YouTubePlayer;
