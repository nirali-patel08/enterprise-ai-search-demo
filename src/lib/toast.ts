type ToastSeverity = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  severity: ToastSeverity;
}

let addToast: ((msg: ToastMessage) => void) | null = null;

export function registerToastHandler(fn: (msg: ToastMessage) => void) {
  addToast = fn;
}

function emit(message: string, severity: ToastSeverity) {
  addToast?.({ id: Date.now() + Math.random(), message, severity });
}

export const toast = {
  success: (message: string) => emit(message, "success"),
  error: (message: string) => emit(message, "error"),
  warning: (message: string) => emit(message, "warning"),
  info: (message: string) => emit(message, "info"),
};
