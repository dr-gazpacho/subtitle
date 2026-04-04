"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HomeIcon from "@mui/icons-material/Home";

const Header = () => {
  const pathname = usePathname();

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "baseline",
              gap: 1.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: 0.5 }}
            >
              SyncScript
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: { xs: "none", sm: "block" },
                opacity: 0.7,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              | Interactive Video Intelligence.
            </Typography>
          </Box>

          {pathname === "/" ? (
            <Button
              component={Link}
              href="/about"
              endIcon={<ArrowForwardIcon />}
              color="inherit"
            >
              About
            </Button>
          ) : (
            <Button
              component={Link}
              href="/"
              startIcon={<HomeIcon />}
              color="inherit"
            >
              Back to App
            </Button>
          )}
        </Toolbar>
      </AppBar>
      {/* This ghost toolbar does nothing, just visually adds ghost content between this sticky tool bar and the rest of the page content. not ideal but ok for now */}
      <Toolbar />
    </>
  );
};

export default Header;
