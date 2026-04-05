"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Box, Container, Alert, Divider, Paper, Stack } from "@mui/material";
import {
  genericFetch,
  simplifyTranscript,
  formatTranscript,
} from "@/utils/clientUtils";
import {
  YouTubeOptions,
  TranscriptDetails,
  SpeechmaticsBatchResponse,
} from "@/types/types";
import TranscriptView from "./TranscriptView";
import TranscriptSearch from "./TranscriptSearch";
import SpeakerTag from "./SpeakerTag";
import SkeletonLoaderMain from "./SkeletonLoaderMain";
import SkeletonLoaderSearch from "./SkeletonLoaderSearch";

interface VideoTranscriptSyncProps {
  videoId: string;
}

const VideoTranscriptSync: React.FC<VideoTranscriptSyncProps> = ({
  videoId,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isPlayerLoaded, setIsPlayerLoaded] = useState<boolean>(false);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [transcript, setTranscript] =
    useState<SpeechmaticsBatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const getTranscript = async () => {
      setIsLoading(true);
      try {
        const response = await genericFetch<TranscriptDetails>(
          `/api/transcript/${videoId}`,
        );
        if (response.success) {
          setTranscript(response.data.transcript);
        } else {
          setIsError(true);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) getTranscript();
  }, [videoId]);

  const words = useMemo(
    () => (transcript ? simplifyTranscript(transcript) : []),
    [transcript],
  );
  const turns = useMemo(() => formatTranscript(words), [words]);

  const showSkeleton = isLoading || !isPlayerLoaded;

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

  useEffect(() => () => stopTracking(), []);

  const onReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    setIsPlayerLoaded(true);
  };

  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    if (event.data === 1) startTracking();
    else stopTracking();
  };

  const onWordClick = (wordStartTime: number) => {
    playerRef.current?.seekTo(wordStartTime, true);
    playerRef.current?.playVideo();
  };

  const onRename = async (oldName: string, newName: string) => {
    try {
      const response = await fetch(`/api/transcript/${videoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName }),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setTranscript(updatedData);
      }
    } catch (err) {
      console.error("Failed to rename speaker:", err);
    }
  };

  const opts: YouTubeOptions = {
    height: "390",
    width: "640",
    playerVars: { autoplay: 0 },
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Stack spacing={6} alignItems="center">
        {isError && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ width: "100%", borderRadius: 3 }}
          >
            There was an error fetching the transcript for this video.
          </Alert>
        )}

        {showSkeleton && !isError && <SkeletonLoaderMain />}

        {/* ugly but necessary -> YouTube player needs to load/mount for this onReady to method to setIsPlayerLoaded(true), then, once the API content loads we switch off the skeleton loader and switch on the content */}
        <Box
          sx={{
            display: showSkeleton || isError ? "none" : "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "center", lg: "flex-start" },
            justifyContent: "center",
            gap: 3,
            width: "100%",
          }}
        >
          <Box sx={{ width: { xs: "100%", lg: 280 }, flexShrink: 0 }}>
            <SpeakerTag onRename={onRename} turns={turns} />
          </Box>

          <Paper
            elevation={8}
            sx={{
              width: "fit-content",
              overflow: "hidden",
              bgcolor: "common.black",
              lineHeight: 0,
            }}
          >
            <YouTube
              videoId={videoId}
              opts={opts}
              onReady={onReady}
              onStateChange={onStateChange}
            />
          </Paper>

          <Box sx={{ width: "100%", flex: 1, minWidth: { lg: 400 } }}>
            <TranscriptView
              turns={turns}
              activeIndex={activeIndex}
              onWordClick={onWordClick}
            />
          </Box>
        </Box>
        <Box sx={{ width: "100%", maxWidth: 1100, pt: 1 }}>
          <Divider sx={{ mb: 2 }} />
          {/* this loader keys off the same values but doesnt need the css display property to work */}
          {showSkeleton ? (
            <SkeletonLoaderSearch />
          ) : (
            <TranscriptSearch turns={turns} onWordClick={onWordClick} />
          )}
        </Box>
      </Stack>
    </Container>
  );
};

export default VideoTranscriptSync;
