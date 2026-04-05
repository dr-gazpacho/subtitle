"use client";

import React from "react";
import { Box, Paper, Stack, Skeleton, Divider } from "@mui/material";

const SkeletonLoaderSearch: React.FC = () => {
  return (
    <Box sx={{ width: "100%" }}>
      {/* header */}
      <Box sx={{ mb: 2, px: 1 }}>
        <Skeleton variant="text" width={180} height={32} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={300} height={20} />
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        {/* input */}
        <Box sx={{ p: 2 }}>
          <Skeleton
            variant="rectangular"
            height={40}
            sx={{ borderRadius: 1 }}
          />
        </Box>

        <Divider />

        {/* pagination */}
        <Box sx={{ p: 1.5, bgcolor: "action.hover" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Skeleton variant="text" width={100} height={20} />
          </Stack>
        </Box>

        <Divider />

        {/* results window */}
        <Box sx={{ height: 390, p: 3 }}>
          <Stack spacing={2}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Skeleton
                variant="rectangular"
                width={100}
                height={24}
                sx={{ borderRadius: 0.5 }}
              />
              <Skeleton
                variant="rectangular"
                width={60}
                height={24}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default SkeletonLoaderSearch;
