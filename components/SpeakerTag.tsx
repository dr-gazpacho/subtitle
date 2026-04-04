"use client";

import React, { useState } from "react";
import { TranscriptTurn } from "@/types/types";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  TextField,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

interface SpeakerListProps {
  turns: TranscriptTurn[];
  onRename: (oldName: string, newName: string) => Promise<void>;
}

export default function SpeakerTag({ turns, onRename }: SpeakerListProps) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const speakers = Array.from(new Set(turns.map((t) => t.speaker)));

  const handleSave = async (oldName: string) => {
    if (!tempName.trim() || tempName === oldName) {
      setEditingName(null);
      return;
    }
    setIsSaving(true);
    await onRename(oldName, tempName);
    setIsSaving(false);
    setEditingName(null);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: "background.paper",
        width: "100%",
        height: 390,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="overline"
        sx={{
          fontWeight: "bold",
          display: "block",
          mb: 1,
          ml: 1,
        }}
      >
        Speakers in Video
      </Typography>

      <List
        sx={{
          width: "100%",
          overflowY: "auto",
          pr: 1,
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: "10px",
          },
        }}
      >
        {speakers.map((speaker) => (
          <ListItem
            key={speaker}
            disableGutters
            sx={{ px: 1 }}
            secondaryAction={
              editingName === speaker ? (
                <Box sx={{ display: "flex" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleSave(speaker)}
                    disabled={isSaving}
                    color="success"
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setEditingName(null)}
                    color="error"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingName(speaker);
                    setTempName(speaker);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )
            }
          >
            <ListItemAvatar sx={{ minWidth: 44 }}>
              <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                <PersonIcon sx={{ color: "white", fontSize: 18 }} />
              </Avatar>
            </ListItemAvatar>

            {editingName === speaker ? (
              <TextField
                variant="standard"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave(speaker)}
                autoFocus
                size="small"
                fullWidth
                slotProps={{
                  input: { sx: { fontSize: "0.875rem", color: "black" } },
                }}
              />
            ) : (
              <ListItemText
                primary={speaker}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "black",
                    },
                  },
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
