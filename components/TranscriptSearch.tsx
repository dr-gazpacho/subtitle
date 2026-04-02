import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  InputAdornment,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TranscriptSearchProps, Match } from "@/data/types";
import StyledWord from "./StyledWord";

const TranscriptSearch: React.FC<TranscriptSearchProps> = ({
  turns,
  onWordClick,
}) => {
  // this will be sort of like a finite state machine where inputValue sets the state of searchTerm and searchTerm controls the search
  // user types a word/phrase (state is constantly updating but no search happens) -> stop typing -> .3 seconds elapses and search term state captures input state
  // --> search term state updates which triggers the search for word or phrase
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // debouncer makes this feel a little smoother
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const results = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    // when you reach for regex have you reached too far?
    // this is a little defensive programming, definitely overkill - splits on each whitespace characters or chunk of one or more whitespace characters
    const searchWords = query.split(/\s+/);
    const matches: Match[] = [];

    // I don't know if this is the best sliding window but it works
    // Maybe there's a world where we also want the timestamps considered or something.. for now we're going to return each speaking turn which contains the searchTerm
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

        <List sx={{ maxHeight: 400, overflowY: "auto", p: 0 }}>
          {searchTerm && results.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                No matches found.
              </Typography>
            </Box>
          ) : (
            results.map((res, idx) => (
              <ListItem
                key={idx}
                divider
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  p: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    color: "text.disabled",
                    mb: 1,
                  }}
                >
                  {res.speaker}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {res.words.map((w, wIdx) => {
                    const isMatchPart =
                      wIdx >= res.matchStartIndex && wIdx <= res.matchEndIndex;
                    return (
                      <StyledWord
                        key={wIdx}
                        active={isMatchPart}
                        onClick={() => onWordClick(w.start)}
                      >
                        {w.word}
                      </StyledWord>
                    );
                  })}
                </Box>
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default TranscriptSearch;
