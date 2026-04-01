"use client";

import React, { useState } from "react";
import { TranscriptTurn } from "@/data/types";
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

export default function SpeakerList({ turns, onRename }: SpeakerListProps) {
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
    <Box
      sx={{
        bgcolor: "white",
        borderRadius: 2,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="overline"
        sx={{ fontWeight: "bold", color: "black", display: "block", mb: 2 }}
      >
        Speakers in Video
      </Typography>

      <List sx={{ width: "100%" }}>
        {speakers.map((speaker) => (
          <ListItem
            key={speaker}
            secondaryAction={
              editingName === speaker ? (
                <Box>
                  <IconButton
                    edge="end"
                    onClick={() => handleSave(speaker)}
                    disabled={isSaving}
                    color="success"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => setEditingName(null)}
                    color="error"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <IconButton
                  edge="end"
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
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "blue" }}>
                <PersonIcon sx={{ color: "white" }} />
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
                  input: { sx: { color: "black" } },
                }}
              />
            ) : (
              <ListItemText
                primary={speaker}
                slotProps={{
                  primary: { sx: { color: "black", fontWeight: 500 } },
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
