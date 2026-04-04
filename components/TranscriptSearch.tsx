import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  InputAdornment,
  Divider,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { TranscriptSearchProps, Match } from "@/types/types";
import StyledWord from "./StyledWord";
import { formatTime } from "@/utils/clientUtils";

const TranscriptSearch: React.FC<TranscriptSearchProps> = ({
  turns,
  onWordClick,
}) => {
  // this will be sort of like a finite state machine where inputValue sets the state of searchTerm and searchTerm controls the search
  // user types a word/phrase (state is constantly updating but no search happens) -> stop typing -> .3 seconds elapses and search term state captures input state
  // --> search term state updates which triggers the search for word or phrase
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Ref to the scrollable list container
  const listRef = useRef<HTMLUListElement>(null);

  // debouncer makes this feel a little smoother
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
      setCurrentPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // scroll the matching word into view whenever the "page" changes
  // not using computed scroll from the transcript view, a user will logically already be down here so when the search the scroll won't feel so jarring
  useEffect(() => {
    if (listRef.current) {
      const activeWord = listRef.current.querySelector(".search-match-start");
      if (activeWord) {
        activeWord.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        // reset scroll to top if no match (e.g., new search)
        listRef.current.scrollTop = 0;
      }
    }
  }, [currentPage, searchTerm]);

  const results = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    // when you reach for regex have you reached too far?
    // this is a little defensive programming, definitely overkill - splits on each whitespace characters or chunk of one or more whitespace characters
    const searchWords = query.split(/\s+/);
    const matches: Match[] = [];

    // sliding window to search for word or term - also will partial match so search for FRI would return FRIED
    turns.forEach((turn) => {
      for (let i = 0; i <= turn.words.length - searchWords.length; i++) {
        let matchFound = true;
        for (let j = 0; j < searchWords.length; j++) {
          if (!turn.words[i + j].word.toLowerCase().includes(searchWords[j])) {
            matchFound = false;
            break;
          }
        }
        if (matchFound) {
          matches.push({
            speaker: turn.speaker,
            words: turn.words,
            matchStartIndex: i,
            matchEndIndex: i + searchWords.length - 1,
          });
        }
      }
    });
    return matches;
  }, [searchTerm, turns]);

  const currentMatch = results[currentPage];

  const handleNext = () => {
    if (currentPage < results.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 2, px: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Search Mentions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Find specific phrases and jump to that moment in the video.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        {/* input */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder='Try "first tuesday of the month"...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ bgcolor: "background.paper", borderRadius: 1 }}
          />
        </Box>

        <Divider />

        {/* pagination controls*/}
        {searchTerm && results.length > 0 && (
          <>
            <Box sx={{ p: 1.5, bgcolor: "action.hover" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleNext}
                    disabled={currentPage === results.length - 1}
                  >
                    <ChevronRight fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary", mr: 1 }}
                >
                  Match {currentPage + 1} of {results.length}
                </Typography>
              </Stack>
            </Box>
            <Divider />
          </>
        )}

        {/* scrollable viewport */}
        <Box sx={{ height: 390, display: "flex", flexDirection: "column" }}>
          {!searchTerm ? (
            <Box sx={{ p: 6, textAlign: "center", flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter a keyword to search the transcript.
              </Typography>
            </Box>
          ) : results.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center", flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                {`No matches found for "${searchTerm}".`}
              </Typography>
            </Box>
          ) : (
            <List
              ref={listRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 0,
                // Custom scrollbar for a cleaner look
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "divider",
                  borderRadius: "10px",
                },
              }}
            >
              <ListItem
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  p: 3,
                }}
              >
                {/* Header Row: Speaker Name & Timestamp */}
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
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
                    {currentMatch.speaker}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: "primary.main",
                      bgcolor: "action.hover",
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                    }}
                  >
                    {formatTime(
                      currentMatch.words[currentMatch.matchStartIndex].start,
                    )}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {currentMatch.words.map((w, wIdx) => {
                    const isMatchStart = wIdx === currentMatch.matchStartIndex;
                    const isMatchPart =
                      wIdx >= currentMatch.matchStartIndex &&
                      wIdx <= currentMatch.matchEndIndex;

                    return (
                      <StyledWord
                        key={wIdx}
                        // added a className so we can target the specific word for scrollIntoView
                        className={isMatchStart ? "search-match-start" : ""}
                        active={isMatchPart}
                        onClick={() => onWordClick(w.start)}
                      >
                        {w.word}
                      </StyledWord>
                    );
                  })}
                </Box>
              </ListItem>
            </List>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TranscriptSearch;
