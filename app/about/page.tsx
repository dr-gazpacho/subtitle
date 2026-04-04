"use client";

import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SearchIcon from "@mui/icons-material/Search";

const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={6}>
        <Box component="section">
          <Typography variant="h3" component="h1" gutterBottom fontWeight={800}>
            SyncScript
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ fontStyle: "italic", mb: 3, fontWeight: 400 }}
          >
            Interactive Video Intelligence.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: "action.hover",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body1"
              lineHeight={1.8}
              sx={{ fontSize: "1.1rem" }}
            >
              SyncScript is a NextJS web application that syncronizes
              AI-generated transcripts with their corresponding video source. A
              user may search for a word or phrase within the transcript, update
              speaker tags, and view the live transcript along side a playing
              video. Clicking a given word in the transcript will advance the
              video playback to the corresponding time.
            </Typography>
          </Paper>
        </Box>

        <Divider />

        {/* USER GUIDE */}
        <Box component="section">
          <Typography variant="h4" component="h2" gutterBottom fontWeight={700}>
            User Guide
          </Typography>

          <Stack spacing={4} sx={{ mt: 3 }}>
            {/* 1. The Tryptych */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  fontWeight: 600,
                }}
              >
                <PlayCircleOutlineIcon color="primary" /> 1. The Interactive
                Tryptych
              </Typography>
              <List sx={{ ml: 2 }}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary="Speaker Tags"
                    secondary="View all uniquely identified speakers. Use the edit feature to rename generic tags (e.g., 'S1' to 'John Doe') to personalize the entire transcript instantly."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary="Video Player"
                    secondary="Standard YouTube controls video player linked with interactive transcript."
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary="Transcript View"
                    secondary="Autoscrolling transcript keeps the work currently spoken in view. Click any word to seek the video to the corresponding moment it's spoken."
                  />
                </ListItem>
              </List>
            </Box>

            {/* 2. Search */}
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  fontWeight: 600,
                }}
              >
                <SearchIcon color="primary" /> 2. Search & Discovery
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ ml: 5 }}>
                Enter any phrase in the search bar to find the point in the
                transcript where it has been spoken. Clicking on any word will
                advance the video the point in time where it is spoken.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* FOOTER */}
        <Box sx={{ textAlign: "center", pt: 6, opacity: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
            <InfoOutlinedIcon fontSize="small" />
            Built with Next.js 15, Material UI, and Vercel Blob Storage.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default AboutPage;
