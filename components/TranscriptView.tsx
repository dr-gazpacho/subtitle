import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper, Divider } from "@mui/material";
import { TranscriptTurn } from "@/data/types";
import StyledWord from "./StyledWord";

interface TranscriptViewProps {
  turns: TranscriptTurn[];
  activeIndex: number;
  onWordClick: (startTime: number) => void;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({
  turns,
  activeIndex,
  onWordClick,
}) => {
  // create a ref so I can target the container of the text
  // scrollTo will control the browser window's main scroll bar, but when I target the container I can target the scroll bar specific to the container instead of the whole window
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeElement = document.getElementById(`word-${activeIndex}`);
      const container = containerRef.current;

      if (activeElement) {
        // need to calculate distance from the very top of the "paper" (the start of the transcript) down to the active word
        // also gets the active word's height so I can do some math below to scroll to the center of the active word and not the top of it
        const elementOffsetTop = activeElement.offsetTop;
        const elementHeight = activeElement.offsetHeight;
        const containerHeight = container.offsetHeight;

        // center the active word = snap element to top of container, move it down half way into the container, move it down half the height of the active word
        const scrollTo =
          elementOffsetTop - containerHeight / 2 + elementHeight / 2;

        container.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex]);

  return (
    <Paper
      ref={containerRef}
      variant="outlined"
      sx={{
        p: 3,
        maxHeight: 390,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative", // helps with scroll calculation
        backgroundColor: "background.paper",
      }}
    >
      {turns.map((turn, tIdx) => (
        <Box
          key={tIdx}
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                bgcolor: "action.selected",
                px: 1,
                borderRadius: 0.5,
              }}
            >
              {turn.speaker}
            </Typography>
            <Divider sx={{ flexGrow: 1, opacity: 0.5 }} />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", lineHeight: 1.8 }}>
            {turn.words.map((w) => (
              <StyledWord
                key={w.globalIndex}
                id={`word-${w.globalIndex}`}
                active={activeIndex === w.globalIndex}
                onClick={() => onWordClick(w.start)}
              >
                {w.word}
              </StyledWord>
            ))}
          </Box>
        </Box>
      ))}
    </Paper>
  );
};

export default TranscriptView;
