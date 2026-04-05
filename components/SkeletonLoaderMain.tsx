"use client";

import React from "react";
import { Box, Skeleton } from "@mui/material";

const SkeletonLoaderMain: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", lg: "row" },
      gap: 3,
      width: "100%",
    }}
  >
    {/* speaker tag */}
    <Box sx={{ width: { xs: "100%", lg: 280 } }}>
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
    </Box>

    {/* video */}
    <Skeleton
      variant="rectangular"
      width={640}
      height={390}
      sx={{ borderRadius: 2, flexShrink: 0 }}
    />

    {/* transcript */}
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
    </Box>
  </Box>
);

export default SkeletonLoaderMain;
