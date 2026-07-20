import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#F2760A",
      dark: "#EA580C",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#D4A94A",
      dark: "#7A6A3E",
    },
    error: {
      main: "#ef4444",
    },
    background: {
      default: "#F0EFEB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#6B6D76",
    },
  },
  typography: {
    fontFamily:
      '"Public Sans", -apple-system, blinkmacsystemfont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 10, cursor: "pointer" },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: { cursor: "pointer" },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { cursor: "pointer" },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: { cursor: "pointer" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { cursor: "pointer" },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { cursor: "pointer" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: "rgba(255, 255, 255, 0.55)",
          fontSize: 14,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.10)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.10)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 0, 0, 0.10)",
            borderWidth: 1,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "#372900",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily:
            '"Public Sans", -apple-system, blinkmacsystemfont, "Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
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
