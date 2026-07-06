import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#34300B",
      dark: "#000",
      light: "#fdba74",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#FCCF0C",
      dark: "#B38900",
    },
    error: {
      main: "#ef4444",
    },
    background: {
      default: "#f8f8fb",
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*": { boxSizing: "border-box" },
        "html, body": { height: "100%", margin: 0, padding: 0 },
        "#root": { height: "100%", width: "100%" },
      },
    },
  },
});
