import { Alert, Snackbar, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { type ToastMessage, registerToastHandler } from "@/lib/toast";

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    registerToastHandler((msg) => setToasts((prev) => [...prev, msg]));
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <Stack spacing={1}>
      {toasts.map((t) => (
        <Snackbar key={t.id} open autoHideDuration={3000} onClose={() => dismiss(t.id)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity={t.severity} onClose={() => dismiss(t.id)} variant="filled" sx={{ minWidth: 280 }}>
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
}
