import { styled } from "@mui/material";

// small styled component to use to show "highlighted word"
const StyledWord = styled("span")<{ active?: boolean }>(
  ({ theme, active }) => ({
    cursor: "pointer",
    padding: "0 2px",
    borderRadius: "4px",
    transition: "all 150ms ease-in-out",
    display: "inline-block",
    // active word will get the highlight and slightly darker text, inactive word gets suble grey hover effect
    ...(active
      ? {
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.common.black,
          boxShadow: theme.shadows[1],
          zIndex: 1,
        }
      : {
          color: theme.palette.text.secondary,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
            color: theme.palette.text.primary,
          },
        }),
  }),
);

export default StyledWord;
