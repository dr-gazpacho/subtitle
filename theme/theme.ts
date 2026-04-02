import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#9c27b0",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    warning: {
      light: "#fff59d",
      main: "#fbc02d",
    },
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif",
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
