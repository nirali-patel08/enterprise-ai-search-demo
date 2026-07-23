import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { cn } from "@/lib/utils";

const MODAL_BACKDROP = {
  sx: {
    backgroundColor: "rgba(40, 36, 30, 0.35)",
    backdropFilter: "blur(6px)",
  },
};

type WorkflowStudioModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  wide?: boolean;
  titleId?: string;
  children: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
};

export function WorkflowStudioModal({
  open,
  onClose,
  title,
  eyebrow,
  icon,
  wide = false,
  titleId,
  children,
  footer,
  footerClassName,
}: WorkflowStudioModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        backdrop: MODAL_BACKDROP,
        paper: {
          className: "ds-modal-paper m-4",
          sx: {
            width: wide ? "min(560px, calc(100vw - 32px))" : "min(520px, calc(100vw - 32px))",
            maxWidth: wide ? 560 : 520,
            overflow: "hidden",
          },
        },
      }}
    >
      <div className="flex flex-col overflow-hidden">
        <header className="ds-modal-header">
          <div className="ds-modal-header__inner">
            <div className="flex min-w-0 items-center gap-3">
              {icon ? (
                <span className="ds-modal-header__icon" aria-hidden>
                  {icon}
                </span>
              ) : null}
              <div className="min-w-0">
                {eyebrow ? <p className="ds-modal-header__eyebrow">{eyebrow}</p> : null}
                <h2 id={titleId} className="ds-modal-header__title truncate">
                  {title}
                </h2>
              </div>
            </div>
            <button type="button" aria-label="Close" className="ds-modal-close" onClick={onClose}>
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </header>

        <div className="ds-modal-body">{children}</div>

        {footer ? (
          <footer className={cn("ds-modal-footer flex flex-wrap items-center gap-x-3 gap-y-1.5", footerClassName)}>
            {footer}
          </footer>
        ) : null}
      </div>
    </Dialog>
  );
}
