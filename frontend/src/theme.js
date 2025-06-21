import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00B15E", // Green
    },
    secondary: {
      main: "#ff9800", // Orange
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    h3: { fontSize: "1.75rem", fontWeight: 500 },
    body1: { fontSize: "1rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "10px 20px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1976d2",
        },
      },
    },
  },
});

export default theme;
